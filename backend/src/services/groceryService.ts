import { groceryDao } from "../dao/groceryDao";
import { fridgeService } from "./fridgeService";
import { IGroceryItem } from "../models/GroceryItem";

export const groceryService = {
  listForUser(userId: string) {
    return groceryDao.findByUser(userId);
  },

  createForUser(
    userId: string,
    data: {
      name: string;
      quantity?: number;
      unit?: string;
      label?: string | null;
      expirationDate?: Date | null;
    }
  ) {
    const quantity = data.quantity ?? 1;
    const unit = data.unit ?? "piece";

    const payload: {
      name: string;
      quantity: number;
      unit: string;
      label?: string | null;
      expirationDate?: Date | null;
    } = {
      name: data.name,
      quantity,
      unit,
    };

    // Only add these keys if the caller actually passed them
    if (data.label !== undefined) {
      payload.label = data.label; // type: string | null
    }

    if (data.expirationDate !== undefined) {
      payload.expirationDate = data.expirationDate; // type: Date | null
    }

    return groceryDao.createForUser(userId, payload);
  },

  updateForUser(
    userId: string,
    id: string,
    updates: {
      name?: string;
      quantity?: number;
      unit?: string;
      label?: string | null;
      expirationDate?: Date | null;
    }
  ) {
    const dbUpdates: Partial<IGroceryItem> = {};

    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
    if (updates.unit !== undefined) dbUpdates.unit = updates.unit;
    if (updates.label !== undefined) dbUpdates.label = updates.label;
    if (updates.expirationDate !== undefined) {
      // @ts-ignore – depends on your interface
      dbUpdates.expirationDate = updates.expirationDate as any;
    }

    return groceryDao.updateByIdAndUser(id, userId, dbUpdates);
  },

  deleteForUser(userId: string, id: string) {
    // IMPORTANT: we intentionally do NOT touch fridge items here
    // If the grocery item was already checked → fridge item stays.
    return groceryDao.deleteByIdAndUser(id, userId);
  },

  // Toggle + sync with fridge
  async toggleForUser(userId: string, id: string) {
    const item = await groceryDao.findOneByIdAndUser(id, userId);
    if (!item) return null;

    item.isChecked = !item.isChecked;
    await item.save();

    if (item.isChecked) {
      // checked on → ensure fridge item exists
      await fridgeService.ensureFromGrocery(item);
    } else {
      // unchecked → remove linked fridge item
      await fridgeService.removeFromGrocery(item);
    }

    return item;
  },
};
