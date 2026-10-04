"use client";

import { useState } from "react";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

type FaqSection = {
  id: string;
  title: string;
  items: FaqItem[];
};

const FAQ_SECTIONS: FaqSection[] = [
  {
    id: "about-the-platform",
    title: "About the Platform",
    items: [
      {
        id: "what-is-the-hub",
        question: "What is Christian Homeschools Hub?",
        answer:
          "A free, community-driven directory of homeschool programs organized by state. We help families discover quality educational resources and allow program owners to claim and verify their listings.",
      },
      {
        id: "is-it-free",
        question: "Is Christian Homeschools Hub free to use?",
        answer:
          "Yes! Both browsing and submitting programs are completely free. We're committed to supporting the homeschool community.",
      },
      {
        id: "how-often-updated",
        question: "How often is the directory updated?",
        answer:
          "Our directory is updated regularly as new programs are submitted and existing programs are claimed and verified by their owners.",
      },
    ],
  },
  {
    id: "finding-programs",
    title: "Finding & Using Programs",
    items: [
      {
        id: "find-by-state",
        question: "How do I find programs in my state?",
        answer:
          "Visit our homepage, select your state, and browse all available programs. You can also use the search and filter options to narrow down by category.",
      },
      {
        id: "program-information",
        question: "What information do programs provide?",
        answer:
          "Each program listing includes the program name, description, location, category, contact email, phone number, and website if available.",
      },
      {
        id: "contact-programs",
        question: "Can I contact programs directly?",
        answer:
          "Yes! Each program listing displays contact information. You can email or call directly to learn more and inquire about enrollment.",
      },
    ],
  },
  {
    id: "claiming-your-program",
    title: "Claiming Your Program",
    items: [
      {
        id: "how-to-claim",
        question: "How do I claim my program?",
        answer:
          "Find your program in our directory using search/filters. Click the 'Claim This Program' button, enter your program's contact email, and check your email for a verification link. Click the link to confirm ownership.",
      },
      {
        id: "verified-badge",
        question: "What is the 'Verified by Owner' badge?",
        answer:
          "This badge indicates that the program owner has verified their listing. It helps families trust that the information is current and accurate.",
      },
      {
        id: "verification-time",
        question: "How long does verification take?",
        answer:
          "Verification is instant! Once you click the email link, your program is immediately marked as verified.",
      },
      {
        id: "edit-after-claim",
        question: "Can I edit my program information after claiming it?",
        answer:
          "Currently, you can contact us with updates. We're working on adding an edit feature for claimed programs.",
      },
    ],
  },
  {
    id: "submitting-programs",
    title: "Submitting Programs",
    items: [
      {
        id: "submit-program",
        question: "How do I submit a new program?",
        answer:
          "Go to our submit program page, fill out the form with your program details, and submit. Our team reviews submissions for quality and accuracy.",
      },
      {
        id: "approval-time",
        question: "How long does it take to get a submission approved?",
        answer:
          "We typically review submissions within 3-5 business days. You'll receive an email notification once your program is approved or if we need more information.",
      },
      {
        id: "submission-denied",
        question: "Why was my submission denied?",
        answer:
          "We may deny submissions if information is incomplete, inaccurate, or if the program is a duplicate. You'll receive an explanation via email.",
      },
      {
        id: "multiple-programs",
        question: "Can I submit multiple programs?",
        answer:
          "Yes! You can submit as many programs as you'd like. Each submission is reviewed individually.",
      },
    ],
  },
  {
    id: "technical-and-other",
    title: "Technical & Other",
    items: [
      {
        id: "privacy",
        question: "Is my information private?",
        answer:
          "Your personal information is handled according to our Privacy Policy. We only use contact information to verify program ownership or respond to inquiries.",
      },
      {
        id: "who-runs-it",
        question: "Who runs Christian Homeschools Hub?",
        answer:
          "We're a community-driven initiative dedicated to supporting homeschool families. For more information, visit our About page.",
      },
    ],
  },
];

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      className={`h-5 w-5 shrink-0 text-blue-700 transition-transform duration-300 ease-out ${
        open ? "rotate-180" : ""
      }`}
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function FaqPage() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenId((current) => (current === id ? null : id));
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-white text-slate-800">
      <Navigation />

      <main className="flex-1">
        <section className="bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 text-white">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-200">
              Help center
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold text-balance sm:text-5xl">
              Frequently Asked Questions
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-blue-100">
              Answers about browsing the directory, claiming a listing, and
              submitting a program.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-3xl space-y-12 px-4 py-12 sm:px-6 sm:py-16">
          {FAQ_SECTIONS.map((section) => (
            <section key={section.id} aria-labelledby={section.id}>
              <h2
                id={section.id}
                className="text-2xl font-semibold text-blue-900"
              >
                {section.title}
              </h2>
              <div className="mt-5 space-y-3">
                {section.items.map((item) => {
                  const open = openId === item.id;
                  const panelId = `${item.id}-panel`;
                  const buttonId = `${item.id}-button`;

                  return (
                    <div
                      key={item.id}
                      className={`overflow-hidden rounded-xl border bg-gray-50 shadow-sm transition-colors ${
                        open
                          ? "border-blue-300 border-l-4 border-l-blue-600"
                          : "border-gray-200 border-l-4 border-l-blue-200 hover:border-blue-200"
                      }`}
                    >
                      <h3>
                        <button
                          id={buttonId}
                          type="button"
                          aria-expanded={open}
                          aria-controls={panelId}
                          onClick={() => toggle(item.id)}
                          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-700"
                        >
                          <span className="text-base font-bold text-slate-900 sm:text-lg">
                            {item.question}
                          </span>
                          <ChevronIcon open={open} />
                        </button>
                      </h3>
                      <div
                        id={panelId}
                        role="region"
                        aria-labelledby={buttonId}
                        aria-hidden={!open}
                        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <p className="px-5 pb-5 text-base font-normal leading-relaxed text-slate-700">
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
