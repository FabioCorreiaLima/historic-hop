import { Router } from "express";
import { UserController } from "../controllers/UserController.js";
import { authenticateToken } from "../middleware/auth.js";
const router = Router();
router.get("/profile", authenticateToken, UserController.getProfile);
router.put("/profile", authenticateToken, UserController.updateProfile);
export default router;
