import { createMetadata } from "@/lib/metadata";
export const metadata = createMetadata({ title: "Privacy Policy", description: "Learn how Vexcraft collects, uses and protects your personal information.", path: "/privacy" });
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function PrivacyPage() {
  return (
    <div className="bg-black text-white">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white">Privacy Policy</h1>
          <p className="mt-2 text-sm text-gray-500">Last updated: March 2026</p>
        </div>

        <div className="space-y-10 text-gray-300 leading-relaxed">
          {/* Introduction */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">1. Introduction</h2>
            <p>
              Welcome to Vexcraft (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). We are committed to protecting your
              personal information and your right to privacy. This Privacy Policy explains how we
              collect, use, disclose, and safeguard your information when you visit our website
              vexcraft.io and use our services.
            </p>
            <p className="mt-3">
              Please read this policy carefully. If you disagree with its terms, please discontinue
              use of the site. We reserve the right to make changes to this policy at any time. We
              will alert you about any changes by updating the &quot;Last updated&quot; date of this policy.
            </p>
          </section>

          {/* Data We Collect */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">2. Data We Collect</h2>
            <p>We may collect information about you in a variety of ways, including:</p>
            <ul className="mt-3 space-y-2 list-none">
              {[
                {
                  title: "Personal Data",
                  desc: "When you register an account or place an order, we collect personally identifiable information such as your name, email address, and billing information.",
                },
                {
                  title: "Usage Data",
                  desc: "We automatically collect certain information when you visit our website, including your IP address, browser type, operating system, referring URLs, and pages viewed.",
                },
                {
                  title: "Order Data",
                  desc: "When you purchase services, we collect information related to the transaction, including service details, project requirements, and communication records.",
                },
                {
                  title: "Communications",
                  desc: "If you contact us directly, we may retain the content of your messages together with your contact information and our responses.",
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

          {/* How We Use Your Data */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">3. How We Use Your Data</h2>
            <p>We use the information we collect to:</p>
            <ul className="mt-3 space-y-2 list-none">
              {[
                "Create and manage your account and process orders.",
                "Deliver purchased services and communicate project updates.",
                "Process payments and send transaction confirmations.",
                "Respond to inquiries and provide customer support.",
                "Send administrative information such as policy updates.",
                "Monitor and analyse usage to improve our website and services.",
                "Detect and prevent fraudulent transactions and other illegal activities.",
                "Comply with legal obligations.",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-0.5 text-purple-400 shrink-0">&#8226;</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Data Storage & Security */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">4. Data Storage &amp; Security</h2>
            <p>
              We implement industry-standard administrative, technical, and physical security
              measures designed to protect your personal information from unauthorised access,
              disclosure, alteration, and destruction. Your data is stored on secure servers and
              access is restricted to authorised personnel only.
            </p>
            <p className="mt-3">
              Although we take reasonable steps to secure your information, no electronic
              transmission over the internet or information storage technology can be guaranteed to
              be 100% secure. You transmit information to us at your own risk.
            </p>
            <p className="mt-3">
              We retain your personal data only for as long as necessary to fulfil the purposes
              outlined in this policy, unless a longer retention period is required or permitted by
              law.
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">5. Cookies</h2>
            <p>
              We use cookies and similar tracking technologies to improve your experience on our
              website. Cookies are small data files placed on your device that help us remember your
              preferences and understand how you use our site.
            </p>
            <p className="mt-3">We use the following types of cookies:</p>
            <ul className="mt-3 space-y-2 list-none">
              {[
                {
                  title: "Essential Cookies",
                  desc: "Required for the website to function properly, including session management and authentication.",
                },
                {
                  title: "Analytics Cookies",
                  desc: "Help us understand how visitors interact with the site so we can improve functionality and user experience.",
                },
                {
                  title: "Preference Cookies",
                  desc: "Remember your settings and preferences to personalise your experience.",
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
            <p className="mt-3">
              You can instruct your browser to refuse all cookies or to indicate when a cookie is
              being sent. However, if you do not accept cookies, some parts of our website may not
              function properly.
            </p>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">6. Third-Party Services</h2>
            <p>
              We may share your information with third-party service providers who assist us in
              operating our website and delivering services:
            </p>
            <ul className="mt-3 space-y-4 list-none">
              <li className="rounded-lg border border-white/10 bg-white/5 p-4">
                <p className="font-medium text-white">Stripe</p>
                <p className="mt-1 text-sm">
                  We use Stripe to process payments. When you make a purchase, your payment
                  information is transmitted directly to Stripe and is subject to their{" "}
                  <a
                    href="https://stripe.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 underline"
                  >
                    Privacy Policy
                  </a>
                  . We do not store your full card details on our servers.
                </p>
              </li>
              <li className="rounded-lg border border-white/10 bg-white/5 p-4">
                <p className="font-medium text-white">Google</p>
                <p className="mt-1 text-sm">
                  We offer Google Sign-In as an authentication option. If you choose to sign in with
                  Google, certain profile information is shared with us in accordance with{" "}
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 underline"
                  >
                    Google&apos;s Privacy Policy
                  </a>
                  .
                </p>
              </li>
            </ul>
            <p className="mt-4">
              We do not sell, trade, or otherwise transfer your personal information to third parties
              for marketing purposes.
            </p>
          </section>

          {/* Your Rights (GDPR) */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">7. Your Rights (GDPR)</h2>
            <p>
              If you are located in the European Economic Area (EEA), you have certain data
              protection rights under the General Data Protection Regulation (GDPR):
            </p>
            <ul className="mt-3 space-y-2 list-none">
              {[
                { title: "Right to Access", desc: "Request a copy of the personal data we hold about you." },
                { title: "Right to Rectification", desc: "Request correction of inaccurate or incomplete data." },
                { title: "Right to Erasure", desc: "Request deletion of your personal data under certain conditions." },
                { title: "Right to Restriction", desc: "Request that we restrict the processing of your data." },
                { title: "Right to Data Portability", desc: "Receive your data in a structured, machine-readable format." },
                { title: "Right to Object", desc: "Object to processing of your data for certain purposes, including direct marketing." },
              ].map((item) => (
                <li key={item.title} className="flex gap-3">
                  <span className="mt-0.5 text-purple-400 shrink-0">&#8226;</span>
                  <span>
                    <span className="font-medium text-white">{item.title}:</span> {item.desc}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3">
              To exercise any of these rights, please contact us at{" "}
              <a href="mailto:gdpr@vexcraft.io" className="text-purple-400 hover:text-purple-300">
                gdpr@vexcraft.io
              </a>
              . We will respond to your request within 30 days.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">8. Contact</h2>
            <p>
              If you have any questions or concerns about this Privacy Policy or our data practices,
              please contact us:
            </p>
            <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-4 space-y-1 text-sm">
              <p>
                <span className="text-gray-400">Email:</span>{" "}
                <a href="mailto:support@vexcraft.io" className="text-purple-400 hover:text-purple-300">
                  support@vexcraft.io
                </a>
              </p>
              <p>
                <span className="text-gray-400">GDPR requests:</span>{" "}
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
        </div>
      </main>
      <Footer />
    </div>
  );
}
