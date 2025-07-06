import { categoryService } from "../services/index.js";
import { responseUtility } from "../utils/index.js";

class categoryController {
  static async createCategory(req, res) {
    const result = await categoryService.createCategory(req);
    return responseUtility.sendResponse(res, result);
  }

  static async updateCategory(req, res) {
    const result = await categoryService.updateCategory(req);
    return responseUtility.sendResponse(res, result);
  }

  static async categoryDetails(req, res) {
    const result = await categoryService.categoryDetails(req);
    return responseUtility.sendResponse(res, result);
  }

  static async deleteCategory(req, res) {
    const result = await categoryService.deleteCategory(req);
    return responseUtility.sendResponse(res, result);
  }

  
  static async listingCategories(req, res) {
    const result = await categoryService.listingCategories(req);
    return responseUtility.sendResponse(res, result);
  }

  static async createItem(req, res) {
    const result = await categoryService.createItem(req);
    return responseUtility.sendResponse(res, result);
  }

  static async getItemListing(req, res) {
    const result = await categoryService.getItemListing(req);
    return responseUtility.sendResponse(res, result);
  }

  static async updateItem(req, res) {
    const result = await categoryService.updateItem(req);
    return responseUtility.sendResponse(res, result);
  }

  static async deleteItem(req, res) {
    const result = await categoryService.deleteItem(req);
    return responseUtility.sendResponse(res, result);
  }

  static async updateItemDiscount(req, res) {
    const result = await categoryService.updateItemDiscount(req);
    return responseUtility.sendResponse(res, result);
  }
}

export default categoryController;
