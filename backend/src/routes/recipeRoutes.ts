import express from "express";
import { requireAuth } from "../middleware/authMiddleware";
import { recipeController } from "../controllers/recipeController";

const router = express.Router();

router.use(requireAuth);

router.get("/", recipeController.list);
router.post("/", recipeController.create);
router.get("/:id", recipeController.getOne);
router.put("/:id", recipeController.update);
router.delete("/:id", recipeController.remove);
router.post("/:id/add-to-grocery", recipeController.addToGrocery);

export default router;
