import { body } from "express-validator";

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
  
    body("items.*.name")
      .notEmpty()
      .withMessage("Item name is required."),
  
    body("items.*.price")
      .notEmpty()
      .withMessage("Item price is required."),
  
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
  
