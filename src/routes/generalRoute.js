import express from "express";
import { checkValidationResult, checkAdmin } from "../middlewares/index.js";
import { deliveryFeeValidation, validateBranchTimings } from "../validations/generalValidation.js";
import { generalController } from "../controllers/index.js";
const router = express.Router();

router.post(
  "/delievery-fee",
  checkAdmin,
  deliveryFeeValidation,
  checkValidationResult,
  generalController.deliveryFee
);

router.post(
  "/branch-timing",
  checkAdmin,
  validateBranchTimings,
  checkValidationResult,
  generalController.createOrUpdateBranchTimings
);

router.get("/settings/:id", generalController.getSetting);
router.get("/branch-timing/:id", generalController.getBranchTimings);

export default router;
