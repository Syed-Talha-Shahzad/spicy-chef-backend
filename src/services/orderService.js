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
      const itemIds = items.map((i) => i.id);
      const dbItems = await prisma.item.findMany({
        where: { id: { in: itemIds } },
        select: { id: true, name: true, price: true },
      });

      const enrichedItems = items.map((reqItem) => {
        const dbItem = dbItems.find((i) => i.id === reqItem.id);
        if (!dbItem) throw new Error(`Item not found: ${reqItem.id}`);

        return {
          itemId: dbItem.id,
          name: dbItem.name,
          price: parseInt(dbItem.price),
          quantity: reqItem.quantity,
        };
      });

      const totalAmount = enrichedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const order = await prisma.order.create({
        data: {
          orderId: generateOrderCode(),
          orderType,
          fullName,
          address,
          phoneNo,
          postCode,
          paymentType,
          paymentStatus: "PENDING",
          totalAmount,
          items: {
            create: enrichedItems.map((item) => ({
              quantity: item.quantity,
              itemId: item.itemId,
            })),
          },
        },
        include: {
          items: {
            include: {
              item: true,
            },
          },
        },
      });

      if (paymentType === "STRIPE") {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          mode: "payment",
          line_items: enrichedItems.map((item) => ({
            price_data: {
              currency: "usd",
              product_data: { name: item.name },
              unit_amount: item.price * 100,
            },
            quantity: item.quantity,
          })),
          success_url: `${process.env.FRONTEND_URL}?orderId=${order.id}`,
          cancel_url: `${process.env.FRONTEND_URL}`,
        });

        return {
          status: true,
          message: "Stripe Checkout session",
          data: {
            checkoutUrl: session.url,
          },
        };
      }

      return {
        status: true,
        message: "Order placed with cash or card",
        data: order,
      };
    } catch (error) {
      console.error("Order Error:", error);
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
            include: { item: true },
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
