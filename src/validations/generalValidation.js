import { check, query  } from "express-validator";

export const nameValidation = [
    check("name").notEmpty().withMessage("Name is required"),
]

export const branchIdValidation = [
    query("branch_id")
      .notEmpty()
      .withMessage("branch_id is required")
      .isUUID()
      .withMessage("branch_id must be a valid UUID"),
  ];
