import { describe, expect, it } from "vitest";
import {
  flattenDisplayState,
  operatorCommandFeedback,
  UNVERIFIED_STATUS_MESSAGE,
} from "./operatorCommands";

describe("flattenDisplayState", () => {
  it("does not treat an accepted RPC as flat while position remains", () => {
    expect(
      flattenDisplayState(
        { accepted: true, state: "completed" },
        [{ symbol: "BTCUSDT", quantity: "0.002" }],
      ),
    ).toBe("in_progress");
  });

  it("is completed only when RPC completed and positions are empty", () => {
    expect(
      flattenDisplayState({ accepted: true, state: "completed" }, []),
    ).toBe("completed");
    expect(
      flattenDisplayState(
        { accepted: true, state: "completed" },
        [{ symbol: "BTCUSDT", quantity: "0" }],
      ),
    ).toBe("completed");
  });

  it("keeps failed RPC failed even if positions are empty", () => {
    expect(flattenDisplayState({ accepted: false, state: "failed" }, [])).toBe(
      "failed",
    );
  });
});

const verifiedEmpty = { status: "ok" as const, positions: [] };

describe("operatorCommandFeedback", () => {
  it("treats accepted=false as an error for Pause, CancelWorking, Resume, and Flatten", () => {
    const actions = [
      "PauseEntries",
      "CancelWorking",
      "FlattenAndPause",
      "Resume",
    ] as const;
    for (const action of actions) {
      const fb = operatorCommandFeedback(
        action,
        {
          accepted: false,
          state: "failed",
          message: "REST GET /open_orders failed",
        },
        verifiedEmpty,
      );
      expect(fb.kind).toBe("error");
      expect(fb.toast).toBe("REST GET /open_orders failed");
      expect(fb.status.toLowerCase()).toContain("failed");
      expect(fb.status).toContain("REST GET /open_orders failed");
    }
  });

  it("treats state=failed as an error even if accepted is true", () => {
    const fb = operatorCommandFeedback(
      "CancelWorking",
      { accepted: true, state: "failed", message: "venue verification failed" },
      verifiedEmpty,
    );
    expect(fb.kind).toBe("error");
    expect(fb.toast).toBe("venue verification failed");
  });

  it("shows in_progress as progress, not success", () => {
    const fb = operatorCommandFeedback(
      "FlattenAndPause",
      { accepted: true, state: "in_progress", message: "reduce-only in flight" },
      {
        status: "ok",
        positions: [{ symbol: "BTCUSDT", quantity: "0.001" }],
      },
    );
    expect(fb.kind).toBe("progress");
    expect(fb.toast.toLowerCase()).not.toContain("success");
    expect(fb.status.toLowerCase()).toContain("in_progress");
  });

  it("does not declare flatten complete from a failed or empty refresh", () => {
    const rpc = {
      accepted: true,
      state: "completed",
      message: "flatten accepted",
    };
    const failed = operatorCommandFeedback("FlattenAndPause", rpc, {
      status: "failed",
    });
    expect(failed.kind).toBe("progress");
    expect(failed.toast).toContain(UNVERIFIED_STATUS_MESSAGE);
    expect(failed.status).toContain("Not treated as flat");

    const empty = operatorCommandFeedback("FlattenAndPause", rpc, {
      status: "empty",
    });
    expect(empty.kind).toBe("progress");
    expect(empty.toast).toContain(UNVERIFIED_STATUS_MESSAGE);
  });

  it("does not toast success for flatten even when positions are currently empty", () => {
    const fb = operatorCommandFeedback(
      "FlattenAndPause",
      { accepted: true, state: "completed", message: "flatten accepted" },
      verifiedEmpty,
    );
    expect(fb.kind).not.toBe("success");
    expect(fb.toast.toLowerCase()).toContain("not proof");
  });

  it("keeps a successful Pause distinct from a failed refresh", () => {
    const fb = operatorCommandFeedback(
      "PauseEntries",
      { accepted: true, state: "completed", message: "entries paused" },
      { status: "failed" },
    );
    expect(fb.kind).toBe("error");
    expect(fb.toast).toContain(UNVERIFIED_STATUS_MESSAGE);
    expect(fb.status).toContain("accepted");
  });
});
