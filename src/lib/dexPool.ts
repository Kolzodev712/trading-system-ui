/** Normalize orderbook tab label to pool id (SUI/DBUSDC → SUI_DBUSDC). */
export function normalizePool(tabLabel: string): string {
  return tabLabel.replace("/", "_");
}

/** Match pool-scoped DEX rows to the selected orderbook tab (TUI parity). */
export function matchesPool(entityPool: string, tabLabel: string): boolean {
  if (!entityPool || !tabLabel) return false;
  if (entityPool === tabLabel) return true;
  const normalized = normalizePool(tabLabel);
  return entityPool === normalized || entityPool.includes(tabLabel);
}

export function selectedTabLabel(
  orderbooks: readonly { pair: string }[],
  selectedIndex: number,
): string {
  if (orderbooks.length === 0) return "";
  const safe = Math.min(Math.max(0, selectedIndex), orderbooks.length - 1);
  return orderbooks[safe]?.pair ?? "";
}
