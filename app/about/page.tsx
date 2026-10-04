"use client";

import Link from "next/link";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";

const FAMILY_BENEFITS = [
  "Open your state and see co-ops, classes, and resources in one list.",
  "Look for the Verified by Owner badge before you reach out.",
  "Spend less time hunting through scattered posts and more time choosing a fit.",
];

const OWNER_BENEFITS = [
  "Submit a listing at no cost and reach families already looking in your state.",
  "Claim your program so the details come from someone responsible for it.",
  "Show a verification badge that sets a confirmed listing apart.",
];

const COMMITMENTS = [
  {
    title: "Free directory",
    body: "Families browse for free, and program owners can submit a listing without a fee. The hub stays open so local communities can be found.",
  },
  {
    title: "Verification badges",
    body: "Owners can claim a listing and display a Verified by Owner badge. That badge tells families a real owner has confirmed the program details.",
  },
  {
    title: "Community-focused",
    body: "Listings are organized by state, close to where families live and learn. The directory is built for local Christian homeschool communities.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-white text-slate-800">
      <Navigation />

      <main className="flex-1">
        <section className="bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 text-white">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-200">
              Our story
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold text-balance sm:text-5xl">
              About Christian Homeschools Hub
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-blue-100">
              A free place for Christian homeschool families to find programs,
              co-ops, and resources by location — and for program owners to be
              found by the families they serve.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-6xl space-y-10 px-4 py-12 sm:px-6 sm:py-16 lg:space-y-14">
          <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-semibold text-blue-900">Our mission</h2>
            <p className="mt-4 text-xl font-medium text-slate-800">
              To connect homeschooling families with quality educational
              programs and resources.
            </p>
            <p className="mt-3 max-w-3xl text-slate-600">
              Search should start with place. Families can open their state,
              see what is nearby, and recognize listings an owner has verified.
              Program owners get a straightforward way to be discovered by the
              people they hope to serve.
            </p>
          </section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-2xl font-semibold text-blue-900">Why we exist</h2>
              <p className="mt-4 text-slate-600">
                Christ-centered co-ops, hybrid schools, tutoring, and support
                groups are often shared in church bulletins, private websites,
                and social posts. A family new to an area can ask around for
                weeks and still miss a program a few miles away.
              </p>
              <p className="mt-3 text-slate-600">
                Program owners face the same gap from the other side. They have
                room for more families, but no shared directory organized by
                location. Christian Homeschools Hub exists to close that gap.
              </p>
            </section>

            <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-2xl font-semibold text-blue-900">How it started</h2>
              <p className="mt-4 text-slate-600">
                The hub began with that search problem. Families needed one
                place to look by state, and program owners needed a simple way
                to be found. What started as a gathering place for those
                listings grew into a free, multi-state directory.
              </p>
              <p className="mt-3 text-slate-600">
                Owner verification came next. A badge on a program means
                someone responsible for it has confirmed the details, so
                families can browse with more confidence and owners can stand
                behind their own listing.
              </p>
            </section>
          </div>

          <section>
            <h2 className="text-2xl font-semibold text-blue-900">How we help</h2>
            <p className="mt-3 max-w-3xl text-slate-600">
              The directory serves both sides of the same community: families
              looking for a fit, and the people who run the programs.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <article className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm sm:p-8">
                <h3 className="text-lg font-semibold text-blue-900">
                  Homeschool families
                </h3>
                <ul className="mt-4 space-y-3 text-slate-600">
                  {FAMILY_BENEFITS.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-700"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
              <article className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm sm:p-8">
                <h3 className="text-lg font-semibold text-blue-900">
                  Program owners
                </h3>
                <ul className="mt-4 space-y-3 text-slate-600">
                  {OWNER_BENEFITS.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-700"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-blue-900">Our commitment</h2>
            <p className="mt-3 max-w-3xl text-slate-600">
              Three choices shape the hub: it stays free, listings can be
              verified by their owners, and everything is organized around
              local communities.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
              {COMMITMENTS.map((item) => (
                <article
                  key={item.title}
                  className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-blue-900">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-blue-100 bg-white px-6 py-10 text-center shadow-sm sm:px-10">
            <h2 className="text-3xl font-semibold text-balance text-blue-900">
              Find a program, or share one
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600">
              Browse by state to see what is near you. To add a program, choose
              your state and submit your listing for review.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/"
                className="inline-flex w-full justify-center rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 sm:w-auto"
              >
                Browse programs
              </Link>
              <Link
                href="/"
                className="inline-flex w-full justify-center rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-800 hover:bg-blue-50 sm:w-auto"
              >
                Submit a program
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
