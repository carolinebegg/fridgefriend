// src/services/pantryService.ts
import { pantryDao } from "../dao/pantryDao";

export const pantryService = {
  findOrCreateForUser: pantryDao.findOrCreateForUser,
  // later: listForUser, update, merge, etc.
};
