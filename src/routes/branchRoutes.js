import express from "express"
const router = express.Router();
import { branchController } from "../controllers/index.js"
import { nameValidation } from "../validations/generalValidation.js";
import { checkValidationResult, checkAdmin } from "../middlewares/index.js"

router.post(
    "/",
    checkAdmin,
    nameValidation,
    checkValidationResult,
    branchController.createBranch
);

router.get("/", branchController.listBranches);

// Update a branch
router.put(
  "/:id",
  checkAdmin,
  nameValidation,
  checkValidationResult,
  branchController.updateBranch
);

// Delete a branch
router.delete(
  "/:id",
  checkAdmin,
  checkValidationResult,
  branchController.deleteBranch
);

export default router;