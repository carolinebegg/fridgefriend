// src/routes/userRoutes.ts
import express from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { AuthRequest, requireAuth } from "../middleware/authMiddleware";

const router = express.Router();

// GET /api/users/me
router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (err) {
    console.error("Error in GET /users/me:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/users/me
// Body: { username?, email? }
router.put("/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { username, email } = req.body;

    const updates: Partial<{ username: string; email: string }> = {};
    if (username) updates.username = username;
    if (email) updates.email = email;

    // Optionally: check for uniqueness before updating
    if (email) {
      const existingEmail = await User.findOne({
        email,
        _id: { $ne: req.userId },
      });
      if (existingEmail) {
        return res.status(400).json({ error: "Email already in use" });
      }
    }

    if (username) {
      const existingUsername = await User.findOne({
        username,
        _id: { $ne: req.userId },
      });
      if (existingUsername) {
        return res.status(400).json({ error: "Username already taken" });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (err) {
    console.error("Error in PUT /users/me:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/users/me/password
// Body: { currentPassword, newPassword }
router.put("/me/password", requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const user = await User.findById(req.userId).select("+passwordHash");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = newHash;
    await user.save();

    return res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Error in PUT /users/me/password:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
