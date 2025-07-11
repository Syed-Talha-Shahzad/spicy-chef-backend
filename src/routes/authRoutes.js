import express from "express";
const router = express.Router();
import { authController } from "../controllers/index.js";
import { checkAuthUser, checkValidationResult } from "../middlewares/index.js";
import {
  signInValidation,
  signUpValidation,
} from "../validations/authValidation.js";

router.post(
  "/signin",
  signInValidation,
  checkValidationResult,
  authController.signIn
);

router.post(
  "/signup",
  signUpValidation,
  checkValidationResult,
  authController.signUp
);

router.get("/profile", checkAuthUser, authController.profile);

export default router;
