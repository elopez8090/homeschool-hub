export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type FaqSection = {
  id: string;
  title: string;
  items: FaqItem[];
};

export const FAQ_SECTIONS: FaqSection[] = [
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

export function faqEntries() {
  return FAQ_SECTIONS.flatMap((section) =>
    section.items.map((item) => ({
      question: item.question,
      answer: item.answer,
    })),
  );
}
