import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

function generateOrderCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

class orderService {
  static async createOrder(req, res) {
    const {
      items,
      modifiers = [],
      orderType,
      paymentType,
      fullName,
      address,
      phoneNo,
      postCode,
    } = req.body;
  
    try {
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.json({
          status: false,
          message: "At least one item is required in the order.",
        });
      }
  
      const variationIds = items.map((i) => i.variationId);
      const modifierOptionIds = modifiers.map((m) => m.modifierOptionId);
  
      const dbVariations = await prisma.variation.findMany({
        where: { id: { in: variationIds } },
        select: { id: true, price: true },
      });
  
      const dbModifiers = await prisma.modifierOption.findMany({
        where: { id: { in: modifierOptionIds } },
        select: { id: true, price: true },
      });
  
      const invalidVariationIds = variationIds.filter(
        (id) => !dbVariations.find((v) => v.id === id)
      );
      const invalidModifierOptionIds = modifierOptionIds.filter(
        (id) => !dbModifiers.find((m) => m.id === id)
      );
  
      if (invalidVariationIds.length > 0 || invalidModifierOptionIds.length > 0) {
        const allInvalid = [...invalidVariationIds, ...invalidModifierOptionIds];
        return{
          status: false,
          message: `Invalid ID(s): ${allInvalid.join(", ")}`,
        };
      }
  
      const orderItems = [];
  
      for (const i of items) {
        const variation = dbVariations.find((v) => v.id === i.variationId);
        orderItems.push({
          quantity: i.quantity,
          variation: {
            connect: { id: variation.id },
          },
        });
      }
  
      for (const m of modifiers) {
        const modifier = dbModifiers.find((mo) => mo.id === m.modifierOptionId);
        orderItems.push({
          quantity: m.quantity,
          modifierOption: {
            connect: { id: modifier.id },
          },
        });
      }
  
      let totalAmount = 0;
  
      for (const i of items) {
        const variation = dbVariations.find((v) => v.id === i.variationId);
        totalAmount += variation.price * i.quantity;
      }
  
      for (const m of modifiers) {
        const mod = dbModifiers.find((mo) => mo.id === m.modifierOptionId);
        totalAmount += mod.price * m.quantity;
      }
  
      const order = await prisma.order.create({
        data: {
          orderId: generateOrderCode(),
          orderType,
          paymentType,
          fullName,
          address,
          phoneNo,
          postCode,
          paymentStatus: "PENDING",
          totalAmount,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: {
              variation: true,
              modifierOption: true,
            },
          },
        },
      });
  
      if (paymentType === "STRIPE") {
        const stripeLineItems = [];
  
        for (const i of items) {
          const variation = dbVariations.find((v) => v.id === i.variationId);
          stripeLineItems.push({
            price_data: {
              currency: "usd",
              product_data: { name: `Item: ${variation.id}` },
              unit_amount: variation.price * 100,
            },
            quantity: i.quantity,
          });
        }
  
        for (const m of modifiers) {
          const mod = dbModifiers.find((mo) => mo.id === m.modifierOptionId);
          stripeLineItems.push({
            price_data: {
              currency: "usd",
              product_data: { name: `Modifier: ${mod.id}` },
              unit_amount: mod.price * 100,
            },
            quantity: m.quantity,
          });
        }
  
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          mode: "payment",
          line_items: stripeLineItems,
          success_url: `${process.env.FRONTEND_URL}?orderId=${order.id}`,
          cancel_url: `${process.env.FRONTEND_URL}`,
        });
  
        return {
          status: true,
          message: "Stripe Checkout session created",
          data: {
            checkoutUrl: session.url,
          },
        };
      }
  
      return {
        status: true,
        message: "Order placed successfully",
        data: order,
      };
    } catch (error) {
      console.error("Order creation error:", error);
      return {
        status: false,
        message: error.message,
      };
    }
  }
  
  
  static async orderListing(req) {
    try {
      const { filter } = req.query;
      let where = {};

      if (filter === "pending") {
        where.paymentStatus = "PENDING";
      } else if (filter === "card") {
        where.paymentType = "STRIPE";
      } else if (filter === "cash") {
        where.paymentType = "CASH";
      }

      const orders = await prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: { variation: true, modifierOption: true },
          },
        },
      });

      return {
        status: true,
        message: "Orders fetched successfully",
        data: orders,
      };
    } catch (error) {
      return {
        status: false,
        message: error.message,
      };
    }
  }

  static async updateOrderStatus(req) {
    try {
      const { id } = req.params;

      const existingOrder = await prisma.order.findFirst({
        where: { id },
      });

      if (!existingOrder) {
        return {
          status: false,
          message: "Order not found",
        };
      }

      const updatedOrder = await prisma.order.update({
        where: { id },
        data: { paymentStatus: "PAID" },
      });

      return {
        status: true,
        message: "Order status updated to PAID",
        data: updatedOrder,
      };
    } catch (error) {
      return {
        status: false,
        message: error.message,
      };
    }
  }
}

export default orderService;
