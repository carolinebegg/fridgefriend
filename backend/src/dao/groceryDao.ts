import { Types } from "mongoose";
import { GroceryItem, IGroceryItem } from "../models/GroceryItem";

export const groceryDao = {
  async findByUser(userId: string) {
    const userObjectId = new Types.ObjectId(userId);
    return GroceryItem.find({ user: userObjectId }).sort({ createdAt: -1 });
  },

  async createForUser(
    userId: string,
    data: {
      name: string;
      quantity: number;
      unit: string;
      label?: string | null;
      expirationDate?: Date | null;
    }
  ) {
    const userObjectId = new Types.ObjectId(userId);

    const doc: Partial<IGroceryItem> & {
        user: Types.ObjectId;
        name: string;
        quantity: number;
        unit: string;
    } = {
        user: userObjectId,
        name: String(data.name).trim(),
        quantity: data.quantity,
        unit: data.unit,
    };

    if (data.label !== undefined) {
        doc.label = data.label; // string | null
    }

    if (data.expirationDate !== undefined) {
        doc.expirationDate = data.expirationDate; // Date | null
    }

    return GroceryItem.create(doc as any);
  },

  async findOneByIdAndUser(id: string, userId: string) {
    return GroceryItem.findOne({
      _id: new Types.ObjectId(id),
      user: new Types.ObjectId(userId),
    });
  },

  async updateByIdAndUser(
    id: string,
    userId: string,
    updates: Partial<IGroceryItem>
  ) {
    return GroceryItem.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id),
        user: new Types.ObjectId(userId),
      },
      updates,
      { new: true }
    );
  },

  async deleteByIdAndUser(id: string, userId: string) {
    return GroceryItem.findOneAndDelete({
      _id: new Types.ObjectId(id),
      user: new Types.ObjectId(userId),
    });
  },
};
