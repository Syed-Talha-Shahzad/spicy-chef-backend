import Stripe from "stripe";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { ORDER_STATUS, USER_ROLE } from "../constants/index.js";
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
      deliveryFee,
    } = req.body;

    let user = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const fetchedUser = await prisma.user.findFirst({
          where: { id: decoded.id },
        });

        if (fetchedUser && fetchedUser.status !== false) {
          user = fetchedUser;
        }
        if (!user) {
          return {
            status: false,
            message: "User not found or account is blocked.",
          };
        }
      } catch (error) {
        console.error("Token verification error:", error.message);
        return {
          status: false,
          message: "Invalid or expired token.",
        };
      }
    }

    try {
      if (!items || !Array.isArray(items) || items.length === 0) {
        return {
          status: false,
          message: "At least one item is required in the order.",
        };
      }

      const ids = items.map((i) => i.id);

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
                  include: { item: true },
                },
              },
            },
          },
        }),
        prisma.item.findMany({
          where: { id: { in: ids } },
        }),
      ]);

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

      let totalAmount = 0;
      const orderItems = [];
      const stripeLineItems = [];

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

          if (paymentType === "STRIPE") {
            stripeLineItems.push({
              price_data: {
                currency: "usd",
                product_data: {
                  name: `Variation: ${variation.item.name} - ${variation.name}`,
                },
                unit_amount: parseInt(variation.price) * 100,
              },
              quantity: i.quantity,
            });
          }
        } else if (modifier) {
          const relatedItem = modifier.modifier.itemModifier[0]?.item;
          totalAmount += modifier.price * i.quantity;
          orderItems.push({
            quantity: i.quantity,
            modifierOptionId: modifier.id,
          });

          if (paymentType === "STRIPE") {
            stripeLineItems.push({
              price_data: {
                currency: "usd",
                product_data: {
                  name: `Modifier: ${modifier.name} (${
                    relatedItem?.name || ""
                  })`,
                },
                unit_amount: parseInt(modifier.price) * 100,
              },
              quantity: i.quantity,
            });
          }
        } else if (baseItem) {
          const discount = baseItem.discount || 0;
          const discountedPrice =
            parseFloat(baseItem.price) * (1 - discount / 100);

          const finalDiscountedPrice = parseFloat(
            (discountedPrice * i.quantity).toFixed(2)
          );

          totalAmount += finalDiscountedPrice;
          orderItems.push({
            quantity: i.quantity,
            itemId: baseItem.id,
          });

          if (paymentType === "STRIPE") {
            stripeLineItems.push({
              price_data: {
                currency: "usd",
                product_data: {
                  name: `Item: ${baseItem.name}`,
                },
                unit_amount: Math.round(finalDiscountedPrice * 100),
              },
              quantity: i.quantity,
            });
          }
        }
      }

      console.log("Total amount before delivery fee:", totalAmount);
      totalAmount += parseFloat(deliveryFee) || 0;
      console.log("Total amount after adding delivery fee:", totalAmount);
      const order = await prisma.order.create({
        data: {
          orderId: generateOrderCode(),
          orderType,
          paymentType,
          fullName,
          address,
          userId: user?.id ?? null,
          phoneNo,
          postCode,
          paymentStatus: "PENDING",
          totalAmount,
          deliveryFee: parseFloat(deliveryFee) || 0,
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

      if (paymentType === "STRIPE") {
        console.log("Creating Stripe session for order:", order.id);
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          mode: "payment",
          line_items: stripeLineItems,
          success_url: `${process.env.FRONTEND_URL}?orderId=${order.id}`,
          cancel_url: `${process.env.FRONTEND_URL}`,
        });

        return {
          status: true,
          message: "Stripe session created",
          data: {
            session: session.url,
            order: order,
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
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: {
              item: true,
              variation: {
                include: {
                  item: {
                    select: {
                      name: true,
                      price: true,
                      image: true,
                      description: true,
                    },
                  },
                },
              },
              modifierOption: {
                include: {
                  modifier: {
                    include: {
                      itemModifier: {
                        include: {
                          item: {
                            select: {
                              id: true,
                              name: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
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

  static async updateOrderPaymentStatus(req) {
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

  static async userOrders(req) {
    try {
      const orders = await prisma.order.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: {
              item: true,
              variation: {
                include: {
                  item: {
                    select: {
                      name: true,
                      price: true,
                      image: true,
                      description: true,
                    },
                  },
                },
              },
              modifierOption: {
                include: {
                  modifier: {
                    include: {
                      itemModifier: {
                        include: {
                          item: {
                            select: {
                              id: true,
                              name: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      return {
        status: true,
        message: "User orders fetched successfully",
        data: {
          orders: orders,
        },
      };
    } catch (error) {
      return {
        status: false,
        message: error.message,
      };
    }
  }

  static async orderStatusUpdate(req) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const existingOrder = await prisma.order.findFirst({
        where: { id },
      });
      if (!existingOrder) {
        return {
          status: false,
          message: "Order not found",
        };
      }
      if (existingOrder.status === ORDER_STATUS.ACCEPTED) {
        return {
          status: false,
          message: "Order is already accepted",
        };
      }

      if (existingOrder.status === ORDER_STATUS.REJECTED) {
        return {
          status: false,
          message: "Order is already rejected",
        };
      }

      await prisma.order.update({
        where: { id },
        data: { status },
      });

      return {
        status: false,
        message: "Order status updated successfully",
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
