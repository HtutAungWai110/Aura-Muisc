import authMiddleware from "../middleware/middleware.js";
import {
  createPlaylist,
  getAllPlaylists,
  getPlaylist,
  addTrackToPlaylist,
} from "../controllers/playlistControllers.js";
import validationMiddleware from "../middleware/ValidationMiddleware.js";
import { playlistTitleSchema } from "../validators/playlistValidator.js";
import express from "express";

const router = express.Router();

router.post(
  "/create",
  authMiddleware,
  validationMiddleware(playlistTitleSchema),
  createPlaylist,
);

router.get("/all", authMiddleware, getAllPlaylists);
router.get("/:id", authMiddleware, getPlaylist);
router.post("/:id/add/:trackId", authMiddleware, addTrackToPlaylist);

export default router;
