import { NextRequest, NextResponse } from "next/server";
import { fetchProgramById } from "@/lib/programs";
import { getStripe } from "@/lib/stripe";
import { getServerSupabase } from "@/lib/supabase-server";
import { isUpgradeType, siteUrl, UPGRADE_PLANS } from "@/lib/upgrades";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let body: { program_id?: string; upgrade_type?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const programId = String(body.program_id || "").trim();
  const upgradeType = (body.upgrade_type || "").trim();

  if (!programId || !isUpgradeType(upgradeType)) {
    return NextResponse.json(
      { error: "program_id and upgrade_type (featured or esa) are required." },
      { status: 400 },
    );
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Stripe is not configured. Add STRIPE_SECRET_KEY to .env.local." },
      { status: 503 },
    );
  }

  const { program, error } = await fetchProgramById(getServerSupabase(), programId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!program) {
    return NextResponse.json({ error: "Program not found." }, { status: 404 });
  }

  const plan = UPGRADE_PLANS[upgradeType];
  const origin = siteUrl();
  const successUrl = `${origin}/${program.state}/${program.id}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${origin}/${program.state}/${program.id}/upgrade/cancel`;

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      customer_email: program.contact_email || undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: plan.priceCents,
            recurring: { interval: "month" },
            product_data: {
              name: `${plan.name} - ${program.name}`,
            },
          },
        },
      ],
      metadata: {
        program_id: program.id,
        upgrade_type: upgradeType,
      },
      subscription_data: {
        metadata: {
          program_id: program.id,
          upgrade_type: upgradeType,
        },
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL." },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url, session_id: session.id });
  } catch (checkoutError) {
    const message =
      checkoutError instanceof Error
        ? checkoutError.message
        : "Unable to create checkout session.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
