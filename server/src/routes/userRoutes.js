import express from "express";
import authMiddleware from "../middleware/middleware.js";
import { getUser } from "../controllers/userControllers.js";

const router = express.Router();

router.get("/me", authMiddleware, getUser);

export default router;
