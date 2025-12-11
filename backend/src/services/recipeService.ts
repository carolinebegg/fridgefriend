// src/services/recipeService.ts
import { recipeDao } from "../dao/recipeDao";
import { fridgeDao } from "../dao/fridgeDao";
import { groceryDao } from "../dao/groceryDao";
import { pantryDao } from "../dao/pantryDao";
import { IRecipe, IRecipeIngredient } from "../models/Recipe";
import { IGroceryItem } from "../models/GroceryItem";
import { makeNameKey } from "../utils/nameKey";

export type RecipeInput = {
  title: string;
  description?: string;
  photoUrl?: string;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  ingredients?: IRecipeIngredient[];
  steps?: string[];
  tags?: string[];
  sourceUrl?: string;
};

export const recipeService = {
  listForUser(userId: string) {
    return recipeDao.findByUser(userId);
  },

  getForUser(userId: string, id: string) {
    return recipeDao.findByIdAndUser(id, userId);
  },

  async listWithAvailability(userId: string) {
    const [recipes, fridgeItems, groceryItems] = await Promise.all([
      recipeDao.findByUser(userId),
      fridgeDao.findByUser(userId),
      groceryDao.findByUser(userId),
    ]);

    return recipes.map((recipe) => {
      const ingredientsWithStatus = recipe.ingredients.map((ingredient: any) => {
        const ingredientObj =
          typeof ingredient.toObject === "function"
            ? ingredient.toObject()
            : ingredient;

        return {
          ...ingredientObj,
          availability: computeAvailability(ingredientObj, fridgeItems, groceryItems),
        };
      });

      return {
        ...recipe.toObject(),
        ingredients: ingredientsWithStatus,
      };
    });
  },

  async createForUser(userId: string, data: RecipeInput) {
    const payload = normalizeRecipeInput(data);

    // Link ingredients to PantryItem + set nameKey
    if (payload.ingredients && payload.ingredients.length > 0) {
      for (const ing of payload.ingredients) {
        if (!ing.name || !ing.name.trim()) continue;

        const pantryItem = await pantryDao.findOrCreateForUser(userId, ing.name, {
          label: ing.label,
          brand: ing.brand,
          defaultUnit: ing.unit as string | undefined,
        });

        ing.pantryItem = pantryItem._id;
        ing.nameKey = makeNameKey(ing.name);
        if (!ing.brand && pantryItem.brand) {
          ing.brand = pantryItem.brand;
        }
      }
    }

    return recipeDao.createForUser(userId, payload as any);
  },

  async updateForUser(userId: string, id: string, updates: Partial<RecipeInput>) {
    const normalized = normalizeRecipeInput(updates, true);

    // If ingredients were included in the update, re-link them as needed
    if (normalized.ingredients && normalized.ingredients.length > 0) {
      for (const ing of normalized.ingredients) {
        if (!ing.name || !ing.name.trim()) continue;

        const pantryItem = await pantryDao.findOrCreateForUser(userId, ing.name, {
          label: ing.label,
          brand: ing.brand,
          defaultUnit: ing.unit as string | undefined,
        });

        ing.pantryItem = pantryItem._id;
        ing.nameKey = makeNameKey(ing.name);
        if (!ing.brand && pantryItem.brand) {
          ing.brand = pantryItem.brand;
        }
      }
    }

    return recipeDao.updateByIdAndUser(id, userId, normalized as any);
  },

  deleteForUser(userId: string, id: string) {
    return recipeDao.deleteByIdAndUser(id, userId);
  },

  async addIngredientsToGrocery(userId: string, recipeId: string) {
    const recipe = await recipeDao.findByIdAndUser(recipeId, userId);
    if (!recipe) return null;

    const ingredients = recipe.ingredients || [];
    if (ingredients.length === 0) return [];

    const existingGroceries = await groceryDao.findByUser(userId);

    // Map existing groceries by pantryItem id
    const existingByPantryId: Record<string, IGroceryItem> = {};
    for (const item of existingGroceries) {
      if (item.pantryItem) {
        existingByPantryId[String(item.pantryItem)] = item;
      }
    }

    const createdOrUpdated: IGroceryItem[] = [];

    for (const ingredient of ingredients) {
      const name = (ingredient.name || "").trim();
      if (!name) continue;

      // Prefer existing pantryItem; otherwise, create one
      let pantryIdStr: string;
      let pantryItemId = ingredient.pantryItem;

      if (!pantryItemId) {
        const pantryItem = await pantryDao.findOrCreateForUser(userId, name, {
          label: ingredient.label,
          brand: ingredient.brand,
          defaultUnit: ingredient.unit as string | undefined,
        });
        pantryItemId = pantryItem._id;
        // NOTE: we are not mutating/storing back to recipe here (to keep it simple),
        // but you could if you wanted to persist pantryItem onto the recipe.
      }

      pantryIdStr = String(pantryItemId);

      const defaultQuantity = ingredient.quantity ?? 1;
      const defaultUnit =
        (ingredient.unit as string | undefined) ?? "piece";
      const label = ingredient.label ?? null;
      const brand = ingredient.brand ?? null;
      const nameKey = makeNameKey(name);

      const existing = existingByPantryId[pantryIdStr];

      if (existing) {
        const updated = await groceryDao.updateByIdAndUser(
          String(existing._id),
          userId,
          {
            quantity: ingredient.quantity ?? existing.quantity,
            unit: (ingredient.unit as string | undefined) ?? existing.unit,
            label: label === null ? null : label ?? existing.label,
            brand: brand === null ? null : brand ?? existing.brand,
            isChecked: false,
          }
        );

        if (updated) {
          createdOrUpdated.push(updated);
          existingByPantryId[pantryIdStr] = updated;
        }
      } else {
        const created = await groceryDao.createForUser(userId, {
          pantryItem: pantryItemId!,
          name,
          nameKey,
          quantity: defaultQuantity,
          unit: defaultUnit,
          label,
          brand,
          expirationDate: null,
          isChecked: false,
        });
        createdOrUpdated.push(created as IGroceryItem);
        existingByPantryId[pantryIdStr] = created as IGroceryItem;
      }
    }

    return createdOrUpdated;
  },
};

// ------- helpers -------

function normalizeRecipeInput(data: Partial<RecipeInput>, isPartial = false) {
  const payload: Partial<IRecipe> = {};

  if (data.title !== undefined) {
    payload.title = data.title.trim();
  }

  if (data.description !== undefined)
    payload.description = data.description?.trim() ?? "";
  if (data.photoUrl !== undefined) payload.photoUrl = data.photoUrl?.trim();
  if (data.prepTimeMinutes !== undefined)
    payload.prepTimeMinutes = data.prepTimeMinutes;
  if (data.cookTimeMinutes !== undefined)
    payload.cookTimeMinutes = data.cookTimeMinutes;
  if (data.tags !== undefined)
    payload.tags = (data.tags || []).map((t) => t.trim()).filter(Boolean);
  if (data.sourceUrl !== undefined)
    payload.sourceUrl = data.sourceUrl?.trim();

  if (data.ingredients !== undefined) {
    payload.ingredients = (data.ingredients || [])
      .map((ing) => normalizeIngredient(ing))
      .filter((ing) => Boolean(ing.name));
  }

  if (data.steps !== undefined) {
    payload.steps = (data.steps || [])
      .map((step) => step.trim())
      .filter(Boolean);
  }

  // For create, ensure defaults exist
  if (!isPartial) {
    payload.ingredients = payload.ingredients ?? [];
    payload.steps = payload.steps ?? [];
    payload.tags = payload.tags ?? [];
    payload.description = payload.description ?? "";
  }

  return payload;
}

function normalizeIngredient(ing: Partial<IRecipeIngredient>): IRecipeIngredient {
  const name = (ing.name || "").trim();
  const nameKey = makeNameKey(name);

  return {
    name,
    quantity: ing.quantity,
    unit: ing.unit,
    label: ing.label,
    note: ing.note,
    fridgeItem: ing.fridgeItem,
    pantryItem: ing.pantryItem, // preserve if already set
    brand: ing.brand,
    nameKey,
  } as IRecipeIngredient;
}

function computeAvailability(
  ingredient: IRecipeIngredient,
  fridgeItems: any[],
  groceryItems: IGroceryItem[]
) {
  // 1) Prefer pantryItem-based matching
  if (ingredient.pantryItem) {
    const pantryIdStr = String(ingredient.pantryItem);

    const fridgeMatch = fridgeItems.find(
      (item: any) => String(item.pantryItem) === pantryIdStr
    );
    const groceryMatch = groceryItems.find(
      (item) => String(item.pantryItem) === pantryIdStr
    );

    if (fridgeMatch && groceryMatch) {
      return {
        status: "fridge-and-grocery" as const,
        fridgeItemId: String(fridgeMatch._id),
        groceryItemId: String(groceryMatch._id),
      };
    }

    if (fridgeMatch) {
      return {
        status: "fridge" as const,
        fridgeItemId: String(fridgeMatch._id),
      };
    }

    if (groceryMatch) {
      return {
        status: "grocery" as const,
        groceryItemId: String(groceryMatch._id),
      };
    }
  }

  // 2) Fallback: nameKey-based matching (for older data / unlinked ingredients)
  const key = ingredient.nameKey || makeNameKey(ingredient.name);
  if (!key) return { status: "missing" as const };

  const fridgeMatch = fridgeItems.find(
    (item: any) =>
      item.nameKey === key || makeNameKey(item.name) === key
  );
  const groceryMatch = groceryItems.find(
    (item) => item.nameKey === key || makeNameKey(item.name) === key
  );

  if (fridgeMatch && groceryMatch) {
    return {
      status: "fridge-and-grocery" as const,
      fridgeItemId: String(fridgeMatch._id),
      groceryItemId: String(groceryMatch._id),
    };
  }

  if (fridgeMatch) {
    return {
      status: "fridge" as const,
      fridgeItemId: String(fridgeMatch._id),
    };
  }

  if (groceryMatch) {
    return {
      status: "grocery" as const,
      groceryItemId: String(groceryMatch._id),
    };
  }

  return { status: "missing" as const };
}
