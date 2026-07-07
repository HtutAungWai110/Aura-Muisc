import authMiddleware from "../middleware/middleware.js";
import {
  createPlaylist,
  getAllPlaylists,
  getPlaylist,
  addTrackToPlaylist,
  updateCoverPhoto,
  removeTrackFromPlaylist,
  deletePlaylist,
} from "../controllers/playlistControllers.js";
import validationMiddleware from "../middleware/ValidationMiddleware.js";
import paramValidationMiddleware from "../middleware/paramValidationMiddleware.js";
import fileValidationMiddleware from "../middleware/fileValidationMiddleware.js";
import { playlistTitleSchema } from "../validators/playlistValidator.js";
import {
  playlistIdSchema,
  trackIdSchema,
  playlistAndTrackIdSchema,
} from "../validators/paramValidators.js";
import express from "express";
import fs from "fs";
import multer from "multer";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });
//Test created
router.post(
  "/create",
  authMiddleware,
  validationMiddleware(playlistTitleSchema),
  createPlaylist,
);
//Test created
router.get("/all", authMiddleware, getAllPlaylists);
//Test created
router.get(
  "/:id",
  authMiddleware,
  paramValidationMiddleware(playlistIdSchema),
  getPlaylist,
);

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
  upload.single("cover"),
  fileValidationMiddleware({ field: "cover" }),
  updateCoverPhoto,
);

router.delete(
  "/:id/track/:trackId/remove",
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
