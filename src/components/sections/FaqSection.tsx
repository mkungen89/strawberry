"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

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
    answer: "We accept all major credit and debit cards via Stripe (Visa, Mastercard, Amex). All payments are secure and encrypted.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="relative px-4 py-28 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/[0.03] to-transparent" />

      <div className="relative mx-auto max-w-3xl">
        <div className="mb-16 text-center">
          <Badge className="mb-4 border-purple-500/30 bg-purple-500/10 text-purple-300 px-3">
            FAQ
          </Badge>
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
            Frequently asked{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              questions
            </span>
          </h2>
          <p className="text-lg text-gray-400">
            Can&apos;t find the answer?{" "}
            <Link href="/contact" className="text-purple-400 hover:text-purple-300 underline underline-offset-4">
              Contact us directly
            </Link>.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`rounded-2xl border transition-all duration-300 ${
                openIndex === index
                  ? "border-purple-500/20 bg-white/[0.04]"
                  : "border-white/[0.06] bg-white/[0.02] hover:border-white/10"
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-center justify-between p-5 text-left"
              >
                <span className="pr-4 font-medium text-white">{faq.question}</span>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                  openIndex === index
                    ? "bg-purple-500/20 text-purple-400 rotate-180"
                    : "bg-white/[0.05] text-gray-500"
                }`}>
                  <ChevronDown className="h-4 w-4" />
                </div>
              </button>
              {openIndex === index && (
                <div className="px-5 pb-5">
                  <div className="h-px w-full bg-gradient-to-r from-purple-500/20 via-purple-500/10 to-transparent mb-4" />
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
