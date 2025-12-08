// src/server.ts
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import { app } from "./app";

dotenv.config();

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    // 1️⃣ Connect to MongoDB
    await connectDB();

    // 2️⃣ Start listening for HTTP requests
    app.listen(PORT, () => {
      console.log(`🚀 Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("🔥 Failed to start server:", error);
  }
}

startServer();