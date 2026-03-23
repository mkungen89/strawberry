"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

type FaqItem = {
  question: string;
  answer: string;
};

type FaqCategory = {
  label: string;
  items: FaqItem[];
};

const FAQ_DATA: FaqCategory[] = [
  {
    label: "General",
    items: [
      {
        question: "What is Vexcraft?",
        answer:
          "Vexcraft is a digital studio specialising in custom services for creators and businesses — including Discord server setup, YouTube branding, streaming overlays, websites, mobile apps, and streaming emote packs.",
      },
      {
        question: "How do I place an order?",
        answer:
          "Browse our services page, choose the package that fits your needs, and click 'Get started'. You'll be guided through a brief order form. We'll then reach out within 24 hours to confirm details and collect payment.",
      },
      {
        question: "Do I need technical knowledge to work with you?",
        answer:
          "Not at all. We handle all the technical aspects. You simply tell us what you want and we'll make it happen. Our order forms are designed to capture everything we need in plain language.",
      },
      {
        question: "What languages do you work in?",
        answer:
          "We work in Swedish and English. All deliverables can be produced in either language — or both — based on your requirements.",
      },
      {
        question: "Can I see examples of your work?",
        answer:
          "Yes! Head to our Portfolio page to see a selection of completed projects across all our service categories.",
      },
    ],
  },
  {
    label: "Orders & Payment",
    items: [
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept all major credit and debit cards via Stripe, including Visa, Mastercard, and American Express. Payment is required before work begins. For large projects, milestone billing can be arranged.",
      },
      {
        question: "Are prices inclusive of VAT?",
        answer:
          "All listed prices are excluding VAT. VAT may be applicable depending on your jurisdiction. Companies with a valid VAT number registered within the EU may be exempt from VAT depending on their location.",
      },
      {
        question: "Do you offer refunds?",
        answer:
          "Yes. If work has not yet started, you are entitled to a full refund. Once work has begun, refunds are issued proportionally based on completion. We always discuss any issues openly before escalating to a refund.",
      },
      {
        question: "Can I upgrade or change my package after ordering?",
        answer:
          "Absolutely. Contact us at any point during the project to upgrade your package. You only pay the price difference. Downgrades are handled case by case.",
      },
      {
        question: "Will I receive an invoice?",
        answer:
          "Yes. A formal invoice is issued for every order. If you need a specific invoice format or purchase order number included, let us know when placing your order.",
      },
    ],
  },
  {
    label: "Technical",
    items: [
      {
        question: "What platforms do your websites support?",
        answer:
          "We build on a range of modern stacks — Next.js, React, Vue.js, SvelteKit, and more. For backend we use Node.js, PHP, Python, and Laravel. We also help you choose the right hosting (Vercel, Railway, DigitalOcean, etc.).",
      },
      {
        question: "Will I own the source code for my project?",
        answer:
          "Yes. Upon final payment, full ownership of the source code and all deliverables transfers to you. We do not retain any licence over your project.",
      },
      {
        question: "Which streaming software are your overlays compatible with?",
        answer:
          "All overlays are delivered ready for OBS Studio and Streamlabs. We can also provide formats compatible with StreamElements or any software that supports browser sources.",
      },
      {
        question: "Do you handle App Store and Google Play submission?",
        answer:
          "Yes, our Enterprise mobile app package includes full publishing support for both the Apple App Store and Google Play Store. You will need an active developer account for each platform.",
      },
      {
        question: "Do your websites include SEO?",
        answer:
          "All websites include basic on-page SEO as standard. Our Business and Custom packages include more advanced SEO setup including meta tags, structured data, and sitemap generation.",
      },
    ],
  },
  {
    label: "Revisions & Support",
    items: [
      {
        question: "How many revisions are included in my package?",
        answer:
          "The number of revisions is specified on each package card. Basic packages typically include 2 revisions, Pro packages 3–5, and Premium/Custom packages include unlimited revisions.",
      },
      {
        question: "What counts as a revision?",
        answer:
          "A revision is any round of changes requested after the first draft is delivered. Minor corrections (typos, small colour tweaks) within the same round do not count as a new revision.",
      },
      {
        question: "What happens if I need more revisions than included?",
        answer:
          "Additional revision rounds can be purchased at a flat fee. We'll let you know the cost before proceeding so there are no surprises.",
      },
      {
        question: "Do you offer post-delivery support?",
        answer:
          "Yes. All packages include a 30-day support window after delivery for bug fixes and minor adjustments. Our Enterprise and Custom packages include extended support (6 months). Ongoing maintenance retainers are also available.",
      },
      {
        question: "How do I get in touch if I have a problem?",
        answer:
          "You can reach us via the contact form on our site, by email, or through your order dashboard. We aim to respond within 24 hours on business days.",
      },
    ],
  },
];

function AccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-white/10">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-5 text-left"
        aria-expanded={isOpen}
      >
        <span className="pr-4 font-medium text-white">{item.question}</span>
        <ChevronDown
          className={[
            "h-5 w-5 shrink-0 text-purple-400 transition-transform duration-200",
            isOpen ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>
      {isOpen && (
        <p className="pb-5 text-sm leading-relaxed text-gray-400">
          {item.answer}
        </p>
      )}
    </div>
  );
}

function CategorySection({ category }: { category: FaqCategory }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div>
      {category.items.map((item, i) => (
        <AccordionItem
          key={item.question}
          item={item}
          isOpen={openIndex === i}
          onToggle={() => setOpenIndex(openIndex === i ? null : i)}
        />
      ))}
    </div>
  );
}

export default function FaqAccordion() {
  const [activeCategory, setActiveCategory] = useState(FAQ_DATA[0].label);

  const currentCategory = FAQ_DATA.find((c) => c.label === activeCategory)!;

  return (
    <div>
      {/* Category tabs */}
      <div className="mb-10 flex flex-wrap justify-center gap-2">
        {FAQ_DATA.map((cat) => (
          <button
            key={cat.label}
            onClick={() => setActiveCategory(cat.label)}
            className={[
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-all",
              activeCategory === cat.label
                ? "border-purple-500 bg-purple-600 text-white"
                : "border-white/10 bg-white/5 text-gray-400 hover:border-purple-500/50 hover:text-white",
            ].join(" ")}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Questions for active category */}
      <div className="mx-auto max-w-3xl">
        <CategorySection key={activeCategory} category={currentCategory} />
      </div>
    </div>
  );
}
