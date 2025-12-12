// src/api/client.ts
import axios, { InternalAxiosRequestConfig } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// IMPORTANT: Change to your LAN IP so Expo Go can reach your backend
const API_BASE_URL = "http://192.168.1.158:4000/api";
// const API_BASE_URL = "http://10.103.75.119:4000/api";
// const API_BASE_URL = "http://172.20.10.2:4000/api";
// const API_BASE_URL = "http://10.103.171.58:4000/api";
// const API_BASE_URL = "http://192.168.1.158:4000/api";
// const API_BASE_URL = "http://10.123.1.156:4000/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Axios defines that config.headers is always an AxiosHeaders object in
// InternalAxiosRequestConfig, so mutating it is valid.
type Config = InternalAxiosRequestConfig<any>;

apiClient.interceptors.request.use(
  async (config: Config) => {
    const token = await AsyncStorage.getItem("ff_token"); // <-- FIXED

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);
