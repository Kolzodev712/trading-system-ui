/**
 * @vitest-environment happy-dom
 */
import { describe, expect, it } from "vitest";
import {
  DexQuote,
  DexVenueSnapshot,
  MonitoringData,
  Orderbook,
} from "@/gen/trading_cli_pb";
import { matchesPool } from "@/lib/dexPool";
import { deriveMonitorScreen } from "@/store/tradingStore";

describe("deriveMonitorScreen", () => {
  it("routes to dex when dex snapshot is present", () => {
    const data = new MonitoringData({
      dex: new DexVenueSnapshot({ venue: "deepbook" }),
      instrumentType: "Spot",
    });
    expect(deriveMonitorScreen(data)).toBe("dex");
  });

  it("routes to futures for CEX futures", () => {
    const data = new MonitoringData({ instrumentType: "Futures" });
    expect(deriveMonitorScreen(data)).toBe("futures");
  });

  it("routes to spot for CEX spot", () => {
    const data = new MonitoringData({ instrumentType: "Spot" });
    expect(deriveMonitorScreen(data)).toBe("spot");
  });
});

describe("DEX pool filter (integration)", () => {
  const quotes = [
    new DexQuote({ id: "q1", pool: "SUI_DBUSDC", side: "Buy" }),
    new DexQuote({ id: "q2", pool: "OTHER", side: "Sell" }),
  ];

  it("filters quotes by orderbook tab label", () => {
    const tab = "SUI/DBUSDC";
    const filtered = quotes.filter((q) => matchesPool(q.pool, tab));
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.id).toBe("q1");
  });

  it("resolves tab label from orderbooks index", () => {
    const orderbooks = [
      new Orderbook({ pair: "SUI/DBUSDC" }),
      new Orderbook({ pair: "ETH/USDC" }),
    ];
    expect(orderbooks[0]?.pair).toBe("SUI/DBUSDC");
    expect(matchesPool("SUI_DBUSDC", orderbooks[0]!.pair)).toBe(true);
  });
});
