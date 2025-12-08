// src/api/groceryApi.ts
import { apiClient } from "./client";

// This reflects what the backend returns from GroceryItem
export interface GroceryItem {
  _id: string;
  name: string;
  quantity: number;
  unit: string;
  label?: string;
  isChecked: boolean;
  expirationDate?: string; // ISO string
}

type CreateGroceryPayload = {
  name: string;
  quantity?: number;
  unit?: string;
  label?: string;
  expirationDate?: string;
};

export const groceryApi = {
  // GET /api/groceries
  getAll: () => apiClient.get<GroceryItem[]>("/groceries"),

  // POST /api/groceries
  create: (item: CreateGroceryPayload) =>
    apiClient.post<GroceryItem>("/groceries", item),

  // PATCH /api/groceries/:id
  update: (id: string, item: Partial<CreateGroceryPayload>) =>
    apiClient.patch<GroceryItem>(`/groceries/${id}`, item),

  // DELETE /api/groceries/:id
  remove: (id: string) =>
    apiClient.delete<void>(`/groceries/${id}`),

  // POST /api/groceries/:id/toggle
  toggle: (id: string) =>
    apiClient.post<GroceryItem>(`/groceries/${id}/toggle`),
};
