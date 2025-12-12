// src/api/aiRecipeApi.ts
import { apiClient } from "./client";

export type AiRecipeMode = "fridge" | "random" | "prompt";

export interface AiRecipeIngredientPreview {
  name: string;
  quantity?: number;
  unit?: string;
  label?: string;
  note?: string;
  brand?: string;
  nameKey?: string;
}

export interface AiRecipePreview {
  title: string;
  description: string;
  photoUrl?: string;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  ingredients: AiRecipeIngredientPreview[];
  steps: string[];
  // tags: string[];
  // sourceUrl?: string;
}

interface GenerateAiRecipePayload {
  mode: AiRecipeMode;
  prompt?: string;
}

export async function generateAiRecipe(
  payload: GenerateAiRecipePayload
): Promise<AiRecipePreview> {
  const res = await apiClient.post("/ai/recipes/generate", payload);
  return res.data;
}
