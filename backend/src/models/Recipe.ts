// src/models/Recipe.ts
import { Schema, model, Document, Types } from "mongoose";
import { Unit } from "./GroceryItem";

export interface IRecipeIngredient {
  name: string;
  quantity?: number;
  unit?: Unit | string;
  label?: string;
  note?: string;

  /**
   * Link to a specific fridge item this ingredient is mapped to (optional).
   */
  fridgeItem?: Types.ObjectId;

  /**
   * Link to the canonical PantryItem (recommended for cross-referencing).
   */
  pantryItem?: Types.ObjectId;

  /**
   * Optional brand info for this ingredient.
   * Can mirror or override PantryItem.brand.
   */
  brand?: string;

  /**
   * Optional normalized name key (e.g., lowercased, trimmed).
   * Useful for fallback matching and migrations.
   */
  nameKey?: string;
}

export interface IRecipe extends Document {
  user: Types.ObjectId;
  title: string;
  description?: string;
  photoUrl?: string;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  ingredients: IRecipeIngredient[];
  steps: string[];
  tags: string[];
  sourceUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const recipeIngredientSchema = new Schema<IRecipeIngredient>(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: Number },
    unit: { type: String },
    label: { type: String, trim: true },
    note: { type: String, trim: true },

    // Existing link to a specific fridge item
    fridgeItem: { type: Schema.Types.ObjectId, ref: "FridgeItem" },

    // NEW: link to canonical PantryItem
    pantryItem: { type: Schema.Types.ObjectId, ref: "PantryItem" },

    // NEW: optional brand per ingredient
    brand: { type: String, trim: true },

    // NEW: optional normalized key
    nameKey: { type: String, trim: true },
  },
  { _id: false }
);

const recipeSchema = new Schema<IRecipe>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    photoUrl: {
      type: String,
      trim: true,
    },
    prepTimeMinutes: {
      type: Number,
      min: 0,
    },
    cookTimeMinutes: {
      type: Number,
      min: 0,
    },
    ingredients: {
      type: [recipeIngredientSchema],
      default: [],
    },
    steps: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    sourceUrl: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export const Recipe = model<IRecipe>("Recipe", recipeSchema);
