// src/controllers/aiRecipeController.ts
import { Response } from "express";
import { generateAiRecipe, AiRecipeMode } from "../services/aiRecipeService";
import { FridgeItem, IFridgeItem } from "../models/FridgeItem";
import { IRecipeIngredient } from "../models/Recipe";
import { AuthRequest } from "../middleware/authMiddleware";

function buildNameKey(name: string): string {
  return name.trim().toLowerCase();
}

export async function generateAiRecipeController(
  req: AuthRequest,
  res: Response
) {

  const startedAt = Date.now();
  console.log("[AI] /recipes/generate start", { mode: req.body?.mode });

  try {
    const { mode, prompt } = req.body as {
      mode: AiRecipeMode;
      prompt?: string;
    };

    if (!mode) {
      return res.status(400).json({ error: "mode is required" });
    }

    let fridgeItems: IFridgeItem[] = [];

    if (mode === "fridge") {
      const userId = req.userId;
      if (!userId) {
        return res
          .status(401)
          .json({ error: "User not authenticated for fridge mode" });
      }

      fridgeItems = (await FridgeItem.find({ user: userId }).exec()) as IFridgeItem[];
    }

    // Build options object explicitly to avoid exactOptionalPropertyTypes complaints
    const options = {
      mode,
      fridgeItems,
      // Only include customPrompt if we actually have one
      ...(prompt ? { customPrompt: prompt } : {}),
    };

    const aiDraft = await generateAiRecipe(options);

    const ingredientsWithNameKey: IRecipeIngredient[] =
      aiDraft.ingredients.map((ing) => ({
        ...ing,
        nameKey: buildNameKey(ing.name),
      }));

    // Let TypeScript infer this as a plain JSON object instead of trying to force it into IRecipe
    const preview = {
      title: aiDraft.title,
      description: aiDraft.description ?? "",
      photoUrl: aiDraft.photoUrl ?? "",
      prepTimeMinutes: aiDraft.prepTimeMinutes,
      cookTimeMinutes: aiDraft.cookTimeMinutes,
      ingredients: ingredientsWithNameKey,
      steps: aiDraft.steps,
      tags: aiDraft.tags ?? [],
      sourceUrl: aiDraft.sourceUrl ?? undefined,
    };

    console.log(
      "[AI] /recipes/generate success in",
      Date.now() - startedAt,
      "ms"
    );
    return res.status(200).json(preview);

  } catch (err) {
    console.error(
      "[AI] /recipes/generate error after",
      Date.now() - startedAt,
      "ms",
      err
    );
    return res
      .status(500)
      .json({ error: "Failed to generate recipe with AI" });
  }
}
