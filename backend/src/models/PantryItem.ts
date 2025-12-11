// models/PantryItem.ts
import { Schema, model, Document, Types } from "mongoose";

export interface IPantryItem extends Document {
  user: Types.ObjectId;
  name: string;       // Display name: "Red bell pepper"
  nameKey: string;    // Normalized: "red bell pepper"
  label?: string;     // Category: "Produce"
  brand?: string;     // Optional: "Trader Joe's"
  defaultUnit?: string; // Optional: "piece", "g", etc.
  createdAt: Date;
  updatedAt: Date;
}

const pantryItemSchema = new Schema<IPantryItem>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    nameKey: { type: String, required: true, index: true },
    label: { type: String, trim: true },
    brand: { type: String, trim: true },
    defaultUnit: { type: String, trim: true },
  },
  { timestamps: true }
);

// One pantry item per (user, nameKey, brand)
pantryItemSchema.index(
  { user: 1, nameKey: 1, brand: 1 },
  { unique: true }
);

export const PantryItem = model<IPantryItem>("PantryItem", pantryItemSchema);
