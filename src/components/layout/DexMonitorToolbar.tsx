import {
  ArrowLeft,
  Ban,
  Power,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useControlsEnabled,
  useFilteredDexStrategies,
  useSelectedDexQuote,
  useSelectedDexStrategy,
} from "@/store/tradingStore";

interface DexMonitorToolbarProps {
  onBack: () => void;
  onRefresh: () => void;
  onToggleQuote: () => void;
  onToggleStrategy: () => void;
  onCancelPool: () => void;
  refreshing?: boolean;
  togglingQuote?: boolean;
  togglingStrategy?: boolean;
  cancelling?: boolean;
}

export function DexMonitorToolbar({
  onBack,
  onRefresh,
  onToggleQuote,
  onToggleStrategy,
  onCancelPool,
  refreshing,
  togglingQuote,
  togglingStrategy,
  cancelling,
}: DexMonitorToolbarProps) {
  const selectedQuote = useSelectedDexQuote();
  const selectedStrategy = useSelectedDexStrategy();
  const dexStrategies = useFilteredDexStrategies();
  const controlsEnabled = useControlsEnabled();
  const hasStrategies = dexStrategies.length > 0;

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-2 border-b border-border bg-card/50">
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ArrowLeft className="h-4 w-4" />
        Dashboard
      </Button>

      <div className="h-5 w-px bg-border mx-1" />

      <Button variant="outline" size="sm" onClick={onRefresh} disabled={refreshing}>
        <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
        Refresh
      </Button>

      {selectedQuote && (
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleQuote}
          disabled={togglingQuote || !controlsEnabled}
        >
          <Power className="h-4 w-4" />
          {selectedQuote.enabled ? "Disable" : "Enable"} Quote
        </Button>
      )}

      {hasStrategies && selectedStrategy && (
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleStrategy}
          disabled={togglingStrategy || !controlsEnabled}
        >
          <Power className="h-4 w-4" />
          {selectedStrategy.enabled ? "Disable" : "Enable"} Strategy
        </Button>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={onCancelPool}
        disabled={cancelling || !controlsEnabled}
      >
        <Ban className="h-4 w-4" />
        Cancel Pool Orders
      </Button>
    </div>
  );
}
