import { Router } from "express";
import { StoreController } from "../controllers/StoreController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

router.get("/items", StoreController.getItems);
router.get("/inventory", authenticateToken, StoreController.getInventory);
router.post("/buy", authenticateToken, StoreController.buyItem);
router.post("/select-skin", authenticateToken, StoreController.selectSkin);

export default router;
