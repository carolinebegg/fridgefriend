import { Router } from "express";
import { FoodItem } from "../models/FoodItem";

const router = Router();

// POST /api/food  -> create a food item
router.post("/", async (req, res) => {
  try {
    const item = await FoodItem.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Error creating item" });
  }
});

// GET /api/food  -> get all food items
router.get("/", async (_req, res) => {
  try {
    const items = await FoodItem.find();
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching items" });
  }
});

export default router;
