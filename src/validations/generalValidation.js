import { check, query  } from "express-validator";

export const branchValidation = [
    check("name").notEmpty().withMessage("Name is required"),
    check("address").notEmpty().withMessage("Address is required"),
]

export const branchIdValidation = [
    query("branch_id")
      .notEmpty()
      .withMessage("branch_id is required")
      .isUUID()
      .withMessage("branch_id must be a valid UUID"),
  ];
