import { Request, Response } from "express";
import { StoreRepository } from "../repositories/StoreRepository.js";

const STORE_ITEMS = [
  { id: "classic", name: "Clássico", price: 0, emoji: "🟡", type: "skin", description: "O herói original" },
  { id: "ghost", name: "Infiltrado", price: 10, emoji: "👻", type: "skin", description: "Disfarce de fantasma" },
  { id: "knight", name: "Cavaleiro", price: 25, emoji: "🛡️", type: "skin", description: "Proteção medieval" },
  { id: "ninja", name: "Ninja", price: 30, emoji: "🥷", type: "skin", description: "Mestre do sigilo" },
  { id: "king", name: "Rei", price: 50, emoji: "👑", type: "skin", description: "A nobreza histórica" },
  { id: "astronaut", name: "Astronauta", price: 40, emoji: "👨‍🚀", type: "skin", description: "Viajante do futuro" },
];

export class StoreController {
  static async getItems(req: Request, res: Response) {
    res.json(STORE_ITEMS);
  }

  static async getInventory(req: Request, res: Response) {
    const userId = (req as any).user.id;
    try {
      const inventory = await StoreRepository.getInventory(userId);
      const coins = await StoreRepository.getUserCoins(userId);
      res.json({ inventory, coins });
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar inventário" });
    }
  }

  static async buyItem(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { itemId } = req.body;

    const item = STORE_ITEMS.find(i => i.id === itemId);
    if (!item) return res.status(404).json({ error: "Item não encontrado" });

    try {
      const coins = await StoreRepository.getUserCoins(userId);
      if (coins < item.price) return res.status(400).json({ error: "Saldo insuficiente" });

      const inventory = await StoreRepository.getInventory(userId);
      if (inventory.some(i => i.item_id === itemId)) {
        return res.status(400).json({ error: "Item já adquirido" });
      }

      await StoreRepository.updateCoins(userId, -item.price);
      await StoreRepository.addInventoryItem(userId, item.type, itemId);

      res.json({ success: true, message: "Item comprado com sucesso!" });
    } catch (error) {
      res.status(500).json({ error: "Erro ao processar compra" });
    }
  }

  static async selectSkin(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { skinId } = req.body;

    try {
      const inventory = await StoreRepository.getInventory(userId);
      if (skinId !== "classic" && !inventory.some(i => i.item_id === skinId)) {
        return res.status(403).json({ error: "Você não possui esta skin" });
      }

      await StoreRepository.updateCurrentSkin(userId, skinId);
      res.json({ success: true, message: "Skin selecionada!" });
    } catch (error) {
      res.status(500).json({ error: "Erro ao selecionar skin" });
    }
  }
}
