// src/utils/mapAiRecipePreview.ts
import {
  AiRecipePreview,
  AiRecipeIngredientPreview,
} from "../api/aiRecipeApi";
import {
  IngredientRow,
  RecipeEditorValues,
} from "../components/RecipeEditorModal";

function makeRowId() {
  return Math.random().toString(36).slice(2);
}

function mapIngredient(ing: AiRecipeIngredientPreview): IngredientRow {
  return {
    id: makeRowId(),
    name: ing.name,
    quantity: ing.quantity,
    unit: ing.unit,
    label: ing.label ?? null,
    note: ing.note ?? null,
    brand: ing.brand ?? null,
  };
}

export function mapAiPreviewToEditorInitialValues(
  ai: AiRecipePreview
): RecipeEditorValues {
  const ingredientRows: IngredientRow[] =
    ai.ingredients?.map(mapIngredient) ?? [];

  return {
    title: ai.title,
    description: ai.description ?? "",
    ingredients: ingredientRows,
    steps: ai.steps ?? [],
    // tags: ai.tags ?? [],
    photoUrl: ai.photoUrl ?? "",
    prepTimeMinutes:
      typeof ai.prepTimeMinutes === "number" ? ai.prepTimeMinutes : undefined,
    cookTimeMinutes:
      typeof ai.cookTimeMinutes === "number" ? ai.cookTimeMinutes : undefined,
    // sourceUrl: ai.sourceUrl,
  };
}
