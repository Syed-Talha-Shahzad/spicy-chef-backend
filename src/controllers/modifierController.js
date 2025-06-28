import { modifierService } from "../services/index.js";
import { responseUtility } from "../utils/index.js";

class modifierController {
  static async createModifier(req, res) {
    const result = await modifierService.createModifier(req);
    return responseUtility.sendResponse(res, result);
  }

  static async updateModifier(req, res) {
    const result = await modifierService.updateModifier(req);
    return responseUtility.sendResponse(res, result);
  }

  static async modifierListing(req, res) {
    const result = await modifierService.modifierListing(req);
    return responseUtility.sendResponse(res, result);
  }

  static async modifierDetails(req, res) {
    const result = await modifierService.modifierDetails(req);
    return responseUtility.sendResponse(res, result);
  }

  static async deleteModifier(req, res) {
    const result = await modifierService.deleteModifier(req);
    return responseUtility.sendResponse(res, result);
  }
}

export default modifierController;
