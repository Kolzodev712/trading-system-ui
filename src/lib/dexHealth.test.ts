/**
 * @vitest-environment happy-dom
 */
import { describe, expect, it } from "vitest";
import { DexIndicator } from "@/gen/trading_cli_pb";
import { dexIndicatorHealth } from "@/lib/dexHealth";

describe("dexIndicatorHealth", () => {
  it("reports waiting when no indicators for pool", () => {
    const health = dexIndicatorHealth([], "SUI/DBUSDC");
    expect(health.status).toBe("waiting");
  });

  it("reports live with latest timestamp", () => {
    const indicators = [
      new DexIndicator({
        name: "Mid",
        pool: "SUI_DBUSDC",
        value: "1.23",
        timestamp: BigInt(1_700_000_000),
      }),
      new DexIndicator({
        name: "Spread",
        pool: "SUI_DBUSDC",
        value: "0.01",
        timestamp: BigInt(1_700_000_005),
      }),
    ];
    const health = dexIndicatorHealth(indicators, "SUI/DBUSDC");
    expect(health.status).toBe("live");
    if (health.status === "live") {
      expect(health.latestTimestamp).toBe(1_700_000_005);
    }
  });
});
