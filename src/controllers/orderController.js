import { orderService } from "../services/index.js";
import { responseUtility } from "../utils/index.js";

class orderController {
  static async createOrder(req, res) {
    const result = await orderService.createOrder(req);
    return responseUtility.sendResponse(res, result);
  }

  static async orderListing(req, res) {
    const result = await orderService.orderListing(req);
    return responseUtility.sendResponse(res, result);
  }

  static async updateOrderPaymentStatus(req, res) {
    const result = await orderService.updateOrderPaymentStatus(req);
    return responseUtility.sendResponse(res, result);
  }

  static async userOrders(req, res) {
    const result = await orderService.userOrders(req);
    return responseUtility.sendResponse(res, result);
  }

  static async orderStatusUpdate(req, res) {
    const result = await orderService.orderStatusUpdate(req);
    return responseUtility.sendResponse(res, result);
  }

  static async orderDetails(req, res) {
    const result = await orderService.orderDetails(req);
    return responseUtility.sendResponse(res, result);
  }
  

}

export default orderController;
