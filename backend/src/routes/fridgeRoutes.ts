// // src/routes/fridgeRoutes.ts
// import express from "express";
// import { Types } from "mongoose";
// import { AuthRequest, requireAuth } from "../middleware/authMiddleware";
// import { FridgeItem } from "../models/FridgeItem";

// const router = express.Router();

// // All routes require auth
// router.use(requireAuth);

// // GET /api/fridge - list all fridge items for current user
// router.get("/", async (req: AuthRequest, res) => {
//   try {
//     const userId = req.userId!;
//     const items = await FridgeItem.find({ user: new Types.ObjectId(userId) })
//       .sort({ createdAt: 1 })
//       .lean();

//     res.json(items);
//   } catch (err) {
//     console.error("Error fetching fridge items", err);
//     res.status(500).json({ error: "Failed to fetch fridge items" });
//   }
// });

// // POST /api/fridge - create a new fridge item (manual add)
// router.post("/", async (req: AuthRequest, res) => {
//   try {
//     const userId = req.userId!;
//     const { name, quantity, unit, label, expiresAt } = req.body;

//     const item = await FridgeItem.create({
//       user: new Types.ObjectId(userId),
//       name,
//       quantity,
//       unit,
//       label,
//       expiresAt,
//       addedManually: true,
//     });

//     res.status(201).json(item);
//   } catch (err) {
//     console.error("Error creating fridge item", err);
//     res.status(500).json({ error: "Failed to create fridge item" });
//   }
// });

// // PUT /api/fridge/:id - update a fridge item
// router.put("/:id", async (req: AuthRequest, res) => {
//   try {
//     const userId = req.userId!;
//     const { id } = req.params;
//     const { name, quantity, unit, label, expiresAt } = req.body;

//     const item = await FridgeItem.findOneAndUpdate(
//       { _id: id, user: new Types.ObjectId(userId) },
//       { name, quantity, unit, label, expiresAt },
//       { new: true }
//     );

//     if (!item) {
//       return res.status(404).json({ error: "Fridge item not found" });
//     }

//     res.json(item);
//   } catch (err) {
//     console.error("Error updating fridge item", err);
//     res.status(500).json({ error: "Failed to update fridge item" });
//   }
// });

// // DELETE /api/fridge/:id - delete a fridge item
// router.delete("/:id", async (req: AuthRequest, res) => {
//   try {
//     const userId = req.userId!;
//     const { id } = req.params;

//     const item = await FridgeItem.findOneAndDelete({
//       _id: id,
//       user: new Types.ObjectId(userId),
//     });

//     if (!item) {
//       return res.status(404).json({ error: "Fridge item not found" });
//     }

//     res.json({ success: true });
//   } catch (err) {
//     console.error("Error deleting fridge item", err);
//     res.status(500).json({ error: "Failed to delete fridge item" });
//   }
// });

// export default router;

import express from "express";
import { requireAuth } from "../middleware/authMiddleware";
import { fridgeController } from "../controllers/fridgeController";

const router = express.Router();

router.use(requireAuth);

// GET /api/fridge
router.get("/", fridgeController.list);

// POST /api/fridge  (manual add)
router.post("/", fridgeController.create);

// PUT /api/fridge/:id
router.put("/:id", fridgeController.update);

// DELETE /api/fridge/:id
router.delete("/:id", fridgeController.remove);

export default router;
