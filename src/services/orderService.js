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
      orderType,
      paymentType,
      fullName,
      address,
      phoneNo,
      postCode,
    } = req.body;
  
    try {
      if (!items || !Array.isArray(items) || items.length === 0) {
        return {
          status: false,
          message: "At least one item is required in the order.",
        };
      }
  
      const ids = items.map((i) => i.id);
  
      // Fetch all possible IDs
      const [dbVariations, dbModifierOptions, dbItems] = await Promise.all([
        prisma.variation.findMany({
          where: { id: { in: ids } },
          include: { item: true },
        }),
        prisma.modifierOption.findMany({
          where: { id: { in: ids } },
          include: {
            modifier: {
              include: {
                itemModifier: {
                  include: {
                    item: true,
                  },
                },
              },
            },
          },
        }),
        prisma.item.findMany({
          where: { id: { in: ids } },
        }),
      ]);
  
      // Track all valid IDs
      const validIds = new Set([
        ...dbVariations.map((v) => v.id),
        ...dbModifierOptions.map((m) => m.id),
        ...dbItems.map((i) => i.id),
      ]);
  
      const invalidIds = ids.filter((id) => !validIds.has(id));
      if (invalidIds.length > 0) {
        return {
          status: false,
          message: `Invalid ID(s): ${invalidIds.join(", ")}`,
        };
      }
  
      // Build order items and calculate total
      let totalAmount = 0;
      const orderItems = [];
  
      for (const i of items) {
        const variation = dbVariations.find((v) => v.id === i.id);
        const modifier = dbModifierOptions.find((m) => m.id === i.id);
        const baseItem = dbItems.find((it) => it.id === i.id);
  
        if (variation) {
          totalAmount += variation.price * i.quantity;
          orderItems.push({
            quantity: i.quantity,
            variationId: variation.id,
          });
        } else if (modifier) {
          const relatedItem = modifier.modifier.itemModifier[0]?.item;
          totalAmount += modifier.price * i.quantity;
          orderItems.push({
            quantity: i.quantity,
            modifierOptionId: modifier.id,
          });
        } else if (baseItem) {
          totalAmount += baseItem.price * i.quantity;
          orderItems.push({
            quantity: i.quantity,
            itemId: baseItem.id,
          });
        }
      }
  
      // Create order
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
              item: true,
              variation: true,
              modifierOption: true,
            },
          },
        },
      });
  
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
