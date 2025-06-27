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

  static async updateOrderStatus(req, res) {
    const result = await orderService.updateOrderStatus(req);
    return responseUtility.sendResponse(res, result);
  }

}

export default orderController;
