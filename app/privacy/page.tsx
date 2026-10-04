"use client";

import type { MouseEvent } from "react";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";

const LAST_UPDATED = "October 4, 2026";
const SUPPORT_EMAIL = "support@christianhomeschoolshub.com";

const SECTIONS = [
  { id: "introduction", label: "Introduction" },
  { id: "information-we-collect", label: "Information We Collect" },
  { id: "how-we-use-your-information", label: "How We Use Your Information" },
  { id: "data-security", label: "Data Security" },
  { id: "your-rights", label: "Your Rights" },
  { id: "third-party-services", label: "Third-Party Services" },
  { id: "childrens-privacy", label: "Children's Privacy" },
  { id: "changes-to-this-policy", label: "Changes to This Policy" },
  { id: "contact-us", label: "Contact Us" },
] as const;

const SERVICE_LINKS = [
  {
    name: "Supabase",
    detail: "stores program listings, submissions, and account records.",
    href: "https://supabase.com/privacy",
  },
  {
    name: "Stripe",
    detail:
      "processes payments when a program owner upgrades a listing. Card details are handled by Stripe. We do not store full payment card numbers on our servers.",
    href: "https://stripe.com/privacy",
  },
  {
    name: "SendGrid",
    detail:
      "may deliver emails such as ownership verification, submission updates, and replies to contact messages.",
    href: "https://www.twilio.com/en-us/legal/privacy",
  },
  {
    name: "Mailchimp Transactional",
    detail: "may deliver those same transactional emails when it is the active mail provider.",
    href: "https://www.intuit.com/privacy/statement/",
  },
] as const;

function scrollToSection(event: MouseEvent<HTMLAnchorElement>, id: string) {
  if (
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.button !== 0
  ) {
    return;
  }

  const target = document.getElementById(id);
  if (!target) return;

  event.preventDefault();
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  window.history.pushState(null, "", `#${id}`);
  target.focus({ preventScroll: true });
}

function SectionHeading({ id, children }: { id: string; children: string }) {
  return (
    <h2
      id={id}
      tabIndex={-1}
      className="scroll-mt-28 text-2xl font-semibold text-blue-900 outline-none"
    >
      {children}
    </h2>
  );
}

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-white text-slate-800">
      <Navigation />

      <main className="flex-1">
        <section className="bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 text-white">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-200">
              Legal
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold text-balance sm:text-5xl">
              Privacy Policy
            </h1>
            <p className="mt-4 text-base text-blue-100">
              Last Updated: {LAST_UPDATED}
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start lg:gap-12">
          <nav
            aria-label="Table of contents"
            className="mb-10 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm lg:sticky lg:top-28 lg:mb-0"
          >
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-900">
              On this page
            </p>
            <ol className="mt-4 space-y-2">
              {SECTIONS.map((section, index) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    onClick={(event) => scrollToSection(event, section.id)}
                    className="block rounded-md px-2 py-1.5 text-sm leading-relaxed text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                  >
                    <span className="mr-2 text-blue-700">{index + 1}.</span>
                    {section.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="divide-y divide-slate-200">
            <section aria-labelledby="introduction" className="pb-10">
              <SectionHeading id="introduction">Introduction</SectionHeading>
              <p className="mt-4 leading-relaxed text-slate-700">
                This Privacy Policy explains how Christian Homeschools Hub
                (&apos;we,&apos; &apos;us,&apos; &apos;our&apos;) collects, uses,
                and protects your information when you visit our website and use
                our services.
              </p>
            </section>

            <section aria-labelledby="information-we-collect" className="py-10">
              <SectionHeading id="information-we-collect">
                Information We Collect
              </SectionHeading>
              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-blue-800">
                    Personal Information
                  </h3>
                  <p className="mt-2 leading-relaxed text-slate-700">
                    Name, email address, and phone number when you claim a
                    program, submit a listing, or contact us.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-800">
                    Program Information
                  </h3>
                  <p className="mt-2 leading-relaxed text-slate-700">
                    Details you submit when claiming or submitting programs,
                    such as the program name, description, location, category,
                    and public contact details.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-800">
                    Automatically Collected
                  </h3>
                  <p className="mt-2 leading-relaxed text-slate-700">
                    IP address, browser type, and pages visited, collected
                    through standard server and hosting logs. We do not use
                    Google Analytics or similar third-party advertising
                    analytics.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-800">Cookies</h3>
                  <p className="mt-2 leading-relaxed text-slate-700">
                    We use essential cookies to keep program owners and
                    administrators signed in. These cookies support account
                    sessions. We do not use them to sell data or to run
                    advertising profiles.
                  </p>
                </div>
              </div>
            </section>

            <section aria-labelledby="how-we-use-your-information" className="py-10">
              <SectionHeading id="how-we-use-your-information">
                How We Use Your Information
              </SectionHeading>
              <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-slate-700">
                <li>To verify program ownership when you claim a program</li>
                <li>To contact you regarding your program submission or inquiry</li>
                <li>To process a listing upgrade when you choose a paid plan</li>
                <li>To improve our website and services</li>
                <li>To comply with legal obligations</li>
                <li>
                  We do not sell your personal information, and we do not share
                  it with third parties for their own marketing
                </li>
              </ul>
              <p className="mt-4 leading-relaxed text-slate-700">
                Service providers listed below process information only so we
                can host the site, store listings, send email, and take
                payments.
              </p>
            </section>

            <section aria-labelledby="data-security" className="py-10">
              <SectionHeading id="data-security">Data Security</SectionHeading>
              <p className="mt-4 leading-relaxed text-slate-700">
                We implement industry-standard security measures to protect your
                information. However, no online transmission is 100% secure. We
                encourage you to use strong passwords and protect your email
                account.
              </p>
            </section>

            <section aria-labelledby="your-rights" className="py-10">
              <SectionHeading id="your-rights">Your Rights</SectionHeading>
              <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-slate-700">
                <li>
                  <span className="font-medium text-slate-800">Right to access:</span>{" "}
                  You can request a copy of your personal data
                </li>
                <li>
                  <span className="font-medium text-slate-800">Right to deletion:</span>{" "}
                  You can request deletion of your data (subject to legal
                  requirements)
                </li>
                <li>
                  <span className="font-medium text-slate-800">
                    Right to correction:
                  </span>{" "}
                  You can update your information
                </li>
              </ul>
              <p className="mt-4 leading-relaxed text-slate-700">
                To exercise these rights, contact us at{" "}
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="font-medium text-blue-800 underline decoration-blue-200 underline-offset-2 hover:text-blue-950"
                >
                  {SUPPORT_EMAIL}
                </a>
                .
              </p>
            </section>

            <section aria-labelledby="third-party-services" className="py-10">
              <SectionHeading id="third-party-services">
                Third-Party Services
              </SectionHeading>
              <p className="mt-4 leading-relaxed text-slate-700">
                Our website uses the services below for data storage, payments,
                and email. These services have their own privacy policies, which
                we encourage you to review.
              </p>
              <ul className="mt-4 list-disc space-y-3 pl-5 leading-relaxed text-slate-700">
                {SERVICE_LINKS.map((service) => (
                  <li key={service.name}>
                    <a
                      href={service.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-blue-800 underline decoration-blue-200 underline-offset-2 hover:text-blue-950"
                    >
                      {service.name}
                    </a>{" "}
                    {service.detail}
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="childrens-privacy" className="py-10">
              <SectionHeading id="childrens-privacy">
                Children&apos;s Privacy
              </SectionHeading>
              <p className="mt-4 leading-relaxed text-slate-700">
                Christian Homeschools Hub is not directed at children under 13.
                We do not knowingly collect personal information from children
                under 13. If we become aware of such collection, we will delete
                the information promptly.
              </p>
            </section>

            <section aria-labelledby="changes-to-this-policy" className="py-10">
              <SectionHeading id="changes-to-this-policy">
                Changes to This Policy
              </SectionHeading>
              <p className="mt-4 leading-relaxed text-slate-700">
                We may update this Privacy Policy from time to time. We will
                notify you of significant changes by updating the &apos;Last
                Updated&apos; date on this page.
              </p>
            </section>

            <section aria-labelledby="contact-us" className="pt-10">
              <SectionHeading id="contact-us">Contact Us</SectionHeading>
              <p className="mt-4 leading-relaxed text-slate-700">
                If you have questions about this Privacy Policy or our privacy
                practices, please contact us at:{" "}
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="font-medium text-blue-800 underline decoration-blue-200 underline-offset-2 hover:text-blue-950"
                >
                  {SUPPORT_EMAIL}
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
