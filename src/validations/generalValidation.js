import { check, query, body } from "express-validator";

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

export const validateBranchTimings = [
  body('branchId')
    .isUUID().withMessage('branchId must be a valid UUID'),

  body('timings')
    .isArray({ min: 1 }).withMessage('timings must be a non-empty array'),

  body('timings.*.day')
    .isString().withMessage('day must be a string')
    .isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
    .withMessage('Invalid day of the week'),

  body('timings.*.openTime')
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage('openTime must be in HH:mm format (24-hour)'),

  body('timings.*.closeTime')
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage('closeTime must be in HH:mm format (24-hour)'),
];
