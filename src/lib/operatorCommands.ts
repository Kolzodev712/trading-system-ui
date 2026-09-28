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

/** RPC success is never enough to call the account flat. */
export function flattenDisplayState(
  rpc: Pick<OperatorCommandView, "accepted" | "state">,
  positions: FlattenPositionView[],
): "failed" | "in_progress" | "completed" | "accepted" {
  if (!rpc.accepted || rpc.state === "failed") return "failed";
  const open = positions.some((p) => {
    const n = Number(p.quantity);
    return Number.isFinite(n) && Math.abs(n) > 1e-6;
  });
  if (open) return "in_progress";
  if (rpc.state === "completed") return "completed";
  if (rpc.state === "in_progress") return "in_progress";
  return "accepted";
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
