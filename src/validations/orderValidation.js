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
    .isIn(["CASH", "STRIPE", "CARD"])
    .withMessage("Payment type must be CASH ,STRIPE or CARD"),

    body("fullName")
    .notEmpty()
    .withMessage("Full Name is required")
    .bail()
    .isLength({ max: 255 })
    .withMessage("Full Name cannot exceed 255 characters"),

  body("phoneNo")
    .notEmpty()
    .withMessage("Phone number is required")
    .bail()
    .isLength({ max: 255 })
    .withMessage("Phone number cannot exceed 255 characters"),

  body("address")
    .notEmpty()
    .withMessage("Address is required")
    .bail()
    .isLength({ max: 255 })
    .withMessage("Address cannot exceed 255 characters"),

    body("postCode")
    .optional()
    .isLength({ max: 255 })
    .withMessage("Post Code cannot exceed 255 characters"),

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
    .isInt({ min: 1, max: 100 }) 
    .withMessage("Quantity must be a positive integer not exceeding 100"),
];
