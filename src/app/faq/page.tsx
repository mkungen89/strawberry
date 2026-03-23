import { createMetadata } from "@/lib/metadata";
export const metadata = createMetadata({ title: "FAQ", description: "Find answers to common questions about our services, pricing, delivery and support.", path: "/faq" });
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, ArrowRight } from "lucide-react";
import FaqAccordion from "@/components/faq/FaqAccordion";

export default function FaqPage() {
  return (
    <div className="bg-black text-white">
      <Navbar />

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <Badge className="mb-4 bg-purple-600/20 text-purple-400 border border-purple-500/30">
            FAQ
          </Badge>
          <h1 className="mb-4 text-4xl font-bold sm:text-5xl lg:text-6xl">
            Frequently Asked Questions
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-400">
            Find answers to the most common questions about our services,
            ordering process, pricing and support.
          </p>
        </section>

        {/* Accordion */}
        <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
          <FaqAccordion />
        </section>

        {/* Contact CTA */}
        <section className="border-t border-white/10 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl rounded-2xl border border-purple-500/30 bg-purple-600/10 px-8 py-12 text-center">
              <MessageCircle className="mx-auto mb-4 h-10 w-10 text-purple-400" />
              <h2 className="text-2xl font-bold">Still have questions?</h2>
              <p className="mt-3 text-gray-400">
                Can&apos;t find the answer you&apos;re looking for? Our team is
                happy to help. We typically reply within a few hours.
              </p>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link href="/contact">
                  <Button className="bg-purple-600 text-white hover:bg-purple-700 px-6" size="lg">
                    Contact us
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/services">
                  <Button variant="ghost" className="border border-white/20 text-gray-300 hover:text-white px-6" size="lg">
                    Browse services
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
