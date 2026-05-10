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
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead className="bg-quiz-surface/50 text-quiz-text-muted text-[10px] md:text-xs uppercase tracking-[0.2em]">
          <tr>
            <th className="px-4 md:px-6 py-4 font-black">Modalidade</th>
            <th className="px-4 md:px-6 py-4 font-black">Enunciado / Pergunta</th>
            <th className="px-4 md:px-6 py-4 font-black">Era Histórica</th>
            <th className="px-4 md:px-6 py-4 font-black text-center">Nível</th>
            <th className="px-4 md:px-6 py-4 font-black text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-quiz-border">
          {activities.map((activity) => (
            <tr key={activity.id} className="hover:bg-quiz-surface transition-colors group">
              <td className="px-4 md:px-6 py-4">
                <Badge variant="outline" className="bg-quiz-bg border-quiz-primary/30 text-quiz-primary uppercase text-[9px] md:text-[10px] px-2 py-0.5">
                  {getTypeLabel(activity.type)}
                </Badge>
              </td>
              <td className="px-4 md:px-6 py-4">
                <div className="max-w-xs md:max-w-md truncate font-bold text-quiz-text-main text-sm md:text-base">
                  {activity.content?.question || activity.content?.statement || activity.content?.instruction || activity.content?.textWithBlanks || "---"}
                </div>
                <p className="text-[10px] text-quiz-text-muted mt-0.5 md:hidden">ID: {activity.id.substring(0,8)}...</p>
              </td>
              <td className="px-4 md:px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className="text-quiz-text-main font-medium text-xs md:text-sm">{getPeriodName(activity.periodId)}</span>
                </div>
              </td>
              <td className="px-4 md:px-6 py-4 text-center">
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-quiz-bg rounded-lg border border-quiz-border text-[10px] md:text-xs font-black">
                  <Zap className="w-3 h-3 text-quiz-primary" /> {activity.level}
                </div>
              </td>
              <td className="px-4 md:px-6 py-4 text-right">
                <div className="flex justify-end gap-1 md:gap-2">
                  <Button variant="ghost" size="icon" onClick={() => onDuplicate(activity)} className="h-8 w-8 md:h-10 md:w-10 hover:bg-quiz-primary/10">
                    <Copy className="w-4 h-4 text-quiz-primary" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onEdit(activity)} className="h-8 w-8 md:h-10 md:w-10 hover:bg-quiz-surface/80">
                    <Edit className="w-4 h-4 text-quiz-text-muted" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(activity.id)} className="h-8 w-8 md:h-10 md:w-10 hover:bg-quiz-wrong/10">
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
