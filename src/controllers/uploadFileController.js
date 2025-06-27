// controllers/uploadController.js
import { responseUtility } from "../utils/index.js";

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return responseUtility.sendResponse(res, {
        status: false,
        message: "No file uploaded",
      });
    }

    const fileName = req.file.filename;
    const baseUrl = process.env.BASE_URL;
    const fileUrl = `${baseUrl}/uploads/${fileName}`;

    return responseUtility.sendResponse(res, {
      status: true,
      data: fileUrl,
    });
  } catch (error) {
    return responseUtility.sendResponse(res, {
      status: false,
      message: error.message,
    });
  }
};
