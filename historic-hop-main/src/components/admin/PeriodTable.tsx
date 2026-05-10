import { Edit, Trash2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PeriodTableProps {
  periods: any[];
  onEdit: (period: any) => void;
  onDelete: (id: string) => void;
  onViewActivities: (id: string) => void;
}

export function PeriodTable({ periods, onEdit, onDelete, onViewActivities }: PeriodTableProps) {
  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse min-w-[600px]">
        <thead className="bg-quiz-surface/50 text-quiz-text-muted text-[10px] md:text-xs uppercase tracking-[0.2em]">
          <tr>
            <th className="px-4 md:px-6 py-4 font-black">Ref</th>
            <th className="px-4 md:px-6 py-4 font-black">Nome do Período</th>
            <th className="px-4 md:px-6 py-4 font-black">Ano/Era</th>
            <th className="px-4 md:px-6 py-4 font-black text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-quiz-border">
          {periods.map((period) => (
            <tr key={period.id} className="hover:bg-quiz-surface transition-colors group">
              <td className="px-4 md:px-6 py-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-quiz-bg border border-quiz-border flex items-center justify-center text-xl md:text-2xl shadow-inner group-hover:border-quiz-primary/30 transition-all">
                  {period.emoji}
                </div>
              </td>
              <td className="px-4 md:px-6 py-4">
                <p className="font-black text-sm md:text-base text-quiz-text-main uppercase tracking-tight">{period.name}</p>
                <p className="text-[10px] md:text-xs text-quiz-text-muted font-medium truncate max-w-[200px]">{period.description}</p>
              </td>
              <td className="px-4 md:px-6 py-4">
                <span className="inline-flex px-2 md:px-3 py-1 rounded-full bg-quiz-primary/10 border border-quiz-primary/20 text-quiz-primary text-[10px] md:text-xs font-black">
                  {period.years}
                </span>
              </td>
              <td className="px-4 md:px-6 py-4 text-right">
                <div className="flex justify-end gap-1 md:gap-2">
                  <Button variant="ghost" size="icon" onClick={() => onViewActivities(period.id)} className="h-8 w-8 md:h-10 md:w-10 hover:bg-quiz-primary/10">
                    <BookOpen className="w-4 h-4 text-quiz-primary" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onEdit(period)} className="h-8 w-8 md:h-10 md:w-10 hover:bg-quiz-surface/80">
                    <Edit className="w-4 h-4 text-quiz-text-muted" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(period.id)} className="h-8 w-8 md:h-10 md:w-10 hover:bg-quiz-wrong/10">
                    <Trash2 className="w-4 h-4 text-quiz-wrong" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
