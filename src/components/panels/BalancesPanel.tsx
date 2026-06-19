import type { Balance } from "@/gen/trading_cli_pb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/shared/DataTable";

export function BalancesPanel({ balances }: { balances: Balance[] }) {
  return (
    <Card className="h-full flex flex-col min-h-0">
      <CardHeader>
        <CardTitle>Balances</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 overflow-hidden">
        <DataTable
          maxRows={10}
          data={balances}
          emptyMessage="No balance data"
          columns={[
            { key: "asset", header: "Asset", render: (b) => b.asset },
            { key: "free", header: "Free", render: (b) => b.free },
            { key: "used", header: "Used", render: (b) => b.used },
            { key: "total", header: "Total", render: (b) => b.total },
          ]}
        />
      </CardContent>
    </Card>
  );
}
