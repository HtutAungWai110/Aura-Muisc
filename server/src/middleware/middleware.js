import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { config } from "dotenv";
config();

export default async function authMiddleware(req, res, next) {
  // Read from Authorization header first, fallback to cookies
  let accessToken = null;
  let refreshToken = null;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    accessToken = authHeader.slice(7);
  }

  // Fallback: read from cookies (same-origin dev, or refresh endpoint)
  if (!accessToken) {
    accessToken = req.cookies?.accessToken;
  }
  refreshToken = req.cookies?.refreshToken;

  if (!accessToken && !refreshToken) {
    return res.status(401).json({
      message: "Unauthorized!",
    });
  }

  try {
    if (accessToken) {
      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
      req.userId = decoded.userId;
      return next();
    }
  } catch (error) {
    if (!refreshToken) {
      return res.status(401).json({
        message: "Unauthorized!",
      });
    }
  }

  // Handle Refresh Token
  if (refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      const { userId } = decoded;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(401).json({
          message: "Unauthorized!",
        });
      }

      const newAccessToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        {
          expiresIn: "60m",
        },
      );

      res.cookie("accessToken", newAccessToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 1000 * 60 * 60, // 1 hour
        path: "/",
      });

      req.userId = user._id;
      return next();
    } catch (error) {
      return res.status(401).json({
        message: "Unauthorized!",
      });
    }
  }
}
