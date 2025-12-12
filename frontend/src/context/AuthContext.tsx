// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "../api/client"; 

type User = {
  id: string;
  username: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("ff_token");
        const storedUser = await AsyncStorage.getItem("ff_user");
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          apiClient.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${storedToken}`;
        }
      } catch (e) {
        console.warn("Failed to load auth state", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const login = async (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    apiClient.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${newToken}`;
    await AsyncStorage.setItem("ff_token", newToken);
    await AsyncStorage.setItem("ff_user", JSON.stringify(newUser));
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    delete apiClient.defaults.headers.common["Authorization"];
    await AsyncStorage.multiRemove(["ff_token", "ff_user"]);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
