import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import {
  activateFromCheckoutSession,
  deactivateFromStripeSubscription,
  markStripeEventProcessed,
  releaseStripeEvent,
  renewFromStripeSubscription,
} from "@/lib/subscriptions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");

  if (!secret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET is not set." },
      { status: 503 },
    );
  }

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  const payload = await request.text();
  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(payload, signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  const { alreadyProcessed } = await markStripeEventProcessed(event.id, event.type);
  if (alreadyProcessed) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription" && session.status === "complete") {
          await activateFromCheckoutSession(session);
        }
        break;
      }
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionRef = invoice.parent?.subscription_details?.subscription;
        if (subscriptionRef && invoice.billing_reason === "subscription_cycle") {
          const subscriptionId =
            typeof subscriptionRef === "string" ? subscriptionRef : subscriptionRef.id;
          const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
          await renewFromStripeSubscription(subscription);
        }
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await deactivateFromStripeSubscription(subscription);
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.error("[stripe webhook]", event.type, error);
    await releaseStripeEvent(event.id);
    return NextResponse.json({ error: "Webhook handler failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
