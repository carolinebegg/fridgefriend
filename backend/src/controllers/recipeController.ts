import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { recipeService } from "../services/recipeService";

export const recipeController = {
  async list(req: AuthRequest, res: Response) {
    try {
      const includeAvailability = req.query.withAvailability === "true";
      const recipes = includeAvailability
        ? await recipeService.listWithAvailability(req.userId!)
        : await recipeService.listForUser(req.userId!);
      res.json(recipes);
    } catch (err) {
      console.error("Error fetching recipes", err);
      res.status(500).json({ message: "Failed to fetch recipes" });
    }
  },

  async getOne(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params as { id?: string };
      if (!id) {
        return res.status(400).json({ message: "Recipe id is required" });
      }

      const recipe = await recipeService.getForUser(req.userId!, id);
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      res.json(recipe);
    } catch (err) {
      console.error("Error fetching recipe", err);
      res.status(500).json({ message: "Failed to fetch recipe" });
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const { title } = req.body;
      if (!title || !String(title).trim()) {
        return res.status(400).json({ message: "Title is required" });
      }

      const recipe = await recipeService.createForUser(req.userId!, req.body);
      res.status(201).json(recipe);
    } catch (err) {
      console.error("Error creating recipe", err);
      res.status(500).json({ message: "Failed to create recipe" });
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params as { id?: string };
      if (!id) {
        return res.status(400).json({ message: "Recipe id is required" });
      }

      if (req.body.title !== undefined && !String(req.body.title).trim()) {
        return res.status(400).json({ message: "Title cannot be empty" });
      }

      const updated = await recipeService.updateForUser(
        req.userId!,
        id,
        req.body
      );

      if (!updated) {
        return res.status(404).json({ message: "Recipe not found" });
      }

      res.json(updated);
    } catch (err) {
      console.error("Error updating recipe", err);
      res.status(500).json({ message: "Failed to update recipe" });
    }
  },

  async remove(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params as { id?: string };
      if (!id) {
        return res.status(400).json({ message: "Recipe id is required" });
      }

      const deleted = await recipeService.deleteForUser(req.userId!, id);
      if (!deleted) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      res.json({ message: "Deleted", id: deleted._id });
    } catch (err) {
      console.error("Error deleting recipe", err);
      res.status(500).json({ message: "Failed to delete recipe" });
    }
  },

  async addToGrocery(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params as { id?: string };
      if (!id) {
        return res.status(400).json({ message: "Recipe id is required" });
      }

      const updated = await recipeService.addIngredientsToGrocery(
        req.userId!,
        id
      );

      if (updated === null) {
        return res.status(404).json({ message: "Recipe not found" });
      }

      res.json({
        addedCount: updated.length,
        items: updated,
      });
    } catch (err) {
      console.error("Error adding recipe ingredients to grocery", err);
      res
        .status(500)
        .json({ message: "Failed to add ingredients to grocery" });
    }
  },
};
