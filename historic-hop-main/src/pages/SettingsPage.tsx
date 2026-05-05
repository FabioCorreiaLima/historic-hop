import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Bell, Moon, Volume2, Globe } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0c] pt-24 px-6 pb-12 text-white">
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in-up">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase flex items-center gap-4">
            <Settings className="w-10 h-10 text-primary" /> Configurações
          </h1>
          <p className="text-muted-foreground font-medium mt-2">Personalize sua experiência no Historic Hop.</p>
        </div>

        <div className="grid gap-4">
          <SettingItem icon={Bell} title="Notificações" description="Receba alertas sobre novos conteúdos e ranking." defaultChecked />
          <SettingItem icon={Volume2} title="Efeitos Sonoros" description="Sons durante os jogos e interações." defaultChecked />
          <SettingItem icon={Moon} title="Modo Escuro" description="Ajusta a interface para ambientes escuros." defaultChecked />
          <SettingItem icon={Globe} title="Idioma" description="Português (Brasil)" />
        </div>

        <Card className="p-8 rounded-[2.5rem] border-rose-500/20 bg-rose-500/5">
          <h3 className="text-rose-500 font-black tracking-tight mb-2">Zona de Perigo</h3>
          <p className="text-xs text-muted-foreground mb-6 font-medium">Uma vez que você apagar sua conta, não há volta. Por favor, tenha certeza.</p>
          <Button variant="destructive" className="duo-btn duo-btn-danger w-full h-12">Excluir Minha Conta</Button>
        </Card>
      </div>
    </div>
  );
}

function SettingItem({ icon: Icon, title, description, defaultChecked }: any) {
  return (
    <Card className="p-6 rounded-3xl border-border/50 bg-card/50 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="font-bold text-sm leading-none">{title}</p>
          <p className="text-xs text-muted-foreground mt-1 font-medium">{description}</p>
        </div>
      </div>
      {defaultChecked !== undefined && <Switch defaultChecked={defaultChecked} />}
      {defaultChecked === undefined && <Button variant="ghost" size="sm" className="font-bold text-[10px] uppercase">Alterar</Button>}
    </Card>
  );
}
