import { createMetadata } from "@/lib/metadata";
export const metadata = createMetadata({ title: "GDPR Compliance", description: "Information about how Vexcraft handles personal data in accordance with GDPR requirements.", path: "/gdpr" });
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function GdprPage() {
  return (
    <div className="bg-black text-white">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white">GDPR Compliance</h1>
          <p className="mt-2 text-sm text-gray-500">Last updated: March 2026</p>
          <p className="mt-4 text-gray-400">
            Vexcraft is committed to full compliance with the General Data Protection Regulation
            (EU) 2016/679 (&quot;GDPR&quot;). This page provides information about how we handle personal
            data in accordance with GDPR requirements.
          </p>
        </div>

        <div className="space-y-10 text-gray-300 leading-relaxed">
          {/* Data Controller */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">1. Data Controller</h2>
            <p>
              For the purposes of the GDPR, Vexcraft acts as the Data Controller for personal data
              collected through vexcraft.io. As Data Controller, we determine the purposes and means
              of processing your personal data.
            </p>
            <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-4 space-y-1 text-sm">
              <p className="font-medium text-white">Vexcraft</p>
              <p>
                <span className="text-gray-400">Email:</span>{" "}
                <a href="mailto:gdpr@vexcraft.io" className="text-purple-400 hover:text-purple-300">
                  gdpr@vexcraft.io
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

          {/* Legal Basis for Processing */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">2. Legal Basis for Processing</h2>
            <p>
              We process your personal data only where we have a valid legal basis to do so under
              Article 6 of the GDPR:
            </p>
            <ul className="mt-3 space-y-4 list-none">
              {[
                {
                  title: "Contract Performance (Art. 6(1)(b))",
                  desc: "Processing necessary to fulfil a contract with you, such as managing your account, processing orders, and delivering services you have purchased.",
                },
                {
                  title: "Legal Obligation (Art. 6(1)(c))",
                  desc: "Processing required to comply with applicable legal obligations, such as tax and accounting requirements.",
                },
                {
                  title: "Legitimate Interests (Art. 6(1)(f))",
                  desc: "Processing based on our legitimate business interests, including fraud prevention, improving our services, and maintaining the security of our platform, where these interests are not overridden by your rights.",
                },
                {
                  title: "Consent (Art. 6(1)(a))",
                  desc: "Where we rely on your consent to process data, such as for optional marketing communications, you have the right to withdraw consent at any time without affecting the lawfulness of prior processing.",
                },
              ].map((item) => (
                <li key={item.title} className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <p className="font-medium text-white">{item.title}</p>
                  <p className="mt-1 text-sm">{item.desc}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* Data Subject Rights */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">3. Data Subject Rights</h2>
            <p>
              Under the GDPR, individuals whose personal data we process (&quot;data subjects&quot;) have the
              following rights:
            </p>
            <ul className="mt-3 space-y-3 list-none">
              {[
                {
                  title: "Right of Access (Art. 15)",
                  desc: "You have the right to obtain confirmation of whether we process your personal data, and if so, to receive a copy of that data along with supplementary information about how it is used.",
                },
                {
                  title: "Right to Rectification (Art. 16)",
                  desc: "You have the right to have inaccurate personal data corrected without undue delay. You may also have the right to have incomplete data completed.",
                },
                {
                  title: "Right to Erasure / Right to be Forgotten (Art. 17)",
                  desc: "You have the right to request deletion of your personal data where it is no longer necessary for the purpose for which it was collected, you withdraw consent, or processing is unlawful.",
                },
                {
                  title: "Right to Restriction of Processing (Art. 18)",
                  desc: "You have the right to request that we restrict processing of your data in certain circumstances, such as when you contest the accuracy of the data or have objected to processing.",
                },
                {
                  title: "Right to Data Portability (Art. 20)",
                  desc: "You have the right to receive personal data you have provided to us in a structured, commonly used, and machine-readable format, and to transmit that data to another controller.",
                },
                {
                  title: "Right to Object (Art. 21)",
                  desc: "You have the right to object to processing based on legitimate interests or for direct marketing purposes. Where you object to direct marketing, we will stop processing immediately.",
                },
                {
                  title: "Rights Related to Automated Decision-Making (Art. 22)",
                  desc: "You have the right not to be subject to decisions based solely on automated processing, including profiling, which produce legal or similarly significant effects.",
                },
              ].map((item) => (
                <li key={item.title} className="flex gap-3">
                  <span className="mt-0.5 text-purple-400 shrink-0">&#8226;</span>
                  <span>
                    <span className="font-medium text-white">{item.title}:</span> {item.desc}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* How to Exercise Your Rights */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">4. How to Exercise Your Rights</h2>
            <p>
              To exercise any of your GDPR rights, please submit a written request to our dedicated
              data protection contact:
            </p>
            <div className="mt-4 rounded-lg border border-purple-500/30 bg-purple-600/10 p-4">
              <p className="font-medium text-white">Data Protection Contact</p>
              <p className="mt-1 text-sm">
                Email:{" "}
                <a href="mailto:gdpr@vexcraft.io" className="text-purple-400 hover:text-purple-300">
                  gdpr@vexcraft.io
                </a>
              </p>
            </div>
            <p className="mt-4">When submitting your request, please include:</p>
            <ul className="mt-2 space-y-2 list-none">
              {[
                "Your full name and email address associated with your Vexcraft account.",
                "A clear description of the right you wish to exercise.",
                "Any relevant details to help us identify and process your request.",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-0.5 text-purple-400 shrink-0">&#8226;</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3">
              We will respond to your request within 30 days. In complex cases we may extend this
              period by a further two months, and we will notify you accordingly. We do not charge a
              fee for exercising your rights unless requests are manifestly unfounded or excessive.
            </p>
            <p className="mt-3">
              If you are not satisfied with our response, you have the right to lodge a complaint
              with your local supervisory authority. In the EU, the relevant authority is typically
              the data protection authority of the EU member state in which you reside.
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">5. Data Retention</h2>
            <p>
              We retain personal data only for as long as necessary to fulfil the purposes for which
              it was collected, including legal, accounting, or reporting requirements.
            </p>
            <ul className="mt-3 space-y-2 list-none">
              {[
                "Account data is retained for as long as your account is active. If you request account deletion, we will erase your data within 30 days, except where retention is required by law.",
                "Order and transaction records are retained for a minimum of 7 years in compliance with financial and tax regulations.",
                "Support communications are retained for up to 2 years after the resolution of your enquiry.",
                "Analytics data is aggregated and anonymised after 14 months.",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-0.5 text-purple-400 shrink-0">&#8226;</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* International Transfers */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">6. International Data Transfers</h2>
            <p>
              Your personal data may be transferred to and processed in countries outside the
              European Economic Area (EEA). Where such transfers occur, we ensure that appropriate
              safeguards are in place to protect your data in accordance with GDPR requirements.
            </p>
            <p className="mt-3">
              We rely on the following safeguards for international transfers:
            </p>
            <ul className="mt-3 space-y-2 list-none">
              {[
                "Adequacy decisions by the European Commission for transfers to countries deemed to provide an adequate level of protection.",
                "Standard Contractual Clauses (SCCs) approved by the European Commission for transfers to third-party service providers.",
                "Binding Corporate Rules or other approved transfer mechanisms where applicable.",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-0.5 text-purple-400 shrink-0">&#8226;</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3">
              Our primary third-party processors (Stripe, Google) maintain their own GDPR-compliant
              data transfer mechanisms. You may request details of the safeguards in place for any
              specific transfer by contacting{" "}
              <a href="mailto:gdpr@vexcraft.io" className="text-purple-400 hover:text-purple-300">
                gdpr@vexcraft.io
              </a>
              .
            </p>
          </section>

          {/* Contact for Data Requests */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">7. Contact for Data Requests</h2>
            <p>
              For all GDPR-related enquiries, data subject requests, or privacy concerns, please
              contact our dedicated data protection team:
            </p>
            <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-4 space-y-2 text-sm">
              <div className="flex items-center gap-3">
                <span className="text-gray-400 w-32 shrink-0">GDPR requests:</span>
                <a href="mailto:gdpr@vexcraft.io" className="text-purple-400 hover:text-purple-300">
                  gdpr@vexcraft.io
                </a>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-400 w-32 shrink-0">General support:</span>
                <a href="mailto:support@vexcraft.io" className="text-purple-400 hover:text-purple-300">
                  support@vexcraft.io
                </a>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-400 w-32 shrink-0">Response time:</span>
                <span>Within 30 days</span>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
