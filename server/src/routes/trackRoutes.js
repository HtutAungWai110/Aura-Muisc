import express from "express";
import authMiddleware from "../middleware/middleware.js";
import {
  addTracks,
  getTracks,
  deleteTrack,
  getTracksCount,
} from "../controllers/trackControllers.js";
import multer from "multer";
import fs from "fs";
import validationMiddleware from "../middleware/ValidationMiddleware.js";
import paramValidationMiddleware from "../middleware/paramValidationMiddleware.js";
import fileValidationMiddleware from "../middleware/fileValidationMiddleware.js";
import { idSchema } from "../validators/paramValidators.js";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/add",
  authMiddleware,
  upload.array("tracks"),
  fileValidationMiddleware({ field: "tracks", multiple: true }),
  addTracks,
);
router.get("/all", authMiddleware, getTracks);
router.get("/all/count", authMiddleware, getTracksCount);
router.delete(
  "/delete/:id",
  authMiddleware,
  paramValidationMiddleware(idSchema),
  deleteTrack,
);

export default router;
