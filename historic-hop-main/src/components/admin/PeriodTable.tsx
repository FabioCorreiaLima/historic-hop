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
    <div className="overflow-x-auto rounded-xl border border-quiz-border">
      <table className="w-full text-left border-collapse">
        <thead className="bg-quiz-surface text-quiz-text-muted text-xs uppercase tracking-widest">
          <tr>
            <th className="p-4 font-black">Emoji</th>
            <th className="p-4 font-black">Nome</th>
            <th className="p-4 font-black">Ano</th>
            <th className="p-4 font-black text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-quiz-border">
          {periods.map((period) => (
            <tr key={period.id} className="hover:bg-quiz-surface/50 transition-colors">
              <td className="p-4 text-2xl">{period.emoji}</td>
              <td className="p-4 font-bold text-quiz-text-main">{period.name}</td>
              <td className="p-4 text-quiz-text-muted">{period.years}</td>
              <td className="p-4 text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onViewActivities(period.id)} title="Ver Atividades">
                    <BookOpen className="w-4 h-4 text-quiz-primary" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onEdit(period)} title="Editar">
                    <Edit className="w-4 h-4 text-quiz-text-muted" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(period.id)} title="Excluir">
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
