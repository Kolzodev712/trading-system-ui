import { describe, expect, it } from "vitest";
import {
  dexAssetLabel,
  dexQuotePriceDisplay,
  findCollateralBalance,
  levelEnabledIndicator,
  levelStatusVisual,
  pnlClassName,
  stripFixed,
  truncateMiddle,
  wrapFixed,
} from "@/api/transforms";
import { matchesPool, normalizePool } from "@/lib/dexPool";
import { configIdFromExpanded } from "@/lib/levelId";
import { validateCreateLevelForm } from "@/lib/validation";
import { omitUnsetDecimal } from "@/api/tradingCliService";

describe("levelEnabledIndicator", () => {
  it("matches TUI rules", () => {
    expect(levelEnabledIndicator(false, true)).toBe("disabled");
    expect(levelEnabledIndicator(true, true)).toBe("active");
    expect(levelEnabledIndicator(true, false)).toBe("paused");
  });
});

describe("levelStatusVisual", () => {
  it("maps statuses", () => {
    expect(levelStatusVisual("Posted").icon).toBe("●");
    expect(levelStatusVisual("Filled").className).toContain("green");
    expect(levelStatusVisual("Cancelled").className).toContain("red");
  });
});

describe("pnlClassName", () => {
  it("colors negative red", () => {
    expect(pnlClassName("-1.5")).toContain("red");
    expect(pnlClassName("1.5")).toContain("green");
  });
});

describe("Fixed price helpers", () => {
  it("strips and wraps Fixed()", () => {
    expect(stripFixed("Fixed(100.5)")).toBe("100.5");
    expect(wrapFixed("0.1")).toBe("Fixed(0.1)");
  });
});

describe("configIdFromExpanded", () => {
  it("extracts config id", () => {
    expect(configIdFromExpanded("my_level_BTCUSDT")).toBe("my_level");
  });
});

describe("validateCreateLevelForm", () => {
  it("requires core fields", () => {
    expect(
      validateCreateLevelForm({
        levelId: "",
        symbolBase: "BTC",
        symbolQuote: "USDT",
        side: "Buy",
        orderType: "Limit",
        enabled: true,
        price: "1",
        quantity: "1",
        riskLimit: "0",
        maxPosition: "0",
        repostOnFill: false,
        repostOnCancel: false,
      }),
    ).toBe("Level ID is required");
  });
});

describe("omitUnsetDecimal", () => {
  it("drops empty and zero defaults the UI used to send", () => {
    expect(omitUnsetDecimal("")).toBe("");
    expect(omitUnsetDecimal("0")).toBe("");
    expect(omitUnsetDecimal("0.0")).toBe("");
    expect(omitUnsetDecimal("0.01")).toBe("0.01");
  });
});

describe("findCollateralBalance", () => {
  it("prefers USDT", () => {
    expect(
      findCollateralBalance([
        { asset: "BTC", total: "1" },
        { asset: "USDT", total: "500" },
      ]),
    ).toBe("500");
  });
});

describe("dex transforms", () => {
  it("resolves asset labels", () => {
    expect(dexAssetLabel("0xabc::SUI::SUI", { "0xabc::SUI::SUI": "SUI" })).toBe("SUI");
    expect(dexAssetLabel("0xabc::SUI::SUI", {})).toBe("SUI");
  });

  it("prefers resolved quote price", () => {
    expect(dexQuotePriceDisplay("3.50", "Binding")).toBe("3.50");
    expect(dexQuotePriceDisplay("", "Binding")).toBe("Binding");
  });

  it("truncates long ids", () => {
    expect(truncateMiddle("abcdefghijklmnop", 4, 3)).toBe("abcd…nop");
  });
});

describe("dex pool matching", () => {
  it("normalizes slash pools", () => {
    expect(normalizePool("SUI/DBUSDC")).toBe("SUI_DBUSDC");
  });

  it("matches pool to tab label", () => {
    expect(matchesPool("SUI_DBUSDC", "SUI/DBUSDC")).toBe(true);
    expect(matchesPool("OTHER", "SUI/DBUSDC")).toBe(false);
  });
});
