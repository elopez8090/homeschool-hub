"use client";

import type { MouseEvent } from "react";

const LAST_UPDATED = "October 4, 2026";
const SUPPORT_EMAIL = "support@christianhomeschoolshub.com";

const SECTIONS = [
  { id: "agreement-to-terms", label: "Agreement to Terms" },
  { id: "use-license", label: "Use License" },
  { id: "disclaimer", label: "Disclaimer" },
  { id: "limitations", label: "Limitations" },
  { id: "accuracy-of-materials", label: "Accuracy of Materials" },
  { id: "links", label: "Links" },
  { id: "modifications", label: "Modifications" },
  { id: "program-submissions", label: "Program Submissions" },
  { id: "user-conduct", label: "User Conduct" },
  { id: "claiming-programs", label: "Claiming Programs" },
  { id: "limitation-of-liability", label: "Limitation of Liability" },
  { id: "governing-law", label: "Governing Law" },
  { id: "contact-for-terms-questions", label: "Contact for Terms Questions" },
] as const;

const LICENSE_RESTRICTIONS = [
  "Modify or copy the materials",
  "Use the materials for any commercial purpose or for any public display",
  "Attempt to decompile or reverse engineer any software contained on the site",
  "Remove any copyright or other proprietary notations from the materials",
  'Transfer the materials to another person or "mirror" the materials on any other server',
  "Use the site or its content for any illegal purpose",
] as const;

const USER_CONDUCT_RULES = [
  "Provide accurate and truthful information",
  "Not engage in fraudulent or deceptive practices",
  "Not impersonate other users or entities",
  "Not submit spam, malware, or offensive content",
  "Respect the intellectual property rights of others",
  "Not attempt to gain unauthorized access to our systems",
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

export default function TermsPage() {
  return (
    <main className="flex-1 bg-white text-slate-800">
        <section className="bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 text-white">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-200">
              Legal
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold text-balance sm:text-5xl">
              Terms of Service
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
            <section aria-labelledby="agreement-to-terms" className="pb-10">
              <SectionHeading id="agreement-to-terms">
                Agreement to Terms
              </SectionHeading>
              <p className="mt-4 leading-relaxed text-slate-700">
                By accessing and using Christian Homeschools Hub, you accept
                and agree to be bound by the terms and provision of this
                agreement. If you do not agree to abide by the above, please do
                not use this service.
              </p>
            </section>

            <section aria-labelledby="use-license" className="py-10">
              <SectionHeading id="use-license">Use License</SectionHeading>
              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-blue-800">
                    Permission granted
                  </h3>
                  <p className="mt-2 leading-relaxed text-slate-700">
                    Permission is granted to temporarily download one copy of
                    the materials (information or software) on Christian
                    Homeschools Hub for personal, non-commercial transitory
                    viewing only.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-800">
                    License, not a transfer of title
                  </h3>
                  <p className="mt-2 leading-relaxed text-slate-700">
                    This is the grant of a license, not a transfer of title.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-800">
                    Restrictions
                  </h3>
                  <p className="mt-2 leading-relaxed text-slate-700">
                    Under this license you may not:
                  </p>
                  <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-slate-700">
                    {LICENSE_RESTRICTIONS.map((restriction) => (
                      <li key={restriction}>{restriction}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <section aria-labelledby="disclaimer" className="py-10">
              <SectionHeading id="disclaimer">Disclaimer</SectionHeading>
              <p className="mt-4 leading-relaxed text-slate-700">
                The materials on Christian Homeschools Hub are provided on an
                &apos;as is&apos; basis. We make no warranties, expressed or
                implied, and hereby disclaim and negate all other warranties
                including, without limitation, implied warranties or conditions
                of merchantability, fitness for a particular purpose, or
                non-infringement of intellectual property or other violation of
                rights.
              </p>
            </section>

            <section aria-labelledby="limitations" className="py-10">
              <SectionHeading id="limitations">Limitations</SectionHeading>
              <p className="mt-4 leading-relaxed text-slate-700">
                In no event shall Christian Homeschools Hub or its suppliers be
                liable for any damages (including, without limitation, damages
                for loss of data or profit, or due to business interruption)
                arising out of the use or inability to use the materials on the
                site, even if we or an authorized representative has been
                notified orally or in writing of the possibility of such
                damage.
              </p>
            </section>

            <section aria-labelledby="accuracy-of-materials" className="py-10">
              <SectionHeading id="accuracy-of-materials">
                Accuracy of Materials
              </SectionHeading>
              <p className="mt-4 leading-relaxed text-slate-700">
                The materials appearing on Christian Homeschools Hub could
                include technical, typographical, or photographic errors. We do
                not warrant that any of the materials on the site are accurate,
                complete, or current. We may make changes to the materials
                contained on the site at any time without notice.
              </p>
            </section>

            <section aria-labelledby="links" className="py-10">
              <SectionHeading id="links">Links</SectionHeading>
              <p className="mt-4 leading-relaxed text-slate-700">
                We have not reviewed all of the sites linked to our website and
                are not responsible for the contents of any such linked site.
                The inclusion of any link does not imply endorsement by us of
                the site. Use of any such linked website is at the user&apos;s
                own risk.
              </p>
            </section>

            <section aria-labelledby="modifications" className="py-10">
              <SectionHeading id="modifications">Modifications</SectionHeading>
              <p className="mt-4 leading-relaxed text-slate-700">
                We may revise these terms of service for our website at any
                time without notice. By using this website, you are agreeing to
                be bound by the then current version of these terms of service.
              </p>
            </section>

            <section aria-labelledby="program-submissions" className="py-10">
              <SectionHeading id="program-submissions">
                Program Submissions
              </SectionHeading>
              <p className="mt-4 leading-relaxed text-slate-700">
                When you submit a program to our directory, you grant us a
                non-exclusive, worldwide, royalty-free license to use,
                reproduce, modify, and publish the information you provide. You
                warrant that you have the right to submit this information and
                that it is accurate and not infringing on any third-party
                rights.
              </p>
            </section>

            <section aria-labelledby="user-conduct" className="py-10">
              <SectionHeading id="user-conduct">User Conduct</SectionHeading>
              <p className="mt-4 leading-relaxed text-slate-700">
                Users agree to:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-slate-700">
                {USER_CONDUCT_RULES.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="claiming-programs" className="py-10">
              <SectionHeading id="claiming-programs">
                Claiming Programs
              </SectionHeading>
              <p className="mt-4 leading-relaxed text-slate-700">
                Only authorized representatives of a program may claim
                ownership. By claiming a program, you certify that you have the
                authority to act on behalf of that program and that all
                information provided is accurate. False claims may result in
                the removal of your program listing.
              </p>
            </section>

            <section aria-labelledby="limitation-of-liability" className="py-10">
              <SectionHeading id="limitation-of-liability">
                Limitation of Liability
              </SectionHeading>
              <p className="mt-4 leading-relaxed text-slate-700">
                Christian Homeschools Hub shall not be liable to you in
                relation to the contents of, or use of, or otherwise in
                connection with, any linked website for any indirect, special
                or consequential loss, or for any business losses, loss of
                revenue, income, profits or anticipated savings.
              </p>
            </section>

            <section aria-labelledby="governing-law" className="py-10">
              <SectionHeading id="governing-law">Governing Law</SectionHeading>
              <p className="mt-4 leading-relaxed text-slate-700">
                These terms and conditions are governed by and construed in
                accordance with the laws of New York, and you irrevocably
                submit to the exclusive jurisdiction of the courts located in
                New York.
              </p>
            </section>

            <section
              aria-labelledby="contact-for-terms-questions"
              className="pt-10"
            >
              <SectionHeading id="contact-for-terms-questions">
                Contact for Terms Questions
              </SectionHeading>
              <p className="mt-4 leading-relaxed text-slate-700">
                If you have any questions about these Terms of Service, please
                contact us at:{" "}
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
  );
}
