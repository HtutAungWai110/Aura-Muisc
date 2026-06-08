import authMiddleware from "../middleware/middleware.js";
import {
  createPlaylist,
  getAllPlaylists,
  getPlaylist,
  addTrackToPlaylist,
  updateCoverPhoto,
} from "../controllers/playlistControllers.js";
import validationMiddleware from "../middleware/ValidationMiddleware.js";
import { playlistTitleSchema } from "../validators/playlistValidator.js";
import express from "express";
import fs from "fs";
import multer from "multer";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, res, cb) {
    const dir = `./uploads/${req.userId}/covers`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, `cover-${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

router.post(
  "/create",
  authMiddleware,
  validationMiddleware(playlistTitleSchema),
  createPlaylist,
);

router.get("/all", authMiddleware, getAllPlaylists);
router.get("/:id", authMiddleware, getPlaylist);
router.post("/:id/add/:trackId", authMiddleware, addTrackToPlaylist);
router.post(
  "/:id/cover",
  authMiddleware,
  upload.single("cover"),
  updateCoverPhoto,
);

export default router;
