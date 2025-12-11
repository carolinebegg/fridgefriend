import { Types } from "mongoose";
import { Recipe, IRecipe, IRecipeIngredient } from "../models/Recipe";

export const recipeDao = {
  findByUser(userId: string) {
    const userObjectId = new Types.ObjectId(userId);
    return Recipe.find({ user: userObjectId }).sort({ updatedAt: -1 });
  },

  findByIdAndUser(id: string, userId: string) {
    return Recipe.findOne({
      _id: new Types.ObjectId(id),
      user: new Types.ObjectId(userId),
    });
  },

  createForUser(
    userId: string,
    data: Omit<IRecipe, "_id" | "user" | "createdAt" | "updatedAt">
  ) {
    return Recipe.create({
      ...data,
      user: new Types.ObjectId(userId),
    } as any);
  },

  updateByIdAndUser(
    id: string,
    userId: string,
    updates: Partial<IRecipe>
  ) {
    return Recipe.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id),
        user: new Types.ObjectId(userId),
      },
      updates,
      { new: true }
    );
  },

  deleteByIdAndUser(id: string, userId: string) {
    return Recipe.findOneAndDelete({
      _id: new Types.ObjectId(id),
      user: new Types.ObjectId(userId),
    });
  },
};
