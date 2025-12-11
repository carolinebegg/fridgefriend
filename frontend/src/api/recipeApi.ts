import { apiClient } from "./client";

export type IngredientAvailabilityStatus =
  | "fridge"
  | "grocery"
  | "fridge-and-grocery"
  | "missing";

export interface RecipeIngredientAvailability {
  status: IngredientAvailabilityStatus;
  fridgeItemId?: string;
  groceryItemId?: string;
}

export interface RecipeIngredient {
  name: string;
  quantity?: number;
  unit?: string;
  brand?: string;  // NEW
  label?: string;  // category
  note?: string;
  availability?: RecipeIngredientAvailability;
}

export interface Recipe {
  _id: string;
  title: string;
  description?: string;
  photoUrl?: string;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  TotalTimeMinutes?: number;
  ingredients: RecipeIngredient[];
  steps: string[];
  tags: string[];
  sourceUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

type RecipePayload = {
  title: string;
  description?: string;
  photoUrl?: string;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  TotalTimeMinutes?: number;
  ingredients?: RecipeIngredient[];
  steps?: string[];
  tags?: string[];
  sourceUrl?: string;
};

type RecipeUpdatePayload = Partial<RecipePayload>;

export const recipeApi = {
  async list(withAvailability: boolean = true): Promise<Recipe[]> {
    const res = await apiClient.get<Recipe[]>("/recipes", {
      params: { withAvailability },
    });
    return res.data;
  },

  async create(data: RecipePayload): Promise<Recipe> {
    const res = await apiClient.post<Recipe>("/recipes", data);
    return res.data;
  },

  async update(id: string, data: RecipeUpdatePayload): Promise<Recipe> {
    const res = await apiClient.put<Recipe>(`/recipes/${id}`, data);
    return res.data;
  },

  remove(id: string) {
    return apiClient.delete<void>(`/recipes/${id}`);
  },

  async addIngredientsToGrocery(id: string) {
    const res = await apiClient.post<{ addedCount: number }>(
      `/recipes/${id}/add-to-grocery`
    );
    return res.data;
  },
};
