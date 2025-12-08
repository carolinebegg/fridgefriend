// src/models/FridgeItem.ts
import { Schema, model, Document, Types } from "mongoose";
import { Unit } from "./GroceryItem";

export interface IFridgeItem extends Document {
  user: Types.ObjectId;
  name: string;
  quantity: number;
  unit: Unit;

  /**
   * Category label like "Dairy", "Meat", "Produce", etc.
   * Optional and nullable – user can have no category.
   */
  label?: string | null;

  /**
   * When the item expires (used for warnings and sorting).
   * Optional and nullable – matches GroceryItem behavior.
   */
  expirationDate?: Date | null;

  /**
   * If this came from a checked GroceryItem, link back to it.
   * Null/undefined when added manually.
   */
  addedFromGroceryItem?: Types.ObjectId | null;

  /**
   * True if manually added directly to the fridge.
   * False if created via grocery → fridge sync.
   */
  addedManually: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const fridgeItemSchema = new Schema<IFridgeItem>(
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
      default: null, // nullable, same as grocery
      trim: true,
    },
    expirationDate: {
      type: Date,
      required: false,
      default: null, // nullable, same as grocery
    },
    addedFromGroceryItem: {
      type: Schema.Types.ObjectId,
      ref: "GroceryItem",
      required: false,
      default: null,
    },
    addedManually: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const FridgeItem = model<IFridgeItem>("FridgeItem", fridgeItemSchema);
