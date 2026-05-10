import { Edit, Trash2, Copy, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[120px]">Modalidade</TableHead>
          <TableHead>Enunciado / Pergunta</TableHead>
          <TableHead className="w-[180px]">Era Histórica</TableHead>
          <TableHead className="w-[100px] text-center">Nível</TableHead>
          <TableHead className="w-[150px] text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {activities.map((activity) => (
          <TableRow key={activity.id} className="group">
            <TableCell>
              <Badge variant="outline" className="bg-quiz-bg border-quiz-primary/30 text-quiz-primary uppercase text-[9px] md:text-[10px] px-2 py-0.5">
                {getTypeLabel(activity.type)}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="max-w-[200px] md:max-w-md truncate font-bold text-quiz-text-main text-sm md:text-base">
                {activity.content?.question || activity.content?.statement || activity.content?.instruction || activity.content?.textWithBlanks || "---"}
              </div>
            </TableCell>
            <TableCell>
              <span className="text-quiz-text-main font-medium text-xs md:text-sm uppercase tracking-tight">{getPeriodName(activity.periodId)}</span>
            </TableCell>
            <TableCell className="text-center">
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-quiz-bg rounded-lg border border-quiz-border text-[10px] md:text-xs font-black">
                <Zap className="w-3 h-3 text-quiz-primary" /> {activity.level}
              </div>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1 md:gap-2">
                <Button variant="ghost" size="icon" onClick={() => onDuplicate(activity)} className="h-9 w-9 md:h-10 md:w-10 hover:bg-quiz-primary/10">
                  <Copy className="w-4 h-4 text-quiz-primary" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onEdit(activity)} className="h-9 w-9 md:h-10 md:w-10">
                  <Edit className="w-4 h-4 text-quiz-text-muted" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(activity.id)} className="h-9 w-9 md:h-10 md:w-10 hover:bg-quiz-wrong/10">
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
