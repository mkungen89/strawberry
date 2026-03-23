import { createMetadata } from "@/lib/metadata";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata = createMetadata({
  title: "CCPA — California Privacy Rights",
  description: "Information about your privacy rights under the California Consumer Privacy Act (CCPA).",
  path: "/ccpa",
});

export default function CcpaPage() {
  return (
    <div className="bg-black text-white">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white">California Privacy Rights (CCPA)</h1>
          <p className="mt-2 text-sm text-gray-500">Last updated: March 2026</p>
          <p className="mt-4 text-gray-400">
            This notice supplements our Privacy Policy and applies to California residents, in
            accordance with the California Consumer Privacy Act of 2018 (CCPA) as amended by the
            California Privacy Rights Act (CPRA).
          </p>
        </div>

        <div className="space-y-10 text-gray-300 leading-relaxed">
          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">1. Information We Collect</h2>
            <p>We may collect the following categories of personal information:</p>
            <ul className="mt-3 space-y-2 list-none">
              {[
                { cat: "Identifiers", desc: "Name, email address, account name, IP address." },
                { cat: "Commercial Information", desc: "Order history, services purchased, transaction details." },
                { cat: "Internet Activity", desc: "Browsing history on our site, interactions with our services, cookies." },
                { cat: "Professional Information", desc: "Business name or role (if provided during order)." },
              ].map((item) => (
                <li key={item.cat} className="flex gap-3">
                  <span className="mt-0.5 text-purple-400 shrink-0">&#8226;</span>
                  <span><span className="font-medium text-white">{item.cat}:</span> {item.desc}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">2. Your Rights Under CCPA</h2>
            <p>As a California resident, you have the right to:</p>
            <ul className="mt-3 space-y-2 list-none">
              {[
                "Right to Know: Request what personal information we have collected, used, disclosed, or sold about you.",
                "Right to Delete: Request deletion of your personal information, subject to certain exceptions.",
                "Right to Opt-Out: Opt out of the sale or sharing of your personal information. Note: We do not sell your personal information.",
                "Right to Non-Discrimination: We will not discriminate against you for exercising your CCPA rights.",
                "Right to Correct: Request correction of inaccurate personal information we maintain about you.",
                "Right to Limit Use of Sensitive Personal Information: Request that we limit the use of your sensitive personal information.",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-0.5 text-purple-400 shrink-0">&#8226;</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">3. We Do Not Sell Personal Information</h2>
            <p>
              Vexcraft does not sell, rent, or share your personal information with third parties
              for their direct marketing purposes. We have not sold personal information in the
              preceding 12 months.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">4. How to Exercise Your Rights</h2>
            <p>To submit a request, contact us at:</p>
            <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-4 space-y-1 text-sm">
              <p>
                <span className="text-gray-400">Email:</span>{" "}
                <a href="mailto:privacy@vexcraft.io" className="text-purple-400 hover:text-purple-300">
                  privacy@vexcraft.io
                </a>
              </p>
              <p>
                <span className="text-gray-400">Response time:</span> Within 45 days
              </p>
            </div>
            <p className="mt-3">
              We may need to verify your identity before processing your request. We will confirm
              receipt of your request within 10 business days and provide a substantive response
              within 45 days.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">5. Authorized Agent</h2>
            <p>
              You may designate an authorized agent to submit a request on your behalf. The agent
              must provide proof of authorization, and we may still require you to verify your
              identity directly.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">6. Contact</h2>
            <p>For questions about this CCPA notice or our privacy practices:</p>
            <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-4 space-y-1 text-sm">
              <p>
                <span className="text-gray-400">Email:</span>{" "}
                <a href="mailto:privacy@vexcraft.io" className="text-purple-400 hover:text-purple-300">
                  privacy@vexcraft.io
                </a>
              </p>
              <p>
                <span className="text-gray-400">Website:</span>{" "}
                <a href="https://vexcraft.io" className="text-purple-400 hover:text-purple-300">
                  vexcraft.io
                </a>
              </p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
