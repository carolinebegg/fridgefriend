// // src/routes/groceryRoutes.ts
// import express, { Response } from "express";
// import { Types } from "mongoose";
// import { AuthRequest, requireAuth } from "../middleware/authMiddleware";
// import { GroceryItem } from "../models/GroceryItem";

// const router = express.Router();

// // all routes require auth
// router.use(requireAuth);

// // GET /api/groceries
// router.get("/", async (req: AuthRequest, res: Response) => {
//   try {
//     const userObjectId = new Types.ObjectId(req.userId);

//     const items = await GroceryItem.find({ user: userObjectId }).sort({
//       createdAt: -1,
//     });

//     res.json(items);
//   } catch (err) {
//     console.error("Error fetching groceries:", err);
//     res.status(500).json({ message: "Failed to fetch groceries" });
//   }
// });

// // POST /api/groceries
// router.post("/", async (req: AuthRequest, res: Response) => {
//   try {
//     const { name, quantity, unit, label, expirationDate } = req.body;

//     if (!name) {
//       return res.status(400).json({ message: "Name is required" });
//     }

//     const userObjectId = new Types.ObjectId(req.userId);

//     const item = await GroceryItem.create({
//       user: userObjectId,
//       name: String(name).trim(),
//       quantity: quantity ?? 1,
//       unit: unit ?? "piece",
//       label: label?.trim() || undefined,
//       expirationDate: expirationDate || undefined,
//     });

//     res.status(201).json(item);
//   } catch (err) {
//     console.error("Error creating grocery item:", err);
//     res.status(500).json({ message: "Failed to create grocery item" });
//   }
// });

// // PATCH /api/groceries/:id
// router.patch("/:id", async (req: AuthRequest, res: Response) => {
//   try {
//     const { id } = req.params;
//     const { name, quantity, unit, label, expirationDate } = req.body;

//     const filter = {
//       _id: new Types.ObjectId(id),
//       user: new Types.ObjectId(req.userId),
//     };

//     const update: any = {};
//     if (name !== undefined) update.name = name;
//     if (quantity !== undefined) update.quantity = quantity;
//     if (unit !== undefined) update.unit = unit;
//     if (label !== undefined) update.label = label;
//     if (expirationDate !== undefined) update.expirationDate = expirationDate;

//     const item = await GroceryItem.findOneAndUpdate(filter, update, {
//       new: true,
//     });

//     if (!item) {
//       return res.status(404).json({ message: "Grocery item not found" });
//     }

//     res.json(item);
//   } catch (err) {
//     console.error("Error updating grocery item:", err);
//     res.status(500).json({ message: "Failed to update grocery item" });
//   }
// });

// // DELETE /api/groceries/:id
// router.delete("/:id", async (req: AuthRequest, res: Response) => {
//   try {
//     const { id } = req.params;

//     const filter = {
//       _id: new Types.ObjectId(id),
//       user: new Types.ObjectId(req.userId),
//     };

//     const item = await GroceryItem.findOneAndDelete(filter);

//     if (!item) {
//       return res.status(404).json({ message: "Grocery item not found" });
//     }

//     res.json({ message: "Deleted", id: item._id });
//   } catch (err) {
//     console.error("Error deleting grocery item:", err);
//     res.status(500).json({ message: "Failed to delete grocery item" });
//   }
// });

// // POST /api/groceries/:id/toggle
// router.post("/:id/toggle", async (req: AuthRequest, res: Response) => {
//   try {
//     const { id } = req.params;

//     const filter = {
//       _id: new Types.ObjectId(id),
//       user: new Types.ObjectId(req.userId),
//     };

//     const item = await GroceryItem.findOne(filter);

//     if (!item) {
//       return res.status(404).json({ message: "Grocery item not found" });
//     }

//     item.isChecked = !item.isChecked;
//     await item.save();

//     // later: create FridgeItem here when item.isChecked just turned true

//     res.json(item);
//   } catch (err) {
//     console.error("Error toggling grocery item:", err);
//     res.status(500).json({ message: "Failed to toggle grocery item" });
//   }
// });

// export default router;

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
