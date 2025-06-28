import { body, param } from "express-validator";

export const createcategoryValidation = [
  body("name")
    .notEmpty()
    .withMessage("Category name is required")
    .isString()
    .withMessage("Category name must be a string"),

  body("image")
    .notEmpty()
    .withMessage("Category image is required")
    .isURL()
    .withMessage("Image must be a valid URL"),

  body("branch_id")
    .notEmpty()
    .withMessage("Branch ID is required")
    .isUUID()
    .withMessage("Branch ID must be a valid UUID"),

  body("items")
    .isArray({ min: 1 })
    .withMessage("A category must include at least one item"),

  body("items.*.name").notEmpty().withMessage("Item name is required"),

  body("items.*.price").notEmpty().withMessage("Item price is required"),

  body("items.*.image")
    .notEmpty()
    .withMessage("Item image is required")
    .isURL()
    .withMessage("Item image must be a valid URL"),

  body("items.*.description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),
];

export const updateCategoryValidation = [
  body("id")
    .notEmpty()
    .withMessage("Category ID is required.")
    .isUUID()
    .withMessage("Category ID must be a valid UUID."),

  body("name")
    .notEmpty()
    .withMessage("Category name is required.")
    .isString()
    .withMessage("Category name must be a string."),

  body("image")
    .notEmpty()
    .withMessage("Category image is required.")
    .isURL()
    .withMessage("Category image must be a valid URL."),

  body("branch_id")
    .notEmpty()
    .withMessage("Branch ID is required.")
    .isUUID()
    .withMessage("Branch ID must be a valid UUID."),

  body("items")
    .isArray({ min: 1 })
    .withMessage("You must provide at least one item."),

  body("items.*.id")
    .optional()
    .isUUID()
    .withMessage("Item ID must be a valid UUID if provided."),

  body("items.*.name").notEmpty().withMessage("Item name is required."),

  body("items.*.price").notEmpty().withMessage("Item price is required."),

  body("items.*.image")
    .notEmpty()
    .withMessage("Item image is required.")
    .isURL()
    .withMessage("Item image must be a valid URL."),

  body("items.*.description")
    .optional()
    .isString()
    .withMessage("Description must be a string."),
];

export const createItemValidation = [
  body("name")
    .notEmpty()
    .withMessage("Item name is required")
    .isLength({ max: 255 })
    .withMessage("Item name must be under 255 characters"),

  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .matches(/^\d+(\.\d{1,2})?$/)
    .withMessage("Price must be a valid number (e.g., 9.99)"),

  body("description")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Description must be under 1000 characters"),

  body("category_id")
    .notEmpty()
    .withMessage("Category ID is required")
    .isUUID()
    .withMessage("Category ID must be a valid UUID"),
];

export const createModifierValidation = [
  body()
    .isArray({ min: 1 })
    .withMessage("Request body must be a non-empty array"),

  body("*.name")
    .notEmpty()
    .withMessage("Each modifier must have a name")
    .isString()
    .withMessage("Modifier name must be a string"),

  body("*.branch_id")
    .notEmpty()
    .withMessage("Each modifier must have a branch_id")
    .isUUID()
    .withMessage("branchId must be a valid UUID"),

  body("*.modifierOptions")
    .isArray({ min: 1 })
    .withMessage("Each modifier must have at least one modifierOption"),

  body("*.modifierOptions.*.name")
    .notEmpty()
    .withMessage("Each modifierOption must have a name")
    .isString()
    .withMessage("modifierOption name must be a string"),

  body("*.modifierOptions.*.price")
    .notEmpty()
    .withMessage("Each modifierOption must have a price")
    .isInt({ min: 0 })
    .withMessage("modifierOption price must be a non-negative integer"),
];

export const updateModifierValidation = [
  param("id")
    .notEmpty()
    .withMessage("Modifier ID (param) is required")
    .isUUID()
    .withMessage("Modifier ID must be a valid UUID"),

  body("name")
    .notEmpty()
    .withMessage("Modifier name is required")
    .isString()
    .withMessage("Modifier name must be a string"),

  body("modifierOptions")
    .isArray({ min: 1 })
    .withMessage("modifierOptions must be a non-empty array"),

  body("modifierOptions.*.id")
    .optional()
    .isUUID()
    .withMessage("modifierOption id must be a valid UUID if provided"),

  body("modifierOptions.*.name")
    .notEmpty()
    .withMessage("Each modifierOption must have a name")
    .isString()
    .withMessage("modifierOption name must be a string"),

  body("modifierOptions.*.price")
    .notEmpty()
    .withMessage("Each modifierOption must have a price")
    .isInt({ min: 0 })
    .withMessage("modifierOption price must be a non-negative integer"),
];

