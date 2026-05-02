import { useState, useEffect } from "react";
import { X, ShoppingBag, Check, Star, Coins } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface StoreItem {
  id: string;
  name: string;
  price: number;
  emoji: string;
  type: string;
  description: string;
}

interface Props {
  onClose: () => void;
  onSkinChange?: (skinId: string) => void;
  currentSkin?: string;
}

export default function StoreModal({ onClose, onSkinChange, currentSkin: initialSkin }: Props) {
  const { session } = useAuth();
  const [items, setItems] = useState<StoreItem[]>([]);
  const [inventory, setInventory] = useState<Set<string>>(new Set());
  const [coins, setCoins] = useState(0);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [selectedSkin, setSelectedSkin] = useState(initialSkin || "classic");

  useEffect(() => {
    loadData();
  }, [session]);

  const loadData = async () => {
    if (!session?.access_token) return;
    try {
      const [itemsData, invData] = await Promise.all([
        api.store.getItems(),
        api.store.getInventory(session.access_token)
      ]);
      setItems(itemsData);
      setInventory(new Set(invData.inventory.map((i: any) => i.item_id)));
      setCoins(invData.coins);
    } catch (error) {
      console.error("Erro ao carregar loja:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (itemId: string, price: number) => {
    if (!session?.access_token) return;
    if (coins < price) {
      toast({ title: "Saldo insuficiente!", variant: "destructive" });
      return;
    }

    setBuyingId(itemId);
    try {
      const res = await api.store.buyItem(session.access_token, itemId);
      if (res.success) {
        setCoins(prev => prev - price);
        setInventory(prev => new Set([...prev, itemId]));
        toast({ title: "Compra realizada!", description: "O item agora está no seu inventário." });
      }
    } catch (error: any) {
      toast({ title: "Erro na compra", description: error.message, variant: "destructive" });
    } finally {
      setBuyingId(null);
    }
  };

  const handleSelect = async (skinId: string) => {
    if (!session?.access_token) return;
    try {
      const res = await api.store.selectSkin(session.access_token, skinId);
      if (res.success) {
        setSelectedSkin(skinId);
        onSkinChange?.(skinId);
        toast({ title: "Avatar selecionado!", description: "Seu Pac-Man agora tem um novo visual." });
      }
    } catch (error: any) {
      toast({ title: "Erro ao selecionar", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 backdrop-blur-md bg-black/60 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-white/10 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Loja */}
        <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-primary/10 to-transparent">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Loja de Avatares</h2>
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Personalize seu Pac-Man</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="bg-white/5 px-4 py-2 rounded-2xl border border-white/5 flex items-center gap-3">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span className="text-xl font-black text-white">{coins}</span>
            </div>
            <button onClick={onClose} className="p-3 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-all">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 scrollbar-hide">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-white/20 font-black text-xs uppercase tracking-widest">Carregando Estoque...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {items.map(item => {
                const isOwned = inventory.has(item.id) || item.price === 0;
                const isSelected = selectedSkin === item.id;
                
                return (
                  <div 
                    key={item.id} 
                    className={`relative p-5 rounded-3xl border transition-all duration-300 flex flex-col gap-4 ${
                      isSelected 
                        ? 'bg-primary/10 border-primary shadow-lg shadow-primary/10' 
                        : isOwned 
                        ? 'bg-white/5 border-white/10' 
                        : 'bg-slate-800/40 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-4xl shadow-inner border border-white/5">
                        {item.emoji}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-black text-white leading-none mb-1">{item.name}</h4>
                        <p className="text-[10px] text-white/40 leading-tight">{item.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-4 border-t border-white/5">
                      {isOwned ? (
                        isSelected ? (
                          <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest px-3 py-2 bg-primary/10 rounded-xl w-full justify-center">
                            <Check className="w-3 h-3" /> Selecionado
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleSelect(item.id)}
                            className="w-full py-2 rounded-xl bg-white/10 hover:bg-white text-white hover:text-slate-950 text-[10px] font-black transition-all uppercase tracking-widest"
                          >
                            Selecionar
                          </button>
                        )
                      ) : (
                        <button
                          onClick={() => handleBuy(item.id, item.price)}
                          disabled={buyingId === item.id}
                          className="w-full py-2 rounded-xl bg-primary text-white text-[10px] font-black hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest shadow-lg shadow-primary/20"
                        >
                          {buyingId === item.id ? "Processando..." : (
                            <>Comprar <div className="flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded-md"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {item.price}</div></>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="p-6 text-center bg-black/20 border-t border-white/5">
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Ganhe mais estrelas completando fases com perfeição!</p>
        </div>
      </div>
    </div>
  );
}
