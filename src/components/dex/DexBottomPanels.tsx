import type { DexVenueSnapshot, Trade } from "@/gen/trading_cli_pb";
import {
  DexQuotesPanel,
  DexStrategiesPanel,
} from "@/components/panels/dex/DexPanels";
import { TradesPanel } from "@/components/panels/TradesPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DexBottomPanelsProps {
  dex: DexVenueSnapshot;
  poolTab: string;
  assetLabels: Record<string, string>;
  trades: Trade[];
  hasStrategies: boolean;
  selectedDexQuoteIndex: number | null;
  selectedDexStrategyIndex: number | null;
  onSelectQuote: (index: number) => void;
  onSelectStrategy: (index: number) => void;
  onQuoteDetails: () => void;
  onStrategyDetails: () => void;
}

export function DexBottomPanels({
  dex,
  poolTab,
  assetLabels,
  trades,
  hasStrategies,
  selectedDexQuoteIndex,
  selectedDexStrategyIndex,
  onSelectQuote,
  onSelectStrategy,
  onQuoteDetails,
  onStrategyDetails,
}: DexBottomPanelsProps) {
  const quotesPanel = (
    <DexQuotesPanel
      dex={dex}
      poolTab={poolTab}
      assetLabels={assetLabels}
      selectedIndex={selectedDexQuoteIndex}
      onSelect={onSelectQuote}
      onRowDoubleClick={() => onQuoteDetails()}
    />
  );

  const strategiesPanel = hasStrategies ? (
    <DexStrategiesPanel
      dex={dex}
      poolTab={poolTab}
      assetLabels={assetLabels}
      selectedIndex={selectedDexStrategyIndex}
      onSelect={onSelectStrategy}
      onRowDoubleClick={() => onStrategyDetails()}
    />
  ) : null;

  const tradesPanel = <TradesPanel trades={trades} />;

  return (
    <>
      <div className="lg:hidden min-h-[180px]">
        <Tabs defaultValue="quotes" className="h-full flex flex-col">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="quotes">Quotes</TabsTrigger>
            {hasStrategies && <TabsTrigger value="strategies">Strategies</TabsTrigger>}
            <TabsTrigger value="trades">Trades</TabsTrigger>
          </TabsList>
          <TabsContent value="quotes" className="flex-1 min-h-[140px] mt-2">
            {quotesPanel}
          </TabsContent>
          {hasStrategies && (
            <TabsContent value="strategies" className="flex-1 min-h-[140px] mt-2">
              {strategiesPanel}
            </TabsContent>
          )}
          <TabsContent value="trades" className="flex-1 min-h-[140px] mt-2">
            {tradesPanel}
          </TabsContent>
        </Tabs>
      </div>

      <div className="hidden lg:grid grid-cols-3 gap-2 min-h-[140px]">
        {quotesPanel}
        {hasStrategies ? strategiesPanel : <div />}
        {tradesPanel}
      </div>
    </>
  );
}
