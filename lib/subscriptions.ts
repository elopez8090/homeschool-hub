import type Stripe from "stripe";
import { emailOwnerUpgradeActivated, emailOwnerUpgradeCanceled } from "@/lib/email";
import { getStripe } from "@/lib/stripe";
import { getServerSupabase } from "@/lib/supabase-server";
import type { Program, UpgradeType } from "@/lib/types";
import {
  addDays,
  formatBillingDate,
  isUpgradeType,
  siteUrl,
  UPGRADE_PLANS,
} from "@/lib/upgrades";

function asCustomerId(value: string | Stripe.Customer | Stripe.DeletedCustomer | null) {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

function asSubscriptionId(value: string | Stripe.Subscription | null) {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

export async function markStripeEventProcessed(eventId: string, eventType: string) {
  const client = getServerSupabase();
  const { error } = await client.from("processed_stripe_events").insert({
    event_id: eventId,
    event_type: eventType,
  });

  if (error) {
    if (error.code === "23505") return { alreadyProcessed: true };
    throw error;
  }

  return { alreadyProcessed: false };
}

export async function releaseStripeEvent(eventId: string) {
  const client = getServerSupabase();
  await client.from("processed_stripe_events").delete().eq("event_id", eventId);
}

async function loadProgram(programId: string) {
  const client = getServerSupabase();
  const { data, error } = await client
    .from("programs")
    .select("*")
    .eq("id", programId)
    .maybeSingle();

  if (error) throw error;
  return (data as Program | null) || null;
}

async function resolveSubscription(session: Stripe.Checkout.Session) {
  const stripe = getStripe();
  const subscriptionId = asSubscriptionId(session.subscription);
  if (!subscriptionId) return null;

  if (typeof session.subscription === "object" && session.subscription) {
    return session.subscription;
  }

  return stripe.subscriptions.retrieve(subscriptionId);
}

function expiryFromSubscription(subscription: Stripe.Subscription | null) {
  const periodEnd = subscription?.items?.data?.[0]?.current_period_end;
  if (periodEnd) {
    return new Date(periodEnd * 1000).toISOString();
  }
  return addDays(30).toISOString();
}

export function subscriptionPeriodEnd(subscription: Stripe.Subscription | null) {
  return subscription?.items?.data?.[0]?.current_period_end || null;
}

export async function activateFromCheckoutSession(
  session: Stripe.Checkout.Session,
  options?: { sendEmail?: boolean },
) {
  const sendEmail = options?.sendEmail !== false;
  const metadata = session.metadata || {};
  const programId = metadata.program_id;
  const upgradeType = metadata.upgrade_type;

  if (!programId || !upgradeType || !isUpgradeType(upgradeType)) {
    throw new Error("Checkout session is missing program_id or upgrade_type.");
  }

  const client = getServerSupabase();

  if (session.id) {
    const processed = await markStripeEventProcessed(
      `checkout:${session.id}`,
      "checkout.activate",
    );
    if (processed.alreadyProcessed) {
      return { alreadyProcessed: true, programId, upgradeType };
    }
  }

  const program = await loadProgram(programId);
  if (!program) {
    throw new Error(`Program ${programId} was not found.`);
  }

  const subscription = await resolveSubscription(session);
  const subscriptionId = asSubscriptionId(session.subscription);
  const customerId = asCustomerId(session.customer);
  const expiresAt = expiryFromSubscription(subscription);
  const now = new Date().toISOString();
  const plan = UPGRADE_PLANS[upgradeType];

  const programPatch: Record<string, unknown> = {
    stripe_customer_id: customerId || program.stripe_customer_id,
    stripe_subscription_id: subscriptionId || program.stripe_subscription_id,
  };

  if (upgradeType === "featured") {
    programPatch.featured = true;
    programPatch.featured_since = program.featured_since || now;
    programPatch.featured_expiry = expiresAt;
  } else {
    programPatch.esa_verified = true;
    programPatch.esa_verified_since = program.esa_verified_since || now;
    programPatch.esa_expiry = expiresAt;
  }

  const { error: programError } = await client
    .from("programs")
    .update(programPatch)
    .eq("id", programId);

  if (programError) throw programError;

  if (subscriptionId) {
    const { data: existingSub } = await client
      .from("subscriptions")
      .select("id")
      .eq("stripe_subscription_id", subscriptionId)
      .maybeSingle();

    if (existingSub) {
      const { error } = await client
        .from("subscriptions")
        .update({
          status: "active",
          expires_at: expiresAt,
          stripe_customer_id: customerId,
          stripe_checkout_session_id: session.id,
          type: upgradeType,
          program_id: programId,
        })
        .eq("id", existingSub.id);
      if (error) throw error;
    } else {
      const { error } = await client.from("subscriptions").insert({
        program_id: programId,
        stripe_subscription_id: subscriptionId,
        stripe_customer_id: customerId,
        stripe_checkout_session_id: session.id,
        type: upgradeType,
        status: "active",
        expires_at: expiresAt,
      });
      if (error && error.code !== "23505") throw error;
    }
  } else {
    const { error } = await client.from("subscriptions").insert({
      program_id: programId,
      stripe_customer_id: customerId,
      stripe_checkout_session_id: session.id,
      type: upgradeType,
      status: "active",
      expires_at: expiresAt,
    });
    if (error) throw error;
  }

  if (sendEmail && program.contact_email) {
    await emailOwnerUpgradeActivated({
      name: program.name,
      contact_email: program.contact_email,
      planName: plan.name,
      listingUrl: `${siteUrl()}/${program.state}/${program.id}`,
      nextBillingDate: formatBillingDate(expiresAt) || undefined,
    });
  }

  return { alreadyProcessed: false, programId, upgradeType, expiresAt };
}

export async function renewFromStripeSubscription(
  subscription: Stripe.Subscription,
) {
  const client = getServerSupabase();
  const metadata = subscription.metadata || {};
  const upgradeType = isUpgradeType(metadata.upgrade_type || "")
    ? metadata.upgrade_type
    : null;
  const expiresAt = expiryFromSubscription(subscription);

  const { data: row } = await client
    .from("subscriptions")
    .select("*")
    .eq("stripe_subscription_id", subscription.id)
    .maybeSingle();

  const type = (row?.type as UpgradeType | undefined) || upgradeType;
  const programId = row?.program_id || metadata.program_id;
  if (!programId || !type) return { skipped: true };

  const { error } = await client
    .from("subscriptions")
    .update({ status: "active", expires_at: expiresAt })
    .eq("stripe_subscription_id", subscription.id);

  if (error && error.code !== "PGRST116") throw error;

  const programPatch: Record<string, unknown> = {
    stripe_subscription_id: subscription.id,
    stripe_customer_id: asCustomerId(subscription.customer),
  };

  if (type === "featured") {
    programPatch.featured = true;
    programPatch.featured_expiry = expiresAt;
  } else {
    programPatch.esa_verified = true;
    programPatch.esa_expiry = expiresAt;
  }

  const { error: programError } = await client
    .from("programs")
    .update(programPatch)
    .eq("id", programId);

  if (programError) throw programError;
  return { skipped: false, programId, type, expiresAt };
}

export async function deactivateFromStripeSubscription(
  subscription: Stripe.Subscription,
) {
  const client = getServerSupabase();
  const metadata = subscription.metadata || {};
  const { data: row } = await client
    .from("subscriptions")
    .select("*")
    .eq("stripe_subscription_id", subscription.id)
    .maybeSingle();

  const type = (isUpgradeType(metadata.upgrade_type || "")
    ? metadata.upgrade_type
    : row?.type) as UpgradeType | undefined;
  const programId = row?.program_id || metadata.program_id;

  if (!programId || !type) return { skipped: true };

  await client
    .from("subscriptions")
    .update({ status: "canceled" })
    .eq("stripe_subscription_id", subscription.id);

  const program = await loadProgram(programId);
  if (!program) return { skipped: true };

  const programPatch: Record<string, unknown> = {};
  if (type === "featured") {
    programPatch.featured = false;
  } else {
    programPatch.esa_verified = false;
  }

  const { error } = await client
    .from("programs")
    .update(programPatch)
    .eq("id", programId);
  if (error) throw error;

  if (program.contact_email) {
    await emailOwnerUpgradeCanceled({
      name: program.name,
      contact_email: program.contact_email,
      planName: UPGRADE_PLANS[type].name,
    });
  }

  return { skipped: false, programId, type };
}

export async function retrieveCheckoutSession(sessionId: string) {
  return getStripe().checkout.sessions.retrieve(sessionId, {
    expand: ["subscription"],
  });
}
