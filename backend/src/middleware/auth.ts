import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../db/db";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res
        .status(401)
        .json({ 
          success: false,
          message: "Access denied. No token provided." 
        });
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      return res
        .status(500)
        .json({ 
          success: false,
          message: "Server error: JWT secret not configured." 
        });
    }

    const decoded = jwt.verify(token, secret) as { id: string; email: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res
        .status(403)
        .json({ 
          success: false,
          message: "Invalid token. User not found." 
        });
    }

    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (error) {
    return res.status(403).json({ 
      success: false,
      message: "Invalid token." 
    });
  }
};

// Alias for authenticateToken to match the name used in our routes
export const authenticate = authenticateToken;
