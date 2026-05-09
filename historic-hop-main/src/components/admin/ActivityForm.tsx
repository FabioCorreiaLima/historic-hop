import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, Sparkles, Plus, Trash2 } from "lucide-react";
import { adminService } from "@/services/adminService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ActivityFormProps {
  periods: any[];
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function ActivityForm({ periods, initialData, onSubmit, onCancel }: ActivityFormProps) {
  const { session } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [type, setType] = useState(initialData?.type || "quiz");
  const [periodId, setPeriodId] = useState(initialData?.periodId || "");
  const [level, setLevel] = useState(initialData?.level || 1);
  const [difficulty, setDifficulty] = useState(initialData?.difficulty || "Fácil");
  const [content, setContent] = useState<any>(initialData?.content || {});

  useEffect(() => {
    if (!initialData && type) {
      // Reset content based on type when creating new
      const defaultContents: Record<string, any> = {
        quiz: { question: "", options: ["", "", "", ""], correctIndex: 0, explanation: "" },
        true_false: { statement: "", isTrue: true, explanation: "" },
        chronological: { instruction: "Ordene os eventos cronologicamente", events: [{ text: "", year: "", description: "" }], explanation: "" },
        fill_blank: { textWithBlanks: "", blanks: [""], options: [""], explanation: "" },
        matching: { instruction: "Associe os itens", pairs: [{ left: "", right: "" }], explanation: "" }
      };
      setContent(defaultContents[type] || {});
    }
  }, [type, initialData]);

  const handleGenerateAI = async () => {
    if (!periodId) return toast.error("Selecione um período primeiro");
    setIsGenerating(true);
    try {
      const data = await adminService.generateWithAI(session?.access_token || "", periodId, type, level);
      setContent(data);
      toast.success("Conteúdo gerado com IA!");
    } catch (error) {
      toast.error("Erro ao gerar com IA");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: initialData?.id,
      type,
      periodId,
      level,
      difficulty,
      content
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-quiz-bg/50 p-4 rounded-xl border border-quiz-border">
        <div className="space-y-2">
          <Label>Tipo de Atividade</Label>
          <Select value={type} onValueChange={setType} disabled={!!initialData}>
            <SelectTrigger className="bg-quiz-bg border-quiz-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="quiz">Quiz (Múltipla Escolha)</SelectItem>
              <SelectItem value="true_false">Verdadeiro ou Falso</SelectItem>
              <SelectItem value="chronological">Ordenação Cronológica</SelectItem>
              <SelectItem value="fill_blank">Completar Lacunas</SelectItem>
              <SelectItem value="matching">Associação (Colunas)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Período Histórico</Label>
          <Select value={periodId} onValueChange={setPeriodId}>
            <SelectTrigger className="bg-quiz-bg border-quiz-border">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {periods.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Nível (1-18)</Label>
          <Input 
            type="number" 
            min="1" max="18" 
            value={level} 
            onChange={e => setLevel(parseInt(e.target.value))} 
            className="bg-quiz-bg border-quiz-border"
          />
        </div>

        <div className="flex items-end">
          <Button 
            type="button" 
            onClick={handleGenerateAI} 
            disabled={isGenerating || !periodId}
            className="w-full bg-quiz-surface border border-quiz-primary/30 text-quiz-primary hover:bg-quiz-primary/10"
          >
            {isGenerating ? "Gerando..." : <><Sparkles className="w-4 h-4 mr-2" /> Gerar com IA</>}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {type === "quiz" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Pergunta</Label>
              <Textarea 
                value={content.question} 
                onChange={e => setContent({...content, question: e.target.value})} 
                className="bg-quiz-bg border-quiz-border"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {content.options?.map((opt: string, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-bold border-2 ${content.correctIndex === i ? 'bg-quiz-correct border-quiz-correct text-black' : 'border-quiz-border'}`} onClick={() => setContent({...content, correctIndex: i})}>
                    {String.fromCharCode(65 + i)}
                  </div>
                  <Input 
                    value={opt} 
                    onChange={e => {
                      const newOpts = [...content.options];
                      newOpts[i] = e.target.value;
                      setContent({...content, options: newOpts});
                    }}
                    className="bg-quiz-bg border-quiz-border"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {type === "true_false" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Afirmação</Label>
              <Textarea 
                value={content.statement} 
                onChange={e => setContent({...content, statement: e.target.value})} 
                className="bg-quiz-bg border-quiz-border"
              />
            </div>
            <div className="flex gap-4">
              <Button 
                type="button" 
                variant={content.isTrue ? "default" : "outline"}
                className={content.isTrue ? "bg-quiz-correct text-black" : ""}
                onClick={() => setContent({...content, isTrue: true})}
              >Verdadeiro</Button>
              <Button 
                type="button" 
                variant={!content.isTrue ? "default" : "outline"}
                className={!content.isTrue ? "bg-quiz-wrong text-white" : ""}
                onClick={() => setContent({...content, isTrue: false})}
              >Falso</Button>
            </div>
          </div>
        )}

        {type === "chronological" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Instrução</Label>
              <Input value={content.instruction} onChange={e => setContent({...content, instruction: e.target.value})} className="bg-quiz-bg border-quiz-border" />
            </div>
            <div className="space-y-3">
              {content.events?.map((ev: any, i: number) => (
                <div key={i} className="flex gap-2 p-3 bg-quiz-bg border border-quiz-border rounded-lg">
                  <Input placeholder="Ano" value={ev.year} onChange={e => {
                    const next = [...content.events];
                    next[i].year = e.target.value;
                    setContent({...content, events: next});
                  }} className="w-24" />
                  <Input placeholder="Evento" value={ev.text} onChange={e => {
                    const next = [...content.events];
                    next[i].text = e.target.value;
                    setContent({...content, events: next});
                  }} className="flex-1" />
                  <Button type="button" variant="ghost" size="sm" onClick={() => {
                    const next = content.events.filter((_: any, idx: number) => idx !== i);
                    setContent({...content, events: next});
                  }}><Trash2 className="w-4 h-4 text-quiz-wrong" /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => setContent({...content, events: [...content.events, {text: "", year: "", description: ""}]})}>
                <Plus className="w-4 h-4 mr-2" /> Add Evento
              </Button>
            </div>
          </div>
        )}

        {type === "fill_blank" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Texto com __BLANK__</Label>
              <Textarea 
                value={content.textWithBlanks} 
                onChange={e => setContent({...content, textWithBlanks: e.target.value})} 
                className="bg-quiz-bg border-quiz-border h-32"
                placeholder="Ex: Em 1500, __BLANK__ chegou ao Brasil."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Respostas (blanks)</Label>
                <Input value={content.blanks?.join(", ")} onChange={e => setContent({...content, blanks: e.target.value.split(",").map(s => s.trim())})} placeholder="Separadas por vírgula" />
              </div>
              <div className="space-y-2">
                <Label>Todas Opções (opções extras)</Label>
                <Input value={content.options?.join(", ")} onChange={e => setContent({...content, options: e.target.value.split(",").map(s => s.trim())})} placeholder="Separadas por vírgula" />
              </div>
            </div>
          </div>
        )}

        {type === "matching" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Instrução</Label>
              <Input value={content.instruction} onChange={e => setContent({...content, instruction: e.target.value})} className="bg-quiz-bg border-quiz-border" />
            </div>
            <div className="space-y-3">
              {content.pairs?.map((p: any, i: number) => (
                <div key={i} className="flex gap-2 p-3 bg-quiz-bg border border-quiz-border rounded-lg">
                  <Input placeholder="Esquerda" value={p.left} onChange={e => {
                    const next = [...content.pairs];
                    next[i].left = e.target.value;
                    setContent({...content, pairs: next});
                  }} className="flex-1" />
                  <Input placeholder="Direita" value={p.right} onChange={e => {
                    const next = [...content.pairs];
                    next[i].right = e.target.value;
                    setContent({...content, pairs: next});
                  }} className="flex-1" />
                  <Button type="button" variant="ghost" size="sm" onClick={() => {
                    const next = content.pairs.filter((_: any, idx: number) => idx !== i);
                    setContent({...content, pairs: next});
                  }}><Trash2 className="w-4 h-4 text-quiz-wrong" /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => setContent({...content, pairs: [...content.pairs, {left: "", right: ""}]})}>
                <Plus className="w-4 h-4 mr-2" /> Add Par
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label>Explicação Histórica (Feedback)</Label>
          <Textarea 
            value={content.explanation} 
            onChange={e => setContent({...content, explanation: e.target.value})} 
            className="bg-quiz-bg border-quiz-border"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-quiz-border">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" className="bg-quiz-primary text-black hover:bg-quiz-primary-dark font-black px-8">
          {initialData ? "Atualizar Atividade" : "Salvar Atividade"}
        </Button>
      </div>
    </form>
  );
}
