import { cn } from "@/lib/utils";

interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  selectedIndex?: number | null;
  onSelect?: (index: number) => void;
  onRowDoubleClick?: (index: number) => void;
  maxRows?: number;
}

export function DataTable<T>({
  columns,
  data,
  emptyMessage = "No data",
  selectedIndex,
  onSelect,
  onRowDoubleClick,
  maxRows,
}: DataTableProps<T>) {
  const rows = maxRows ? data.slice(0, maxRows) : data;

  if (rows.length === 0) {
    return <p className="text-xs text-muted-foreground p-2">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-auto max-h-full">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            {columns.map((col) => (
              <th key={col.key} className={cn("px-2 py-1 text-left font-medium", col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={idx}
              className={cn(
                "border-b border-border/50 hover:bg-accent/50 cursor-pointer",
                selectedIndex === idx && "bg-cyan-500/20 text-cyan-100",
              )}
              onClick={() => onSelect?.(idx)}
              onDoubleClick={() => onRowDoubleClick?.(idx)}
            >
              {columns.map((col) => (
                <td key={col.key} className={cn("px-2 py-1 font-mono", col.className)}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
