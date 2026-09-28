import {
  ArrowLeft,
  Info,
  Pencil,
  Plus,
  Power,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMode, useSelectedLevel, useSelectedStrategy } from "@/store/tradingStore";
import { VenueModeBanner } from "@/components/layout/VenueModeBanner";

interface MonitorToolbarProps {
  onRefresh: () => void;
  onToggle: () => void;
  onDetails: () => void;
  onCreate?: () => void;
  onEdit?: () => void;
  onBack: () => void;
  refreshing?: boolean;
  toggling?: boolean;
}

export function MonitorToolbar({
  onRefresh,
  onToggle,
  onDetails,
  onCreate,
  onEdit,
  onBack,
  refreshing,
  toggling,
}: MonitorToolbarProps) {
  const mode = useMode();
  const selectedLevel = useSelectedLevel();
  const selectedStrategy = useSelectedStrategy();
  const hasSelection = mode === "strategies" ? !!selectedStrategy : !!selectedLevel;
  const isEnabled =
    mode === "strategies"
      ? (selectedStrategy?.enabled ?? false)
      : (selectedLevel?.enabled ?? false);

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-2 border-b border-border bg-card/50">
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ArrowLeft className="h-4 w-4" />
        Dashboard
      </Button>

      <div className="h-5 w-px bg-border mx-1" />
      <VenueModeBanner />
      <div className="h-5 w-px bg-border mx-1" />

      <Button variant="outline" size="sm" onClick={onRefresh} disabled={refreshing}>
        <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
        Refresh
      </Button>

      {hasSelection && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={onToggle}
            disabled={toggling}
          >
            <Power className="h-4 w-4" />
            {isEnabled ? "Disable" : "Enable"}
            {mode === "strategies" ? " Strategy" : " Level"}
          </Button>
          <Button variant="outline" size="sm" onClick={onDetails}>
            <Info className="h-4 w-4" />
            Details
          </Button>
        </>
      )}

      {mode === "levels" && (
        <>
          {onCreate && (
            <Button variant="default" size="sm" onClick={onCreate}>
              <Plus className="h-4 w-4" />
              New Level
            </Button>
          )}
          {onEdit && hasSelection && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          )}
        </>
      )}
    </div>
  );
}
