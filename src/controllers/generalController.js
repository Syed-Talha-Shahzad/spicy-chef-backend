import { generalService } from "../services/index.js";
import { responseUtility } from "../utils/index.js";

class generalController {
  static async deliveryFee(req, res) {
    const result = await generalService.deliveryFee(req);
    return responseUtility.sendResponse(res, result);
  }

  static async getSetting(req, res) {
    const result = await generalService.getSetting(req);
    return responseUtility.sendResponse(res, result);
  }
}

export default generalController;
