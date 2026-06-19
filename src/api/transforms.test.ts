import { describe, expect, it } from "vitest";
import {
  findCollateralBalance,
  levelEnabledIndicator,
  levelStatusVisual,
  pnlClassName,
  stripFixed,
  wrapFixed,
} from "@/api/transforms";
import { configIdFromExpanded } from "@/lib/levelId";
import { validateCreateLevelForm } from "@/lib/validation";

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
