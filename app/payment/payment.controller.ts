import { Request, Response } from "express";
import Stripe from "stripe";
import expressAsyncHandler from "express-async-handler";
import { createResponse } from "../common/helper/response.hepler";
import { endpointSecret, stripe } from "../..";
import * as userService from "../user/user.service";

export const createPaymentSession = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const {
      amount,
      currency = "usd",
      paymentType = "Service",
      quantity = 1,
    } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "paypal"],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: paymentType,
            },
            unit_amount: amount * 100,
          },
          quantity: quantity,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FE_BASE_URL}/`,
      cancel_url: `${process.env.FE_BASE_URL}/sales`,
      payment_intent_data: {
        metadata: {
          description: "This is a Sexmas payment with Stripe",
          type: paymentType,
          userId: req.user?._id || "",
        },
      },
      metadata: {
        userId: req.user?._id || "",
      },
    });
    res.send(createResponse({ id: session.id }));
  }
);

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log(`Webhook signature verification failed: ${err}`);
    return res.status(400).send(`Webhook Error: ${err}`);
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session;
      console.log(`Payment successful for session ID: ${session.id}`);
      const userId = session.metadata?.userId;
      console.log(`Payment made by user ID: ${userId}`);
      if (userId) {
        const user = await userService.getUserById(userId);
        if (user) {
          await userService.editUser(user._id, {
            payment: true,
          });
        }
      }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};
