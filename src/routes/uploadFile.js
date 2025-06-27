import express from "express";
import { uploadMiddleware } from "../middlewares/uploadMiddleware.js";
import { uploadFile } from "../controllers/uploadFileController.js";

const router = express.Router();

router.post("/upload", uploadMiddleware.single("file"), uploadFile);

export default router;
