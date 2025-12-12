// src/routes/aiRecipeRoutes.ts
import { Router } from "express";
import { generateAiRecipeController } from "../controllers/aiRecipeController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

/**
 * POST /api/ai/recipes/generate
 * Body: { mode: "fridge" | "random" | "prompt", prompt?: string }
 */
router.post("/recipes/generate", requireAuth, generateAiRecipeController);

export default router;
