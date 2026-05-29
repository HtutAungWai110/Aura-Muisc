import express from "express";
import User from "../models/user.js";
import authMiddleware from "../middleware/middleware.js";

const router = express.Router();

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    return res.json({
      message: "Successfully fetched user's information",
      user,
    });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

export default router;
