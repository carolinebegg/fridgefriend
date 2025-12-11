// src/services/fridgeService.ts
import { fridgeDao } from "../dao/fridgeDao";
import { IFridgeItem } from "../models/FridgeItem";
import { IGroceryItem } from "../models/GroceryItem";
import { pantryDao } from "../dao/pantryDao";
import { makeNameKey } from "../utils/nameKey";

export const fridgeService = {
  listForUser(userId: string) {
    return fridgeDao.findByUser(userId);
  },

  async createManualForUser(
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

    // Find or create PantryItem for this user + name (+ optional brand/label)
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
    };

    return fridgeDao.createManualForUser(userId, payload);
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
    }
  ) {
    const dbUpdates: Partial<IFridgeItem> = {};

    if (updates.name !== undefined) {
      dbUpdates.name = updates.name;
      dbUpdates.nameKey = makeNameKey(updates.name);
      // NOTE: we are NOT relinking pantryItem here to keep it simple;
      // pantryItem remains the canonical identity.
    }
    if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
    if (updates.unit !== undefined) dbUpdates.unit = updates.unit;
    if (updates.label !== undefined) dbUpdates.label = updates.label;
    if (updates.brand !== undefined) dbUpdates.brand = updates.brand;
    if (updates.expirationDate !== undefined) {
      dbUpdates.expirationDate = updates.expirationDate as any;
    }

    return fridgeDao.updateByIdAndUser(id, userId, dbUpdates);
  },

  deleteForUser(userId: string, id: string) {
    return fridgeDao.deleteByIdAndUser(id, userId);
  },

  // Sync helpers used by groceryService
  async ensureFromGrocery(grocery: IGroceryItem) {
    const userId = String(grocery.user);
    const groceryId = String(grocery._id);

    const existing = await fridgeDao.findByGroceryLink(userId, groceryId);
    if (existing) return existing;

    const payload = {
      user: grocery.user,
      _id: grocery._id,
      pantryItem: grocery.pantryItem,
      name: grocery.name,
      nameKey: grocery.nameKey,
      quantity: grocery.quantity,
      unit: grocery.unit,
      label: grocery.label ?? null,
      brand: grocery.brand ?? null,
      expirationDate: grocery.expirationDate ?? null,
    };

    return fridgeDao.createFromGrocery(payload);
  },

  async removeFromGrocery(grocery: IGroceryItem) {
    const userId = String(grocery.user);
    const groceryId = String(grocery._id);
    return fridgeDao.deleteFromGrocery(userId, groceryId);
  },
};
