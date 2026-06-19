const ID_PATTERN = /^[a-zA-Z0-9_-]+$/;
const SYMBOL_PATTERN = /^[a-zA-Z0-9]+$/;

export interface CreateLevelFormValues {
  levelId: string;
  symbolBase: string;
  symbolQuote: string;
  side: string;
  orderType: string;
  enabled: boolean;
  price: string;
  quantity: string;
  riskLimit: string;
  maxPosition: string;
  repostOnFill: boolean;
  repostOnCancel: boolean;
}

export function validateCreateLevelForm(
  values: CreateLevelFormValues,
): string | null {
  if (!values.levelId.trim()) return "Level ID is required";
  if (!ID_PATTERN.test(values.levelId.trim())) {
    return "Level ID must be alphanumeric with _ or -";
  }
  if (!values.symbolBase.trim() || !SYMBOL_PATTERN.test(values.symbolBase.trim())) {
    return "Valid symbol base is required";
  }
  if (!values.symbolQuote.trim() || !SYMBOL_PATTERN.test(values.symbolQuote.trim())) {
    return "Valid symbol quote is required";
  }
  if (!values.price.trim()) return "Price is required";
  if (!values.quantity.trim()) return "Quantity is required";
  return null;
}

export const ORDER_TYPES = ["Limit", "Market", "PostOnly", "IoC", "FoK"] as const;

export function nextOrderType(current: string): string {
  const idx = ORDER_TYPES.indexOf(current as (typeof ORDER_TYPES)[number]);
  return ORDER_TYPES[(idx + 1) % ORDER_TYPES.length];
}

export function toggleSide(current: string): string {
  return current === "Buy" ? "Sell" : "Buy";
}
