"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const faqs = [
  {
    question: "Do I need technical knowledge to place an order?",
    answer: "No! We've designed the entire process to be simple for everyone. You just need to tell us what you want — we handle the technical side. We guide you and recommend what suits your needs best.",
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
    answer: "Don't worry — we help you choose the right one. You answer simple questions about your website and we explain which option fits best and why, in a way everyone can understand.",
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
        <div className="mb-16 text-center animate-fade-up">
          <Badge className="mb-4 border-purple-500/30 bg-purple-500/10 text-purple-300 px-3">
            FAQ
          </Badge>
          <h2 className="mb-4 text-3xl font-bold tracking-tight leading-[1.1] sm:text-4xl lg:text-5xl">
            Frequently asked{" "}
            <span className="gradient-text">questions</span>
          </h2>
          <p className="text-lg text-white/50">
            Can&apos;t find the answer?{" "}
            <Link href="/contact" className="text-purple-400 hover:text-purple-300 underline underline-offset-4 transition-colors">
              Contact us directly
            </Link>.
          </p>
        </div>

        <div className="space-y-2.5">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`rounded-2xl border backdrop-blur-sm transition-all duration-300 ${
                openIndex === index
                  ? "border-purple-500/25 bg-white/[0.05] shadow-lg shadow-purple-500/5"
                  : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.03]"
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-center justify-between p-5 text-left group"
              >
                <span className="pr-4 font-medium text-white tracking-tight group-hover:text-purple-100 transition-colors">{faq.question}</span>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                  openIndex === index
                    ? "bg-purple-500/20 text-purple-400 rotate-180"
                    : "bg-white/[0.05] text-white/30 group-hover:bg-white/[0.08] group-hover:text-white/50"
                }`}>
                  <ChevronDown className="h-4 w-4" />
                </div>
              </button>
              {openIndex === index && (
                <div className="px-5 pb-5 animate-fade-up">
                  <div className="h-px w-full bg-gradient-to-r from-purple-500/20 via-purple-500/10 to-transparent mb-4" />
                  <p className="text-sm text-white/55 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
