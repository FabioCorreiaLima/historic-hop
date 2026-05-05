import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
}

export function DataTable<T>({ columns, data, onRowClick, isLoading }: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full h-48 flex items-center justify-center bg-secondary/20 rounded-xl border border-dashed border-border">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
      <Table>
        <TableHeader className="bg-secondary/30">
          <TableRow className="hover:bg-transparent">
            {columns.map((column, idx) => (
              <TableHead key={idx} className={cn("text-[10px] font-black uppercase tracking-widest h-12", column.className)}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((item, rowIdx) => (
              <TableRow 
                key={rowIdx} 
                className={cn(
                  "border-border/30 transition-colors",
                  onRowClick && "cursor-pointer hover:bg-secondary/20"
                )}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column, colIdx) => (
                  <TableCell key={colIdx} className={cn("py-4 text-sm font-medium", column.className)}>
                    {column.cell 
                      ? column.cell(item) 
                      : column.accessorKey 
                        ? (item[column.accessorKey] as React.ReactNode) 
                        : null}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground font-medium text-xs italic">
                Nenhum registro encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
