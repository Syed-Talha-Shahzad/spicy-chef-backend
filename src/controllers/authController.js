import { authService } from "../services/index.js";
import { responseUtility } from "../utils/index.js";

class authController {
  static async signIn(req, res) {
    const result = await authService.signIn(req);
    return responseUtility.sendResponse(res, result);
  }

  static async signUp(req, res) {
    const result = await authService.signUp(req);
    return responseUtility.sendResponse(res, result);
  }

  static async profile(req, res) {
    const result = await authService.profile(req);
    return responseUtility.sendResponse(res, result);
  }

  
}

export default authController;
