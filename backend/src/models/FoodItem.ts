import mongoose from "mongoose";

const FoodItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 },
    expiresAt: { type: Date }
  },
  { timestamps: true }
);

export const FoodItem = mongoose.model("FoodItem", FoodItemSchema);
