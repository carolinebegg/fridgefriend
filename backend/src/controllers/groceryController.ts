import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { groceryService } from "../services/groceryService";

export const groceryController = {
  async list(req: AuthRequest, res: Response) {
    try {
      const items = await groceryService.listForUser(req.userId!);
      res.json(items);
    } catch (err) {
      console.error("Error fetching groceries:", err);
      res.status(500).json({ message: "Failed to fetch groceries" });
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

      const item = await groceryService.createForUser(req.userId!, payload);

      res.status(201).json(item);
    } catch (err) {
      console.error("Error creating grocery item:", err);
      res.status(500).json({ message: "Failed to create grocery item" });
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;  // ✅ cast

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

      const updated = await groceryService.updateForUser(
        req.userId!,
        id,
        payload
      );

      if (!updated) {
        return res.status(404).json({ message: "Grocery item not found" });
      }

      res.json(updated);
    } catch (err) {
      console.error("Error updating grocery item:", err);
      res.status(500).json({ message: "Failed to update grocery item" });
    }
  },

  async remove(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;  // ✅ cast

      const deleted = await groceryService.deleteForUser(req.userId!, id);

      if (!deleted) {
        return res.status(404).json({ message: "Grocery item not found" });
      }

      res.json({ message: "Deleted", id: deleted._id });
    } catch (err) {
      console.error("Error deleting grocery item:", err);
      res.status(500).json({ message: "Failed to delete grocery item" });
    }
  },

  async toggle(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;  // ✅ cast

      const item = await groceryService.toggleForUser(req.userId!, id);

      if (!item) {
        return res.status(404).json({ message: "Grocery item not found" });
      }

      res.json(item);
    } catch (err) {
      console.error("Error toggling grocery item:", err);
      res.status(500).json({ message: "Failed to toggle grocery item" });
    }
  },
};
