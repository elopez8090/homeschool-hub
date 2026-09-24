"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatBillingDate } from "@/lib/upgrades";

type SessionPayload = {
  plan_name?: string | null;
  upgrade_type?: string | null;
  next_billing_date?: string | null;
  error?: string;
};

export default function UpgradeSuccess({
  sessionId,
  programPath,
}: {
  sessionId: string;
  programPath: string;
}) {
  const [planName, setPlanName] = useState("your upgrade");
  const [nextBilling, setNextBilling] = useState<string | null>(null);
  const [status, setStatus] = useState("Confirming your payment...");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function confirm() {
      try {
        const sessionResponse = await fetch(
          `/api/checkout/session?session_id=${encodeURIComponent(sessionId)}`,
        );
        const sessionPayload = (await sessionResponse.json()) as SessionPayload;

        if (!sessionResponse.ok) {
          throw new Error(sessionPayload.error || "Unable to load session.");
        }

        if (active) {
          if (sessionPayload.plan_name) setPlanName(sessionPayload.plan_name);
          setNextBilling(formatBillingDate(sessionPayload.next_billing_date));
        }

        const activateResponse = await fetch("/api/activate-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId }),
        });
        const activatePayload = await activateResponse.json();

        if (!activateResponse.ok && activateResponse.status !== 202) {
          throw new Error(activatePayload.error || "Unable to activate subscription.");
        }

        if (active) {
          setStatus(
            activatePayload.pending
              ? "Payment received. Your listing will update as soon as Stripe confirms the subscription."
              : `${sessionPayload.plan_name || "Your upgrade"} is now active on your listing.`,
          );
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to confirm this payment.",
          );
        }
      }
    }

    confirm();
    return () => {
      active = false;
    };
  }, [sessionId]);

  return (
    <section className="rounded-2xl border border-emerald-200 bg-white px-6 py-10 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
        Checkout complete
      </p>
      <h1 className="mt-2 text-3xl font-semibold text-blue-900">Payment successful!</h1>
      {error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : (
        <p className="mt-4 text-slate-700">{status}</p>
      )}
      <dl className="mt-6 space-y-3 text-sm">
        <div>
          <dt className="text-slate-500">Purchased</dt>
          <dd className="font-medium text-blue-900">{planName}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Next billing date</dt>
          <dd className="font-medium text-blue-900">
            {nextBilling || "Shown on your Stripe receipt"}
          </dd>
        </div>
      </dl>
      <Link
        href={programPath}
        className="mt-8 inline-flex rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
      >
        Back to program page
      </Link>
    </section>
  );
}
