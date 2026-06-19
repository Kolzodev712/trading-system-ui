import { cn } from "@/lib/utils";
import { pnlClassName, sideClassName } from "@/api/transforms";

export function PnlText({ value, className }: { value: string; className?: string }) {
  return <span className={cn(pnlClassName(value), className)}>{value || "—"}</span>;
}

export function SideText({ side, className }: { side: string; className?: string }) {
  return <span className={cn(sideClassName(side), className)}>{side}</span>;
}

export function EnabledBadge({
  indicator,
}: {
  indicator: "active" | "paused" | "disabled";
}) {
  const map = {
    active: { icon: "✓", className: "text-green-400" },
    paused: { icon: "⏸", className: "text-yellow-400" },
    disabled: { icon: "✗", className: "text-red-400" },
  } as const;
  const { icon, className } = map[indicator];
  return <span className={cn("font-mono", className)}>{icon}</span>;
}
