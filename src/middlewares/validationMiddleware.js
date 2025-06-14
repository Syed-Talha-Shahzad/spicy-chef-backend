import { validationResult } from "express-validator";
import {responseUtility} from "../utils/index.js";

const checkValidationResult = (req, res, next) => {
  if (req.customValidationErrors?.length > 0) {
    return responseUtility.validationErrorResponse(res, req.customValidationErrors);
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return responseUtility.validationErrorResponse(res, errors);
  }
  next();
};

export default checkValidationResult;

