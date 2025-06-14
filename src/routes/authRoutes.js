import express from "express";
const router = express.Router();
import { authController } from "../controllers/index.js";
import { checkValidationResult } from "../middlewares/index.js"
import { signInValidation } from "../validations/authValidation.js";

router.post(
  "/signin",
  signInValidation,
  checkValidationResult,
  authController.signIn
);

export default router;
