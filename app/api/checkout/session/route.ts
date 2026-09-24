import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { retrieveCheckoutSession, subscriptionPeriodEnd } from "@/lib/subscriptions";
import { isUpgradeType, UPGRADE_PLANS } from "@/lib/upgrades";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "session_id is required." }, { status: 400 });
  }

  try {
    const session = await retrieveCheckoutSession(sessionId);
    const upgradeType = session.metadata?.upgrade_type;
    const plan =
      upgradeType && isUpgradeType(upgradeType) ? UPGRADE_PLANS[upgradeType] : null;
    const subscription =
      typeof session.subscription === "object" && session.subscription
        ? (session.subscription as Stripe.Subscription)
        : null;

    return NextResponse.json({
      session_id: session.id,
      status: session.status,
      payment_status: session.payment_status,
      upgrade_type: upgradeType || null,
      plan_name: plan?.name || null,
      program_id: session.metadata?.program_id || null,
      next_billing_date: subscriptionPeriodEnd(subscription)
        ? new Date(subscriptionPeriodEnd(subscription)! * 1000).toISOString()
        : null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to retrieve session.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
