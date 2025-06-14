import express from "express";
const router = express.Router();
import { checkValidationResult, checkAdmin } from "../middlewares/index.js";
import {
  createcategoryValidation,
  updateCategoryValidation,
} from "../validations/categoryValidation.js";
import { branchIdValidation } from "../validations/generalValidation.js";
import { categoryController } from "../controllers/index.js";

router.post(
  "/",
  checkAdmin,
  createcategoryValidation,
  checkValidationResult,
  categoryController.createCategory
);

router.put(
  "/",
  checkAdmin,
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

router.delete("/:id",checkAdmin, categoryController.deleteCategory);

export default router;
