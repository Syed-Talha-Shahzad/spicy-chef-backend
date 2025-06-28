import express from "express";
const router = express.Router();
import { checkValidationResult, checkAdmin } from "../middlewares/index.js";
import {
  createModifierValidation,
  updateModifierValidation,
} from "../validations/categoryValidation.js";

import { branchIdValidation } from "../validations/generalValidation.js";
import { modifierController } from "../controllers/index.js";

router.post(
  "/",
  checkAdmin,
  createModifierValidation,
  checkValidationResult,
  modifierController.createModifier
);

router.put(
  "/:id",
  checkAdmin,
  updateModifierValidation,
  checkValidationResult,
  modifierController.updateModifier
);

router.get(
  "/",
  branchIdValidation,
  checkValidationResult,
  modifierController.modifierListing
);

router.get("/:id", modifierController.modifierDetails);

router.delete("/:id", modifierController.deleteModifier);

export default router;
