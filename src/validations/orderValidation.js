import { body } from "express-validator";

export const createOrderValidation = [
  body("orderType")
    .notEmpty()
    .withMessage("Order type is required")
    .isIn(["DELIVERY", "COLLECTION"])
    .withMessage("Order type must be DELIVERY or COLLECTION"),

  body("paymentType")
    .notEmpty()
    .withMessage("Payment type is required")
    .isIn(["CASH", "STRIPE"])
    .withMessage("Payment type must be CASH or STRIPE"),

  body("items")
    .isArray({ min: 1 })
    .withMessage("Items must be a non-empty array"),

  body("items.*.id")
    .notEmpty()
    .withMessage("Each item must have an ID")
    .isUUID()
    .withMessage("Each item ID must be a valid UUID"),

  body("items.*.quantity")
    .notEmpty()
    .withMessage("Each item must have a quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer"),
];
