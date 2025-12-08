import { Schema, model, Document, Types } from "mongoose";
import { Unit } from "./GroceryItem";

export interface IRecipeIngredient {
  name: string;
  quantity?: number;
  unit?: Unit | string;
  label?: string;
  fridgeItem?: Types.ObjectId;
}

export interface IRecipe extends Document {
  user: Types.ObjectId;
  title: string;
  description?: string;
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
    fridgeItem: { type: Schema.Types.ObjectId, ref: "FridgeItem" },
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
