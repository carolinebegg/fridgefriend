import { Types } from "mongoose";
import { GroceryItem, IGroceryItem } from "../models/GroceryItem";

export type GroceryCreateData = {
  pantryItem: Types.ObjectId;
  name: string;
  nameKey: string;
  quantity: number;
  unit: string;
  label?: string | null;
  brand?: string | null;
  expirationDate?: Date | null;
  isChecked?: boolean;
};

export const groceryDao = {
  async findByUser(userId: string) {
    const userObjectId = new Types.ObjectId(userId);
    return GroceryItem.find({ user: userObjectId }).sort({ createdAt: -1 });
  },

  async createForUser(userId: string, data: GroceryCreateData): Promise<IGroceryItem> {
    const userObjectId = new Types.ObjectId(userId);

    const doc: Partial<IGroceryItem> & { user: Types.ObjectId } = {
      user: userObjectId,
      pantryItem: data.pantryItem,
      name: String(data.name).trim(),
      nameKey: data.nameKey,
      quantity: data.quantity,
      unit: data.unit.trim(),
      isChecked: data.isChecked ?? false,
      expirationDate: data.expirationDate ?? null,
      label: data.label ?? null,
      brand: data.brand ?? null,
    };

    // 👇 use `new` + `save` to avoid the array overloads on `create`
    const instance = new GroceryItem(doc as any);
    const created = await instance.save();
    return created as IGroceryItem;
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
