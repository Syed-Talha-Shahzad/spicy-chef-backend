import express from "express";
import { checkValidationResult, checkAdmin } from "../middlewares/index.js";
import { deliveryFeeValidation } from "../validations/generalValidation.js";
import { generalController } from "../controllers/index.js";
const router = express.Router();

router.post(
  "/delievery-fee",
  checkAdmin,
  deliveryFeeValidation,
  checkValidationResult,
  generalController.deliveryFee
);

router.get("/settings/:id", generalController.getSetting);

export default router;
