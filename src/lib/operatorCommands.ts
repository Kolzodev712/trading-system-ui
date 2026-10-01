export type OperatorAction =
  | "PauseEntries"
  | "CancelWorking"
  | "FlattenAndPause"
  | "Resume";

export interface OperatorCommandView {
  accepted: boolean;
  state: string;
  message: string;
  venue: string;
  environment: string;
  scope: string;
  orderIds: string[];
}

export interface FlattenPositionView {
  symbol: string;
  quantity: string;
}

export type OperatorFeedbackKind = "error" | "progress" | "success";

export interface OperatorFeedback {
  kind: OperatorFeedbackKind;
  toast: string;
  status: string;
}

/** Unary refresh is independent of the command RPC. Never reuse an older snapshot. */
export type MonitoringRefresh =
  | { status: "ok"; positions: FlattenPositionView[] }
  | { status: "empty" }
  | { status: "failed" };

export const UNVERIFIED_STATUS_MESSAGE = "Current status could not be verified.";

export function rpcCommandFailed(
  rpc: Pick<OperatorCommandView, "accepted" | "state">,
): boolean {
  return !rpc.accepted || rpc.state.toLowerCase() === "failed";
}

/** RPC success is never enough to call the account flat. */
export function flattenDisplayState(
  rpc: Pick<OperatorCommandView, "accepted" | "state">,
  positions: FlattenPositionView[],
): "failed" | "in_progress" | "completed" | "accepted" {
  if (rpcCommandFailed(rpc)) return "failed";
  const open = positions.some((p) => {
    const n = Number(p.quantity);
    return Number.isFinite(n) && Math.abs(n) > 1e-6;
  });
  if (open) return "in_progress";
  if (rpc.state === "completed") return "completed";
  if (rpc.state === "in_progress") return "in_progress";
  return "accepted";
}

function runnerMessage(
  action: OperatorAction,
  rpc: Pick<OperatorCommandView, "state" | "message">,
): string {
  const trimmed = (rpc.message || "").trim();
  if (trimmed) return trimmed;
  return `${operatorActionLabel(action)} ${rpc.state || "unknown"}`;
}

/**
 * Toast + visible status for an operator RPC. `accepted=false` / `state=failed`
 * are always errors. Flatten never uses success: an accepted RPC is not flat.
 * A failed or empty refresh must not complete flatten from an older snapshot.
 */
export function operatorCommandFeedback(
  action: OperatorAction,
  rpc: Pick<OperatorCommandView, "accepted" | "state" | "message">,
  refresh: MonitoringRefresh,
): OperatorFeedback {
  const label = operatorActionLabel(action);
  const msg = runnerMessage(action, rpc);

  if (rpcCommandFailed(rpc)) {
    return {
      kind: "error",
      toast: msg,
      status: `${label} failed: ${msg}`,
    };
  }

  const unverified = refresh.status !== "ok";

  if (action === "FlattenAndPause") {
    if (unverified) {
      return {
        kind: "progress",
        toast: `${msg}. ${UNVERIFIED_STATUS_MESSAGE}`,
        status: `${label} accepted; ${UNVERIFIED_STATUS_MESSAGE} Not treated as flat.`,
      };
    }
    const shown = flattenDisplayState(rpc, refresh.positions);
    if (shown === "failed") {
      return {
        kind: "error",
        toast: msg,
        status: `${label} failed: ${msg}`,
      };
    }
    if (shown === "completed") {
      return {
        kind: "progress",
        toast: `${msg}. Positions currently empty. This is not proof the account is flat.`,
        status: `${label} in progress: positions currently empty. Not treated as flat.`,
      };
    }
    return {
      kind: "progress",
      toast: `Flatten ${shown}: ${msg}. Positions still open are not treated as flat.`,
      status: `${label} ${shown}: ${msg}`,
    };
  }

  if (rpc.state.toLowerCase() === "in_progress") {
    if (unverified) {
      return {
        kind: "progress",
        toast: `${msg}. ${UNVERIFIED_STATUS_MESSAGE}`,
        status: `${label} in progress; ${UNVERIFIED_STATUS_MESSAGE}`,
      };
    }
    return {
      kind: "progress",
      toast: msg,
      status: `${label} in progress: ${msg}`,
    };
  }

  if (unverified) {
    return {
      kind: "error",
      toast: `${msg}. ${UNVERIFIED_STATUS_MESSAGE}`,
      status: `${label} accepted; ${UNVERIFIED_STATUS_MESSAGE}`,
    };
  }

  return {
    kind: "success",
    toast: msg,
    status: `${label} ${rpc.state}: ${msg}`,
  };
}

export function operatorActionLabel(action: OperatorAction): string {
  switch (action) {
    case "PauseEntries":
      return "Pause entries";
    case "CancelWorking":
      return "Cancel working";
    case "FlattenAndPause":
      return "Flatten and pause";
    case "Resume":
      return "Resume";
  }
}

export function operatorActionConsequence(action: OperatorAction): string {
  switch (action) {
    case "PauseEntries":
      return "Evaluation continues. Exposure increases stop. Working orders are not cancelled. This is not the global trading toggle.";
    case "CancelWorking":
      return "Working orders are cancelled and entries stay paused. Cancel/fill races must reconcile before treating the book as empty.";
    case "FlattenAndPause":
      return "Latch target zero until Resume. Conflicting working orders are cancelled and reduce-only exits are submitted. A successful RPC is not a flat account.";
    case "Resume":
      return "Clears PauseEntries and the flatten latch. Does not enable the legacy global toggle.";
  }
}

export function newOperatorRequestId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `op-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
