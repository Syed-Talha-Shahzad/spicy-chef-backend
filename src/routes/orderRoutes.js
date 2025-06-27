import express from "express"
const router = express.Router();
import { checkValidationResult, checkAdmin } from "../middlewares/index.js";
import { createOrderValidation } from "../validations/orderValidation.js";
import { orderController } from "../controllers/index.js"

router.post(
    "/",
    createOrderValidation,
    checkValidationResult,
    orderController.createOrder
);

router.get(
    "/",
    checkAdmin,
    orderController.orderListing
);

router.put(
    "/:id",
    checkAdmin,
    orderController.updateOrderStatus
);


export default router;