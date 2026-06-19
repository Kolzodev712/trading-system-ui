import type { IndicatorValue } from "@/gen/trading_cli_pb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/shared/DataTable";
import { useTradingStore } from "@/store/tradingStore";

interface IndicatorsPanelProps {
  indicators: IndicatorValue[];
  showAll?: boolean;
}

export function IndicatorsPanel({ indicators, showAll = false }: IndicatorsPanelProps) {
  const expanded = useTradingStore((s) => s.overlay === "none" && showAll);
  const maxRows = showAll ? 100 : 10;

  return (
    <Card className="h-full flex flex-col min-h-0">
      <CardHeader>
        <CardTitle>
          Indicators {showAll ? `(all ${indicators.length})` : ""}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 overflow-hidden">
        <DataTable
          maxRows={expanded ? maxRows : maxRows}
          data={indicators}
          emptyMessage="No indicators"
          columns={[
            { key: "name", header: "Name", render: (i) => i.indicatorName },
            { key: "pair", header: "Pair", render: (i) => i.pair },
            { key: "value", header: "Value", render: (i) => i.value },
            { key: "period", header: "Period", render: (i) => String(i.period) },
          ]}
        />
      </CardContent>
    </Card>
  );
}
