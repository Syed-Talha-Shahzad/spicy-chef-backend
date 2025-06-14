import { check,body } from "express-validator";

export const signInValidation = [
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email must be a valid email address"),
  check("password").notEmpty().withMessage("password is required"),
];

export const signUpValidation = [
    body('firstName')
      .optional()
      .isString().withMessage('First name must be a string'),
  
    body('lastName')
      .optional()
      .isString().withMessage('Last name must be a string'),
  
    body('email')
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Email is invalid'),
  
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  
    body('address')
      .optional()
      .isString().withMessage('Address must be a string'),
  
    body('city')
      .optional()
      .isString().withMessage('City must be a string'),
  
    body('phoneNo')
      .optional()
      .isMobilePhone().withMessage('Phone number must be valid'),
  ];
