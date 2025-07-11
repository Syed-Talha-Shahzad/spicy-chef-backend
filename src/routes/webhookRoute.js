import express from "express";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const prisma = new PrismaClient();
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

router.post("/", express.raw({ type: "application/json" }), async (req, res) => {
  console.log("✅ Received Stripe webhook event");
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;

    if (!orderId) {
      console.error("⚠️ No orderId in metadata");
      return res.status(400).send("Missing orderId");
    }

    try {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "PAID",
          status: "ACCEPTED",
        },
      });
      console.log(`✅ Order ${orderId} marked as PAID`);
    } catch (err) {
      console.error(`❌ Failed to update order ${orderId}:`, err);
      return res.status(500).send("Database update failed");
    }
  }

  return res.status(200).json({ received: true });
});

export default router;
