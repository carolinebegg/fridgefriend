// src/dao/pantryDao.ts
import { Types } from "mongoose";
import { PantryItem, IPantryItem } from "../models/PantryItem";
import { makeNameKey } from "../utils/nameKey";

export type PantryOptions = {
  label?: string | undefined;
  brand?: string | undefined;
  defaultUnit?: string | undefined;
};

export const pantryDao = {
  async findOrCreateForUser(
    userId: string,
    name: string,
    options?: PantryOptions
  ): Promise<IPantryItem> {
    const nameKey = makeNameKey(name);
    const userObjectId = new Types.ObjectId(userId);

    const cleanBrand =
      options?.brand && options.brand.trim() !== ""
        ? options.brand.trim()
        : undefined;

    const existing = await PantryItem.findOne({
      user: userObjectId,
      nameKey,
      brand: cleanBrand ?? null,
    });

    if (existing) return existing;

    const doc: Partial<IPantryItem> & {
      user: Types.ObjectId;
      name: string;
      nameKey: string;
    } = {
      user: userObjectId,
      name: name.trim(),
      nameKey,
    };

    if (options?.label && options.label.trim() !== "") {
      doc.label = options.label.trim();
    }

    if (cleanBrand) {
      doc.brand = cleanBrand;
    }

    if (options?.defaultUnit && options.defaultUnit.trim() !== "") {
      doc.defaultUnit = options.defaultUnit.trim();
    }

    // 👇 use `new` + `save` here too
    const instance = new PantryItem(doc as any);
    const item = await instance.save();
    return item as IPantryItem;
  },
};
