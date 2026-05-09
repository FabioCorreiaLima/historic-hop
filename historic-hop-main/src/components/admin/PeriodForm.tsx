import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface PeriodFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function PeriodForm({ initialData, onSubmit, onCancel }: PeriodFormProps) {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    emoji: "",
    years: "",
    description: "",
    characterName: "",
    characterEmoji: "",
    image_url: "",
    color: "#eab308",
    order_index: 0
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id || "",
        name: initialData.name || "",
        emoji: initialData.emoji || "",
        years: initialData.years || "",
        description: initialData.description || "",
        characterName: initialData.charactername || initialData.characterName || "",
        characterEmoji: initialData.characteremoji || initialData.characterEmoji || "",
        image_url: initialData.image_url || initialData.imageUrl || "",
        color: initialData.color || "#eab308",
        order_index: initialData.order_index || 0
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="id">ID (ex: revolta_chibata)</Label>
          <Input 
            id="id" 
            value={formData.id} 
            onChange={e => setFormData({...formData, id: e.target.value})} 
            required 
            disabled={!!initialData}
            className="bg-quiz-bg border-quiz-border"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Nome do Período</Label>
          <Input 
            id="name" 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
            required 
            className="bg-quiz-bg border-quiz-border"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="emoji">Emoji Principal</Label>
          <Input 
            id="emoji" 
            value={formData.emoji} 
            onChange={e => setFormData({...formData, emoji: e.target.value})} 
            required 
            className="bg-quiz-bg border-quiz-border"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="years">Anos/Época</Label>
          <Input 
            id="years" 
            value={formData.years} 
            onChange={e => setFormData({...formData, years: e.target.value})} 
            required 
            className="bg-quiz-bg border-quiz-border"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição Histórica</Label>
        <Textarea 
          id="description" 
          value={formData.description} 
          onChange={e => setFormData({...formData, description: e.target.value})} 
          required 
          className="bg-quiz-bg border-quiz-border h-32"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="charName">Nome do Personagem</Label>
          <Input 
            id="charName" 
            value={formData.characterName} 
            onChange={e => setFormData({...formData, characterName: e.target.value})} 
            className="bg-quiz-bg border-quiz-border"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="charEmoji">Emoji do Personagem</Label>
          <Input 
            id="charEmoji" 
            value={formData.characterEmoji} 
            onChange={e => setFormData({...formData, characterEmoji: e.target.value})} 
            className="bg-quiz-bg border-quiz-border"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="img">URL da Imagem de Fundo</Label>
        <Input 
          id="img" 
          value={formData.image_url} 
          onChange={e => setFormData({...formData, image_url: e.target.value})} 
          className="bg-quiz-bg border-quiz-border"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" className="bg-quiz-primary text-black hover:bg-quiz-primary-dark">
          {initialData ? "Salvar Alterações" : "Criar Período"}
        </Button>
      </div>
    </form>
  );
}
