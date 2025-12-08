// src/models/GroceryItem.ts
import { Schema, model, Document, Types } from "mongoose";

// If you want to share Unit between grocery + fridge:
export type Unit =
  | "ml"
  | "l"
  | "fl oz"
  | "cup"
  | "pint"
  | "quart"
  | "gallon"
  | "g"
  | "kg"
  | "oz"
  | "lb"
  | "piece"
  | "pack"
  | "carton"
  | "loaf"
  | "dozen"
  | "bottle"
  | "jar"
  | "can"
  | "bag"
  | "box"
  | "roll"
  | "stick"
  | "bunch"
  | "head"
  | "stalk"
  | "bundle"
  | "case"
  | "serving"
  | "slice"
  | string; // allow any extra free-text units too

export interface IGroceryItem extends Document {
  user: Types.ObjectId;
  name: string;
  quantity: number;
  unit: Unit;

  /**
   * Category label like "Dairy", "Meat", "Produce", etc.
   * Optional and nullable because the user can unselect the chip.
   */
  label?: string | null;

  /**
   * Optional expiration date (used for warnings + fridge sync).
   */
  expirationDate?: Date | null;

  /**
   * Whether the item is checked off on the grocery list.
   * When true, we create/sync a FridgeItem.
   */
  isChecked: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const groceryItemSchema = new Schema<IGroceryItem>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
    label: {
      type: String,
      required: false,
      default: null, // <- nullable field
      trim: true,
    },
    expirationDate: {
      type: Date,
      required: false,
      default: null, // <- nullable field
    },
    isChecked: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const GroceryItem = model<IGroceryItem>("GroceryItem", groceryItemSchema);
