import express from "express";
import { requireAuth } from "../middleware/authMiddleware";
import { groceryController } from "../controllers/groceryController";

const router = express.Router();

router.use(requireAuth);

// GET /api/groceries
router.get("/", groceryController.list);

// POST /api/groceries
router.post("/", groceryController.create);

// PATCH /api/groceries/:id
router.patch("/:id", groceryController.update);

// DELETE /api/groceries/:id
router.delete("/:id", groceryController.remove);

// POST /api/groceries/:id/toggle
router.post("/:id/toggle", groceryController.toggle);

export default router;
