// src/services/fridgeService.ts
import { fridgeDao } from "../dao/fridgeDao";
import { IFridgeItem } from "../models/FridgeItem";
import { IGroceryItem } from "../models/GroceryItem";

export const fridgeService = {
  listForUser(userId: string) {
    return fridgeDao.findByUser(userId);
  },

  createManualForUser(
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

    if (data.label !== undefined) {
      payload.label = data.label;
    }

    if (data.expirationDate !== undefined) {
      payload.expirationDate = data.expirationDate;
    }

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
      expirationDate?: Date | null;
    }
  ) {
    const dbUpdates: Partial<IFridgeItem> = {};

    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
    if (updates.unit !== undefined) dbUpdates.unit = updates.unit;
    if (updates.label !== undefined) dbUpdates.label = updates.label;
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

    const payload: {
      user: any;
      _id: any;
      name: string;
      quantity: number;
      unit: string;
      label?: string | null;
      expirationDate?: Date | null;
    } = {
      user: grocery.user,
      _id: grocery._id,
      name: grocery.name,
      quantity: grocery.quantity,
      unit: grocery.unit,
    };

    if (grocery.label !== undefined) {
      payload.label = grocery.label;
    }

    if (grocery.expirationDate !== undefined) {
      payload.expirationDate = grocery.expirationDate;
    }

    return fridgeDao.createFromGrocery(payload);
  },

  async removeFromGrocery(grocery: IGroceryItem) {
    const userId = String(grocery.user);
    const groceryId = String(grocery._id);
    return fridgeDao.deleteFromGrocery(userId, groceryId);
  },
};
