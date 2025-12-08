// src/api/authApi.ts
import { apiClient } from "./client";

export interface LoginPayload {
  emailOrUsername: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export const authApi = {
  register: (data: RegisterPayload) =>
    apiClient.post("/auth/register", data),

  login: (data: LoginPayload) =>
    apiClient.post("/auth/login", data),

  me: () => apiClient.get("/auth/me"),
};
