"use client";

import { loadStripe } from "@stripe/stripe-js";
import { useState } from "react";
import type { Program, UpgradeType } from "@/lib/types";
import { UPGRADE_PLANS } from "@/lib/upgrades";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

export default function UpgradePlans({
  program,
  featuredActive,
  esaActive,
}: {
  program: Program;
  featuredActive: boolean;
  esaActive: boolean;
}) {
  const [busy, setBusy] = useState<UpgradeType | null>(null);
  const [error, setError] = useState("");

  async function startCheckout(upgradeType: UpgradeType) {
    setBusy(upgradeType);
    setError("");

    try {
      if (stripePromise) {
        await stripePromise;
      }

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          program_id: program.id,
          upgrade_type: upgradeType,
        }),
      });
      const payload = await response.json();

      if (!response.ok || !payload.url) {
        throw new Error(payload.error || "Unable to start checkout.");
      }

      window.location.href = payload.url;
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Unable to start checkout.",
      );
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        <PricingCard
          plan={UPGRADE_PLANS.featured}
          active={featuredActive}
          busy={busy === "featured"}
          disabled={Boolean(busy)}
          onStart={() => startCheckout("featured")}
        />
        <PricingCard
          plan={UPGRADE_PLANS.esa}
          active={esaActive}
          busy={busy === "esa"}
          disabled={Boolean(busy)}
          onStart={() => startCheckout("esa")}
        />
      </div>
    </div>
  );
}

function PricingCard({
  plan,
  active,
  busy,
  disabled,
  onStart,
}: {
  plan: (typeof UPGRADE_PLANS)[UpgradeType];
  active: boolean;
  busy: boolean;
  disabled: boolean;
  onStart: () => void;
}) {
  const featured = plan.type === "featured";

  return (
    <article
      className={`flex flex-col rounded-2xl border bg-white p-6 shadow-sm ${
        featured ? "border-emerald-200 ring-1 ring-emerald-100" : "border-blue-100"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
        {featured ? "Most visibility" : "Trust signal"}
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-blue-900">{plan.name}</h2>
      <p className="mt-1 text-3xl font-semibold text-blue-950">
        {plan.priceLabel.replace("/month", "")}
        <span className="text-base font-medium text-slate-500">/month</span>
      </p>
      <p className="mt-2 text-sm text-slate-600">{plan.tagline}</p>
      <ul className="mt-6 flex-1 space-y-2 text-sm text-slate-700">
        {plan.includes.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-0.5 text-emerald-600">✓</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      {active ? (
        <p className="mt-6 rounded-lg bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-800">
          Already active on this listing
        </p>
      ) : (
        <button
          type="button"
          onClick={onStart}
          disabled={disabled}
          suppressHydrationWarning
          className={`mt-6 inline-flex items-center justify-center rounded-lg px-4 py-3 text-sm font-semibold text-white ${
            featured
              ? "bg-emerald-700 hover:bg-emerald-800"
              : "bg-blue-700 hover:bg-blue-800"
          } disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {busy ? "Redirecting to Stripe..." : `Get Started — ${plan.priceLabel}`}
        </button>
      )}
    </article>
  );
}
