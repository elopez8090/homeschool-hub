import { NextRequest, NextResponse } from "next/server";
import { activateFromCheckoutSession, retrieveCheckoutSession } from "@/lib/subscriptions";
import { UPGRADE_PLANS } from "@/lib/upgrades";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let body: { session_id?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const sessionId = (body.session_id || "").trim();
  if (!sessionId) {
    return NextResponse.json({ error: "session_id is required." }, { status: 400 });
  }

  try {
    const session = await retrieveCheckoutSession(sessionId);

    if (session.status !== "complete" || session.payment_status !== "paid") {
      return NextResponse.json(
        {
          activated: false,
          pending: true,
          message: "Payment is not complete yet. The webhook will finish activation.",
        },
        { status: 202 },
      );
    }

    const result = await activateFromCheckoutSession(session);
    const plan = UPGRADE_PLANS[result.upgradeType];

    return NextResponse.json({
      activated: true,
      already_processed: result.alreadyProcessed,
      upgrade_type: result.upgradeType,
      plan_name: plan.name,
      expires_at: "expiresAt" in result ? result.expiresAt : null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to activate subscription.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
