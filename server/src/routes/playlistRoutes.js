import authMiddleware from "../middleware/middleware.js";
import { createPlaylist } from "../controllers/playlistControllers.js";
import express from "express";

const router = express.Router();

router.post("/create", authMiddleware, createPlaylist);

export default router;
