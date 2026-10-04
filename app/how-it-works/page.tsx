"use client";

import Link from "next/link";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";

type StepIconName =
  | "map"
  | "details"
  | "mail"
  | "search"
  | "claim"
  | "email"
  | "link"
  | "badge"
  | "form"
  | "review"
  | "directory"
  | "verify";

type Step = {
  title: string;
  body: string;
  icon: StepIconName;
  href?: string;
  linkLabel?: string;
};

const FAMILY_STEPS: Step[] = [
  {
    title: "Browse programs by state",
    body: "Open the directory and choose your state. Co-ops, classes, and resources are listed together so you can start close to home.",
    icon: "map",
  },
  {
    title: "View program details",
    body: "Each listing shows a description, contact information, and a website when the program has one.",
    icon: "details",
  },
  {
    title: "Contact programs directly, or claim yours",
    body: "Reach out with the details on the listing. If you run the program, you can claim it and confirm the information.",
    icon: "mail",
  },
];

const OWNER_STEPS: Step[] = [
  {
    title: "Find your program in the directory",
    body: "Open your state and use search and filters until your listing appears.",
    icon: "search",
  },
  {
    title: 'Click "Claim this program"',
    body: "Open your listing and start the claim from the program page. It takes a minute.",
    icon: "claim",
  },
  {
    title: "Enter the program's contact email",
    body: "Use the email address that belongs to the program. That is where we send the confirmation.",
    icon: "email",
  },
  {
    title: "Check your email for a verification link",
    body: "Look for a message from Christian Homeschools Hub. The link is how we know the address is yours.",
    icon: "link",
  },
  {
    title: "Click the link to confirm ownership",
    body: "Opening the link confirms you can receive mail for the program. No account password is required.",
    icon: "verify",
  },
  {
    title: 'Receive a "Verified by Owner" badge',
    body: "Your listing then shows the badge, so families can see a real owner confirmed the details.",
    icon: "badge",
  },
];

const SUBMIT_STEPS: Step[] = [
  {
    title: "Fill out the program submission form",
    body: "Choose your state on the homepage, then open the form for that state. Sharing a listing is free.",
    icon: "form",
    href: "/",
    linkLabel: "Choose your state to submit",
  },
  {
    title: "Our team reviews submissions within 2 business days",
    body: "A person reads each listing before it goes live. We follow up by email, usually within 48 hours.",
    icon: "review",
  },
  {
    title: "Once approved, your program appears in the directory",
    body: "Families in your state can find the listing by browsing or by search.",
    icon: "directory",
  },
  {
    title: "You can then claim and verify your listing",
    body: "After approval, use the claim steps above to add the Verified by Owner badge.",
    icon: "verify",
  },
];

function StepIcon({ name }: { name: StepIconName }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className: "h-5 w-5",
  };

  switch (name) {
    case "map":
      return (
        <svg {...common}>
          <path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z" />
          <circle cx="12" cy="10" r="2.25" />
        </svg>
      );
    case "details":
      return (
        <svg {...common}>
          <path d="M8 4h6l4 4v12H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
          <path d="M14 4v4h4" />
          <path d="M9 13h6M9 17h4" />
        </svg>
      );
    case "mail":
      return (
        <svg {...common}>
          <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4 4" />
        </svg>
      );
    case "claim":
      return (
        <svg {...common}>
          <path d="M8 11V7.5a4 4 0 0 1 8 0V11" />
          <rect x="5" y="11" width="14" height="9" rx="2" />
        </svg>
      );
    case "email":
      return (
        <svg {...common}>
          <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
          <path d="m4 7 8 6 8-6" />
          <path d="M12 13v3" />
        </svg>
      );
    case "link":
      return (
        <svg {...common}>
          <path d="M10 13a5 5 0 0 0 7.1.1l1.4-1.4a5 5 0 0 0-7.1-7.1L10 6" />
          <path d="M14 11a5 5 0 0 0-7.1-.1L5.5 12.3a5 5 0 0 0 7.1 7.1L14 18" />
        </svg>
      );
    case "badge":
      return (
        <svg {...common}>
          <circle cx="12" cy="9" r="5" />
          <path d="m9 13.5-1.2 6.2L12 17l4.2 2.7L15 13.5" />
        </svg>
      );
    case "form":
      return (
        <svg {...common}>
          <rect x="5" y="3.5" width="14" height="17" rx="2" />
          <path d="M8.5 8h7M8.5 12h7M8.5 16h4" />
        </svg>
      );
    case "review":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4.5l3 1.5" />
        </svg>
      );
    case "directory":
      return (
        <svg {...common}>
          <path d="M4 6.5h16M4 12h16M4 17.5h10" />
          <circle cx="18.5" cy="17.5" r="1.25" fill="currentColor" stroke="none" />
        </svg>
      );
    case "verify":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="m8.5 12.2 2.3 2.3 4.7-5" />
        </svg>
      );
  }
}

function StepList({ steps }: { steps: Step[] }) {
  return (
    <ol className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {steps.map((step, index) => (
        <li
          key={step.title}
          className="flex gap-4 rounded-xl border border-blue-50 bg-slate-50/80 p-4"
        >
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-700 text-sm font-semibold text-white"
            aria-hidden="true"
          >
            {index + 1}
          </span>
          <div>
            <div className="flex items-start gap-2 text-blue-800">
              <span className="mt-0.5 shrink-0">
                <StepIcon name={step.icon} />
              </span>
              <h3 className="text-base font-semibold text-blue-900">{step.title}</h3>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">{step.body}</p>
            {step.href && step.linkLabel ? (
              <Link
                href={step.href}
                className="mt-3 inline-flex text-sm font-medium text-blue-700 hover:text-blue-900"
              >
                {step.linkLabel}
              </Link>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

const buttonClass =
  "inline-flex w-full justify-center rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 sm:w-auto";

const buttonOutlineClass =
  "inline-flex w-full justify-center rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-800 hover:bg-blue-50 sm:w-auto";

export default function HowItWorksPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-white text-slate-800">
      <Navigation />

      <main className="flex-1">
        <section className="bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 text-white">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-200">
              Easy, free, and trustworthy
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold text-balance sm:text-5xl">
              How It Works
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-blue-100">
              Families browse by state at no cost. Program owners can claim a
              listing, confirm it by email, and show families the details are
              current.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/"
                className="inline-flex w-full justify-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-50 sm:w-auto"
              >
                Browse Programs
              </Link>
              <Link
                href="/"
                className="inline-flex w-full justify-center rounded-lg border border-white/40 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 sm:w-auto"
              >
                Submit a Program
              </Link>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-6xl space-y-10 px-4 py-12 sm:px-6 sm:py-16 lg:space-y-14">
          <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-blue-700">
              For Homeschool Families
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-blue-900">Finding Programs</h2>
            <p className="mt-3 max-w-3xl text-slate-600">
              Start with your state, open a listing, and contact the program
              yourself. Browsing the directory is free.
            </p>
            <StepList steps={FAMILY_STEPS} />
            <div className="mt-8">
              <p className="text-sm font-medium text-blue-800">Get started</p>
              <Link href="/" className={`${buttonClass} mt-3`}>
                Browse Programs
              </Link>
            </div>
          </section>

          <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-blue-700">
              For Program Owners
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-blue-900">
              Claiming &amp; Verifying Your Program
            </h2>
            <p className="mt-3 max-w-3xl text-slate-600">
              Claiming is free. We email a link to the program&apos;s contact
              address so only someone who can receive that mail can confirm the
              listing.
            </p>
            <StepList steps={OWNER_STEPS} />
            <p className="mt-6 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-900">
              The Verified by Owner badge helps families trust that the
              information is current and accurate.
            </p>
          </section>

          <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-blue-700">
              For New Program Submissions
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-blue-900">Submit Your Program</h2>
            <p className="mt-3 max-w-3xl text-slate-600">
              If your program is not listed yet, add it from your state page.
              There is no fee to submit.
            </p>
            <StepList steps={SUBMIT_STEPS} />
            <p className="mt-6 text-sm leading-6 text-slate-600">
              All submissions are reviewed for quality and accuracy.
            </p>
            <div className="mt-8">
              <p className="text-sm font-medium text-blue-800">Get started</p>
              <Link href="/" className={`${buttonClass} mt-3`}>
                Submit a Program
              </Link>
            </div>
          </section>

          <section className="rounded-2xl border border-blue-100 bg-white px-6 py-10 text-center shadow-sm sm:px-10">
            <h2 className="text-3xl font-semibold text-balance text-blue-900">
              Get started
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600">
              Browse your state to find a program. To add one, choose your
              state and open the submission form. Both are free.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/" className={buttonClass}>
                Browse Programs
              </Link>
              <Link href="/" className={buttonOutlineClass}>
                Submit a Program
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
