import { describe, expect, it } from "vitest";
import { flattenDisplayState } from "./operatorCommands";

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
