import { Edit, Trash2, Copy, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ActivityTableProps {
  activities: any[];
  periods: any[];
  onEdit: (activity: any) => void;
  onDelete: (id: string) => void;
  onDuplicate: (activity: any) => void;
}

export function ActivityTable({ activities, periods, onEdit, onDelete, onDuplicate }: ActivityTableProps) {
  const getPeriodName = (id: string) => periods.find(p => p.id === id)?.name || id;

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      quiz: "Quiz",
      true_false: "V/F",
      chronological: "Cronologia",
      fill_blank: "Lacunas",
      matching: "Associação"
    };
    return types[type] || type;
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-quiz-border">
      <table className="w-full text-left border-collapse">
        <thead className="bg-quiz-surface text-quiz-text-muted text-xs uppercase tracking-widest">
          <tr>
            <th className="p-4 font-black">Tipo</th>
            <th className="p-4 font-black">Pergunta / Texto</th>
            <th className="p-4 font-black">Período</th>
            <th className="p-4 font-black text-center">Nível</th>
            <th className="p-4 font-black text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-quiz-border">
          {activities.map((activity) => (
            <tr key={activity.id} className="hover:bg-quiz-surface/50 transition-colors">
              <td className="p-4">
                <Badge variant="outline" className="bg-quiz-bg border-quiz-primary/30 text-quiz-primary uppercase text-[10px]">
                  {getTypeLabel(activity.type)}
                </Badge>
              </td>
              <td className="p-4">
                <div className="max-w-md truncate font-medium text-quiz-text-main">
                  {activity.content?.question || activity.content?.statement || activity.content?.instruction || activity.content?.textWithBlanks || "---"}
                </div>
              </td>
              <td className="p-4 text-quiz-text-muted text-sm">{getPeriodName(activity.periodId)}</td>
              <td className="p-4 text-center">
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-quiz-bg rounded-lg border border-quiz-border text-xs font-bold">
                  <Zap className="w-3 h-3 text-quiz-primary" /> {activity.level}
                </div>
              </td>
              <td className="p-4 text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onDuplicate(activity)} title="Duplicar">
                    <Copy className="w-4 h-4 text-quiz-primary" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onEdit(activity)} title="Editar">
                    <Edit className="w-4 h-4 text-quiz-text-muted" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(activity.id)} title="Excluir">
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
