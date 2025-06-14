import { check } from "express-validator";

export const signInValidation = [
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email must be a valid email address"),
  check("password").notEmpty().withMessage("password is required"),
];
