export function configIdFromExpanded(expandedId: string): string {
  const lastUnderscore = expandedId.lastIndexOf("_");
  if (lastUnderscore <= 0) return expandedId;
  return expandedId.slice(0, lastUnderscore);
}

export function pairFromLevel(
  level: { config?: { symbol?: { base: string; quote: string } } },
): string {
  const symbol = level.config?.symbol;
  if (!symbol) return "N/A";
  return `${symbol.base}/${symbol.quote}`;
}
