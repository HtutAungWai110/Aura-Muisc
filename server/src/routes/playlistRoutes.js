import authMiddleware from "../middleware/middleware.js";
import { createPlaylist } from "../controllers/playlistControllers.js";
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

export default router;
