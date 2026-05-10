import { Edit, Trash2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PeriodTableProps {
  periods: any[];
  onEdit: (period: any) => void;
  onDelete: (id: string) => void;
  onViewActivities: (id: string) => void;
}

export function PeriodTable({ periods, onEdit, onDelete, onViewActivities }: PeriodTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[80px]">Ref</TableHead>
          <TableHead>Nome do Período</TableHead>
          <TableHead className="w-[120px]">Ano/Era</TableHead>
          <TableHead className="w-[150px] text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {periods.map((period) => (
          <TableRow key={period.id} className="group">
            <TableCell>
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-quiz-bg border border-quiz-border flex items-center justify-center text-xl md:text-2xl shadow-inner group-hover:border-quiz-primary/30 transition-all">
                {period.emoji}
              </div>
            </TableCell>
            <TableCell>
              <p className="font-black text-sm md:text-base text-quiz-text-main uppercase tracking-tight">{period.name}</p>
              <p className="text-[10px] md:text-xs text-quiz-text-muted font-medium truncate max-w-[200px] md:max-w-md">{period.description}</p>
            </TableCell>
            <TableCell>
              <span className="inline-flex px-2 md:px-3 py-1 rounded-full bg-quiz-primary/10 border border-quiz-primary/20 text-quiz-primary text-[10px] md:text-xs font-black">
                {period.years}
              </span>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1 md:gap-2">
                <Button variant="ghost" size="icon" onClick={() => onViewActivities(period.id)} className="h-9 w-9 md:h-10 md:w-10 hover:bg-quiz-primary/10">
                  <BookOpen className="w-4 h-4 text-quiz-primary" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onEdit(period)} className="h-9 w-9 md:h-10 md:w-10">
                  <Edit className="w-4 h-4 text-quiz-text-muted" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(period.id)} className="h-9 w-9 md:h-10 md:w-10 hover:bg-quiz-wrong/10">
                  <Trash2 className="w-4 h-4 text-quiz-wrong" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
