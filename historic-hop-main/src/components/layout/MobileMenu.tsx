import { useState } from "react";
import { Menu, X, Home, Trophy, ShoppingBag, Settings, History, LogOut, Shield, User as UserIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { profile, signOut } = useAuth();

  const menuItems = [
    { title: "Mapa do Tempo", icon: Home, path: "/" },
    { title: "Ranking Global", icon: Trophy, path: "/ranking" },
    { title: "Loja de Skins", icon: ShoppingBag, path: "/loja" },
    { title: "Meu Perfil", icon: UserIcon, path: "/perfil" },
    { title: "Configurações", icon: Settings, path: "/config" },
  ];

  if (profile?.is_admin) {
    menuItems.push({ title: "Painel Admin", icon: Shield, path: "/admin" });
  }

  return (
    <div className="md:hidden fixed bottom-6 right-6 z-50">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button size="icon" className="h-14 w-14 rounded-full shadow-2xl shadow-primary/40 bg-primary text-primary-foreground">
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="rounded-t-3xl p-6">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-left font-black tracking-tighter uppercase text-2xl">Menu</SheetTitle>
          </SheetHeader>
          <div className="grid gap-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-2xl transition-all",
                  location.pathname === item.path ? "bg-primary text-primary-foreground shadow-lg" : "hover:bg-secondary"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-bold text-sm">{item.title}</span>
              </Link>
            ))}
            <div className="h-px bg-border my-2" />
            <button
              onClick={() => {
                signOut();
                setOpen(false);
              }}
              className="flex items-center gap-4 p-4 rounded-2xl transition-all text-rose-500 hover:bg-rose-500/10"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-bold text-sm">Sair da Conta</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
