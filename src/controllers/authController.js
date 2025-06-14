import { authService } from "../services/index.js";
import { responseUtility } from "../utils/index.js";

class authController {
    static async signIn(req, res) {
        const result = await authService.signIn(req);
        return responseUtility.sendResponse(res, result);
      }
    
}


export default authController;