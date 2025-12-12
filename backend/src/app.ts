// src/app.ts
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { Types } from "mongoose";

import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import groceryRoutes from "./routes/groceryRoutes";
import fridgeRoutes from "./routes/fridgeRoutes";
import recipeRoutes from "./routes/recipeRoutes";
import aiRecipeRoutes from "./routes/aiRecipeRoutes";

dotenv.config();

export const app = express();

// Middleware
app.use(cors());          // optional but nice to have
app.use(express.json());  // parse JSON bodies

// Simple test route to confirm server works
app.get("/", (_req, res) => {
  res.send("FridgeFriend backend is running!");
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Auth + user routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/groceries", groceryRoutes);
app.use("/api/fridge", fridgeRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/ai", aiRecipeRoutes);
