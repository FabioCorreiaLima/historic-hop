import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { User, Mail, Shield, Award } from "lucide-react";

export default function ProfilePage() {
  const { profile, user } = useAuth();

  return (
    <div className="min-h-screen bg-[#0a0a0c] pt-24 px-6 pb-12 text-white">
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in-up">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-xl">
            <User className="w-12 h-12" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase">{profile?.display_name || "Viajante"}</h1>
            <p className="text-muted-foreground font-medium">{user?.email}</p>
          </div>
        </div>

        <div className="grid gap-6">
          <Card className="p-8 rounded-[2.5rem] border-border/50 bg-card/50 backdrop-blur-sm">
            <h2 className="text-xl font-black tracking-tight mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" /> Informações da Conta
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Nome de Exibição</Label>
                <Input defaultValue={profile?.display_name || ""} className="rounded-xl h-12" readOnly />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">E-mail</Label>
                <Input defaultValue={user?.email || ""} className="rounded-xl h-12" readOnly />
              </div>
              <div className="pt-4">
                <Button className="w-full duo-btn duo-btn-primary h-12">Salvar Alterações</Button>
              </div>
            </div>
          </Card>

          <div className="p-8 rounded-[2.5rem] bg-secondary/20 border border-dashed border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Shield className="w-8 h-8 text-muted-foreground" />
              <div>
                <p className="font-bold text-sm">Privacidade & Segurança</p>
                <p className="text-xs text-muted-foreground font-medium">Gerencie sua senha e dados.</p>
              </div>
            </div>
            <Button variant="ghost" className="rounded-xl font-bold uppercase text-[10px] tracking-widest">Acessar</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
