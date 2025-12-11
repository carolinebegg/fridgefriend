import { Types } from "mongoose";
import { FridgeItem, IFridgeItem } from "../models/FridgeItem";

export type FridgeManualCreateData = {
  pantryItem: Types.ObjectId;
  name: string;
  nameKey: string;
  quantity: number;
  unit: string;
  label?: string | null;
  brand?: string | null;
  expirationDate?: Date | null;
};

export const fridgeDao = {
  async findByUser(userId: string) {
    const userObjectId = new Types.ObjectId(userId);
    return FridgeItem.find({ user: userObjectId }).sort({ createdAt: 1 });
  },

  async createManualForUser(userId: string, data: FridgeManualCreateData) {
    const userObjectId = new Types.ObjectId(userId);

    const doc: Partial<IFridgeItem> & { user: Types.ObjectId } = {
      user: userObjectId,
      pantryItem: data.pantryItem,
      name: data.name.trim(),
      nameKey: data.nameKey,
      quantity: data.quantity,
      unit: data.unit.trim(),
      expirationDate: data.expirationDate ?? null,
      addedManually: true,
      label: data.label ?? null,
      brand: data.brand ?? null,
    };

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
    pantryItem: any;
    name: string;
    nameKey: string;
    quantity: number;
    unit: string;
    label?: string | null;
    brand?: string | null;
    expirationDate?: Date | null;
  }) {
    const doc: Partial<IFridgeItem> = {
      // user and addedFromGroceryItem come directly from grocery
      // @ts-ignore – user is ObjectId in schema
      user: grocery.user,
      pantryItem: grocery.pantryItem,
      name: grocery.name,
      nameKey: grocery.nameKey,
      quantity: grocery.quantity,
      unit: grocery.unit,
      expirationDate: grocery.expirationDate ?? null,
      addedFromGroceryItem: grocery._id,
      addedManually: false,
      label: grocery.label ?? null,
      brand: grocery.brand ?? null,
    };

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
