// src/dao/fridgeDao.ts
import { Types } from "mongoose";
import { FridgeItem, IFridgeItem } from "../models/FridgeItem";

export const fridgeDao = {
  async findByUser(userId: string) {
    const userObjectId = new Types.ObjectId(userId);
    return FridgeItem.find({ user: userObjectId }).sort({ createdAt: 1 });
  },

  async createManualForUser(
    userId: string,
    data: {
      name: string;
      quantity: number;
      unit: string;
      label?: string | null;
      // expiration is optional, matching the model + grocery behavior
      expirationDate?: Date | null;
    }
  ) {
    const userObjectId = new Types.ObjectId(userId);

    const doc: Partial<IFridgeItem> & { user: Types.ObjectId } = {
      user: userObjectId,
      name: data.name.trim(),
      quantity: data.quantity,
      unit: data.unit.trim(),
      // optional expiration date
      expirationDate: data.expirationDate ?? null,
      addedManually: true,
    };

    if (data.label && data.label.trim() !== "") {
      doc.label = data.label.trim();
    }

    // cast to any to satisfy Mongoose's overloaded create typing
    return FridgeItem.create(doc as any);
  },

  async updateByIdAndUser(
    id: string,
    userId: string,
    updates: Partial<IFridgeItem>
  ) {
    return FridgeItem.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id),
        user: new Types.ObjectId(userId),
      },
      updates,
      { new: true }
    );
  },

  async deleteByIdAndUser(id: string, userId: string) {
    return FridgeItem.findOneAndDelete({
      _id: new Types.ObjectId(id),
      user: new Types.ObjectId(userId),
    });
  },

  async findByGroceryLink(userId: string, groceryId: string) {
    return FridgeItem.findOne({
      user: new Types.ObjectId(userId),
      addedFromGroceryItem: new Types.ObjectId(groceryId),
    });
  },

  async createFromGrocery(grocery: {
    user: any;
    _id: any;
    name: string;
    quantity: number;
    unit: string;
    label?: string | null;
    expirationDate?: Date | null;
  }) {
    const doc: Partial<IFridgeItem> = {
      // user and addedFromGroceryItem come directly from grocery
      // @ts-ignore – user is ObjectId in schema
      user: grocery.user,
      name: grocery.name,
      quantity: grocery.quantity,
      unit: grocery.unit,
      // match grocery behavior: expirationDate is optional / nullable
      expirationDate: grocery.expirationDate ?? null,
      addedFromGroceryItem: grocery._id,
      addedManually: false,
    };

    if (grocery.label && grocery.label.trim() !== "") {
      doc.label = grocery.label.trim();
    }

    return FridgeItem.create(doc as any);
  },

  async deleteFromGrocery(userId: string, groceryId: string) {
    return FridgeItem.findOneAndDelete({
      user: new Types.ObjectId(userId),
      addedFromGroceryItem: new Types.ObjectId(groceryId),
      addedManually: false,
    });
  },
};
