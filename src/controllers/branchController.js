import { branchService } from "../services/index.js";
import { responseUtility } from "../utils/index.js";

class branchController {
  static async createBranch(req, res) {
    const result = await branchService.createbranch(req);
    return responseUtility.sendResponse(res, result);
  }

  static async listBranches(req, res) {
    const result = await branchService.listBranches();
    return responseUtility.sendResponse(res, result);
  }

  static async updateBranch(req, res) {
    const result = await branchService.updateBranch(req);
    return responseUtility.sendResponse(res, result);
  }

  static async deleteBranch(req, res) {
    const result = await branchService.deleteBranch(req);
    return responseUtility.sendResponse(res, result);
  }
}

export default branchController;
