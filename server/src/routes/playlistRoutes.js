import authMiddleware from "../middleware/middleware.js";
import {
  createPlaylist,
  getAllPlaylists,
  getPlaylist,
  addTrackToPlaylist,
  getCoverUploadUrl,
  updateCoverPhoto,
  removeTrackFromPlaylist,
  deletePlaylist,
  updatePlaylist,
  searchPlaylists,
} from "../controllers/playlistControllers.js";
import validationMiddleware from "../middleware/ValidationMiddleware.js";
import paramValidationMiddleware from "../middleware/paramValidationMiddleware.js";
import { playlistTitleSchema } from "../validators/playlistValidator.js";
import {
  playlistIdSchema,
  trackIdSchema,
  playlistAndTrackIdSchema,
} from "../validators/paramValidators.js";
import express from "express";

const router = express.Router();

router.post(
  "/create",
  authMiddleware,
  validationMiddleware(playlistTitleSchema),
  createPlaylist,
);

router.get("/all", authMiddleware, getAllPlaylists);

router.get("/search", authMiddleware, searchPlaylists);

router.get(
  "/:id",
  authMiddleware,
  paramValidationMiddleware(playlistIdSchema),
  getPlaylist,
);

router.post("/cover-upload-url", authMiddleware, getCoverUploadUrl);

router.post(
  "/:id/add/:trackId",
  authMiddleware,
  paramValidationMiddleware(playlistAndTrackIdSchema),
  addTrackToPlaylist,
);

router.post(
  "/:id/cover",
  authMiddleware,
  paramValidationMiddleware(playlistIdSchema),
  updateCoverPhoto,
);

router.post(
  "/update/:id",
  authMiddleware,
  paramValidationMiddleware(playlistIdSchema),
  updatePlaylist,
);

router.delete(
  "/remove/:id/track/:trackId",
  authMiddleware,
  paramValidationMiddleware(playlistAndTrackIdSchema),
  removeTrackFromPlaylist,
);

router.delete(
  "/delete/:id",
  authMiddleware,
  paramValidationMiddleware(playlistIdSchema),
  deletePlaylist,
);

export default router;
