import express from "express";
const router = express.Router();
import { checkValidationResult } from "../middlewares/index.js";
import {
  createcategoryValidation,
  updateCategoryValidation,
} from "../validations/categoryValidation.js";
import { branchIdValidation } from "../validations/generalValidation.js";
import { categoryController } from "../controllers/index.js";

router.post(
  "/",
  createcategoryValidation,
  checkValidationResult,
  categoryController.createCategory
);

router.put(
  "/",
  updateCategoryValidation,
  checkValidationResult,
  categoryController.updateCategory
);

router.get("/:id", categoryController.categoryDetails);

router.get(
  "/",
  branchIdValidation,
  checkValidationResult,
  categoryController.listingCategories
);

router.delete("/:id", categoryController.deleteCategory);

export default router;
