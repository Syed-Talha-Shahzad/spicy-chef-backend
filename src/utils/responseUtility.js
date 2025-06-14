import { HTTP_STATUS_CODES } from "../constants/index.js";
import {messageUtility} from "./index.js"


class responseUtility {
  static async sendResponse (res, response) {
    if (response.status == false) {
      return this.noSuccessResponse(res, response?.message);
    } else if (response.status == true) {
      return this.successResponse(res, response.message, {
        data: response.data,
      });
    } else {
      return this.validationErrorResponse(res, response?.message);
    }
  };
  
  static async validationErrorResponse (res, errors) {
    res.status(HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY).json({
      status: false,
      error: errors,
      message: messageUtility.validationErrors,
    });
  };
  
  static async badRequestErrorResponse (res, message) {
    res.status(HTTP_STATUS_CODES.BAD_REQUEST).send({
      status: false,
      message,
    });
  };
  
  static async authorizationErrorResponse (res, message)  {
    res.status(HTTP_STATUS_CODES.UNAUTHORIZED).send({
      status: false,
      message,
    });
  };
  
  static async manyRequestErrorResponse (res, message)  {
    res.status(HTTP_STATUS_CODES.TOO_MANY_REQUESTS).send({
      status: false,
      message,
    });
  };
  
  static async validationFailResponse (res, message, result) {
    const response = {
      status: false,
      message,
    };
    if (result) {
      response.result = result;
    }
    res.status(HTTP_STATUS_CODES.VALIDATION_FAILED).send(response);
  };
  
  static async successResponse (res, message, result)  {
    const response = {
      status: true,
      message,
    };
    if (result) {
      response.result = result;
    }
    res.status(200).send(response);
  };
  
  static async noSuccessResponse (res, message, result) {
    const response = {
      status: false,
      message,
    };
    if (result) {
      response.result = result;
    }
    res.status(HTTP_STATUS_CODES.BAD_REQUEST).send(response);
  };
  
  static async errorResponse (res, message, result)  {
    const response = {
      status: false,
      message,
    };
    res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).send(response);
  };
}

export default responseUtility;