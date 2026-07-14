import express from "express";
import authMiddleware from "../middleware/middleware.js";
import {
  getUploadUrls,
  saveMetadata,
  getTracks,
  deleteTrack,
  getTracksCount,
} from "../controllers/trackControllers.js";
import validationMiddleware from "../middleware/ValidationMiddleware.js";
import paramValidationMiddleware from "../middleware/paramValidationMiddleware.js";
import { idSchema } from "../validators/paramValidators.js";

const router = express.Router();

router.post("/get-upload-urls", authMiddleware, getUploadUrls);
router.post("/save-metadata", authMiddleware, saveMetadata);
router.get("/all", authMiddleware, getTracks);
router.get("/all/count", authMiddleware, getTracksCount);
router.delete(
  "/delete/:id",
  authMiddleware,
  paramValidationMiddleware(idSchema),
  deleteTrack,
);

export default router;
