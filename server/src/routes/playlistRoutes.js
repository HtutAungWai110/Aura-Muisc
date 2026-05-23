import User from "../models/user.js";
import authMiddleware from "../middleware/middleware.js";
import express from "express";

const router = express.Router();

router.post("/create", authMiddleware, (req, res) => {
  return res.json({ message: "Playlist created", id: req.userId });
});

export default router;
