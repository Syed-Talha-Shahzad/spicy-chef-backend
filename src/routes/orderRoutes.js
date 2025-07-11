import express from "express";
const router = express.Router();
import {
  checkValidationResult,
  checkAdmin,
  checkAuthUser,
} from "../middlewares/index.js";
import {
  createOrderValidation,
  updateOrderStatusValidation,
} from "../validations/orderValidation.js";
import { orderController } from "../controllers/index.js";

router.post(
  "/",
  createOrderValidation,
  checkValidationResult,
  orderController.createOrder
);

router.get("/", checkAdmin, orderController.orderListing);

router.put("/:id", checkAdmin, orderController.updateOrderPaymentStatus);

router.put(
  "/status/:id",
  checkAdmin,
  updateOrderStatusValidation,
  checkValidationResult,
  orderController.orderStatusUpdate
);

router.get("/user-orders", checkAuthUser, orderController.userOrders);

router.get("/details/:id", orderController.orderDetails);

export default router;
