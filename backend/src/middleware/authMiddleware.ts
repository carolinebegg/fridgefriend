// src/middleware/authMiddleware.ts
import {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: string;
}

interface JwtPayload {
  userId: string;
}

// Now this matches what Express expects for middleware
export const requireAuth: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res
      .status(401)
      .json({ error: "Missing or invalid Authorization header" });
    return;
  }

  const token = authHeader.substring("Bearer ".length);

  try {
    const secret = process.env.JWT_SECRET || "dev_secret_change_me";
    const decoded = jwt.verify(token, secret) as JwtPayload;

    (req as AuthRequest).userId = decoded.userId;
    next();
  } catch (err) {
    console.error("JWT verification error:", err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
