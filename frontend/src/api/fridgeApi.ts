// src/api/fridgeApi.ts
import { apiClient } from "./client";

// This should mirror what the backend returns from FridgeItem
export interface FridgeItem {
  _id: string;
  name: string;
  quantity: number;
  unit: string;
  label?: string | null;
  brand?: string | null;
  expirationDate?: string; // ISO string or undefined

  // optional extras (only if your backend sends them)
  addedFromGroceryItem?: string | null;
  addedManually?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

type CreateFridgePayload = {
  name: string;
  quantity: number;
  unit: string;
  label?: string;
  brand?: string;
  expirationDate?: string; // ISO string, same as grocery
};

type UpdateFridgePayload = Partial<CreateFridgePayload>;

export const fridgeApi = {
  // GET /fridge
  async list(): Promise<FridgeItem[]> {
    const res = await apiClient.get<FridgeItem[]>("/fridge");
    return res.data;
  },

  // POST /fridge
  async create(item: CreateFridgePayload): Promise<FridgeItem> {
    const res = await apiClient.post<FridgeItem>("/fridge", item);
    return res.data;
  },

  // PUT /fridge/:id
  async update(id: string, item: UpdateFridgePayload): Promise<FridgeItem> {
    const res = await apiClient.put<FridgeItem>(`/fridge/${id}`, item);
    return res.data;
  },

  // DELETE /fridge/:id
  remove: (id: string) => apiClient.delete<void>(`/fridge/${id}`),
};
