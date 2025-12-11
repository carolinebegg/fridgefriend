// src/services/groceryService.ts
import { groceryDao } from "../dao/groceryDao";
import { fridgeService } from "./fridgeService";
import { IGroceryItem } from "../models/GroceryItem";
import { pantryDao } from "../dao/pantryDao";
import { makeNameKey } from "../utils/nameKey";

export const groceryService = {
  listForUser(userId: string) {
    return groceryDao.findByUser(userId);
  },

  async createForUser(
    userId: string,
    data: {
      name: string;
      quantity?: number;
      unit?: string;
      label?: string | null;
      brand?: string | null;
      expirationDate?: Date | null;
    }
  ) {
    const quantity = data.quantity ?? 1;
    const unit = data.unit ?? "piece";

    // Link to PantryItem
    const pantryItem = await pantryDao.findOrCreateForUser(userId, data.name, {
      label: data.label ?? undefined,
      brand: data.brand ?? undefined,
      defaultUnit: unit ?? undefined,
    });

    const nameKey = makeNameKey(data.name);

    const payload = {
      pantryItem: pantryItem._id,
      name: data.name,
      nameKey,
      quantity,
      unit,
      label: data.label ?? null,
      brand: data.brand ?? pantryItem.brand ?? null,
      expirationDate: data.expirationDate ?? null,
      isChecked: false,
    };

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
      brand?: string | null;
      expirationDate?: Date | null;
      isChecked?: boolean;
    }
  ) {
    const dbUpdates: Partial<IGroceryItem> = {};

    if (updates.name !== undefined) {
      dbUpdates.name = updates.name;
      dbUpdates.nameKey = makeNameKey(updates.name);
      // We are not changing pantryItem here; it remains the canonical identity
    }
    if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
    if (updates.unit !== undefined) dbUpdates.unit = updates.unit;
    if (updates.label !== undefined) dbUpdates.label = updates.label;
    if (updates.brand !== undefined) dbUpdates.brand = updates.brand;
    if (updates.expirationDate !== undefined) {
      // @ts-ignore – depends on your interface
      dbUpdates.expirationDate = updates.expirationDate as any;
    }
    if (updates.isChecked !== undefined) dbUpdates.isChecked = updates.isChecked;

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
