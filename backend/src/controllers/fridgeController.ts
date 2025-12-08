// src/controllers/fridgeController.ts
import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { fridgeService } from "../services/fridgeService";

export const fridgeController = {
  async list(req: AuthRequest, res: Response) {
    try {
      const items = await fridgeService.listForUser(req.userId!);
      res.json(items);
    } catch (err) {
      console.error("Error fetching fridge items:", err);
      res.status(500).json({ message: "Failed to fetch fridge items" });
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const { name, quantity, unit, label, expirationDate } = req.body;

      if (!name) {
        return res.status(400).json({ message: "Name is required" });
      }

      const payload: {
        name: string;
        quantity?: number;
        unit?: string;
        label?: string | null;
        expirationDate?: Date | null;
      } = {
        name,
        quantity,
        unit,
        label,
      };

      if (expirationDate !== undefined) {
        payload.expirationDate = expirationDate
          ? new Date(expirationDate)
          : null;
      }

      const item = await fridgeService.createManualForUser(
        req.userId!,
        payload
      );

      res.status(201).json(item);
    } catch (err) {
      console.error("Error creating fridge item:", err);
      res.status(500).json({ message: "Failed to create fridge item" });
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const { name, quantity, unit, label, expirationDate } = req.body;

      const payload: {
        name?: string;
        quantity?: number;
        unit?: string;
        label?: string | null;
        expirationDate?: Date | null;
      } = {
        name,
        quantity,
        unit,
        label,
      };

      if (expirationDate !== undefined) {
        payload.expirationDate = expirationDate
          ? new Date(expirationDate)
          : null;
      }

      const updated = await fridgeService.updateForUser(
        req.userId!,
        id,
        payload
      );

      if (!updated) {
        return res.status(404).json({ message: "Fridge item not found" });
      }

      res.json(updated);
    } catch (err) {
      console.error("Error updating fridge item:", err);
      res.status(500).json({ message: "Failed to update fridge item" });
    }
  },

  async remove(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;

      const deleted = await fridgeService.deleteForUser(req.userId!, id);

      if (!deleted) {
        return res.status(404).json({ message: "Fridge item not found" });
      }

      res.json({ message: "Deleted", id: deleted._id });
    } catch (err) {
      console.error("Error deleting fridge item:", err);
      res.status(500).json({ message: "Failed to delete fridge item" });
    }
  },
};
