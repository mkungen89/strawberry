"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Do I need technical knowledge to place an order?",
    answer: "No! We've designed the entire process to be simple for everyone. You just need to tell us what you want — we handle the technical side. Our AI gives you recommendations on what suits your needs best.",
  },
  {
    question: "How long does delivery take?",
    answer: "It depends on the service. Discord servers and graphics are usually delivered within 1–3 days. Websites take 1–2 weeks and mobile apps 2–6 weeks. You always see an estimated delivery time when you order.",
  },
  {
    question: "What happens if I'm not satisfied?",
    answer: "All orders include revisions (2 for the basic package, more for higher tiers). If you're still not satisfied, we offer a full refund within 14 days.",
  },
  {
    question: "Which tech stack should I choose for my website?",
    answer: "Don't worry — our AI recommendation helps you choose the right one. You answer simple questions about your website and we explain which option fits best and why, in a way everyone can understand.",
  },
  {
    question: "Can I track the status of my order?",
    answer: "Yes! In your personal dashboard you can follow every step of the process, chat with the team and see real-time updates. You'll also receive email notifications at every status change.",
  },
  {
    question: "Which payment methods do you accept?",
    answer: "We accept all common credit and debit cards via Stripe (Visa, Mastercard, Amex). All payments are secure and encrypted.",
  },
  {
    question: "What is included in the hosting assistance?",
    answer: "We help you set up your website on the host you've chosen (or our recommendation), connect your domain and make sure everything works. No technical knowledge required.",
  },
  {
    question: "Can I get a discount if I refer a friend?",
    answer: "Yes! Our referral program gives you 10% off your next order when a friend you referred places their first order. Your friend also gets 10% off!",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="bg-white/2 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Frequently asked questions</h2>
          <p className="text-gray-400">Can't find the answer? Contact us directly.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-xl border border-white/10 bg-white/5 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-center justify-between p-5 text-left"
              >
                <span className="font-medium text-white">{faq.question}</span>
                <ChevronDown
                  className={`h-5 w-5 flex-shrink-0 text-gray-400 transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="border-t border-white/10 px-5 pb-5 pt-4">
                  <p className="text-sm text-gray-400 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
