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

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = `./uploads/${req.userId}/tracks`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

router.post("/add", authMiddleware, upload.array("tracks"), addTracks);
router.get("/all", authMiddleware, getTracks);
router.get("/all/count", authMiddleware, getTracksCount);
router.delete("/delete/:id", authMiddleware, deleteTrack);

export default router;
