import { check, query } from "express-validator";

export const branchValidation = [
  check("name").notEmpty().withMessage("Name is required"),
  check("address").notEmpty().withMessage("Address is required"),
];

export const branchIdValidation = [
  query("branch_id")
    .notEmpty()
    .withMessage("branch_id is required")
    .isUUID()
    .withMessage("branch_id must be a valid UUID"),
];

export const deliveryFeeValidation = [
  check("branch_id")
    .notEmpty()
    .withMessage("branch_id is required")
    .isUUID()
    .withMessage("branch_id must be a valid UUID"),
  check("deliveryFee")
    .notEmpty()
    .withMessage("Delivery fee is required")
    .isFloat({ min: 0 })
    .withMessage("Delivery fee must be a non-negative integer"),
  check("serviceFee")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Delivery fee must be a non-negative integer"),
  check("deliveryTime")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Delivery fee must be a non-negative integer"),
  check("discount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Delivery fee must be a non-negative integer"),
];
