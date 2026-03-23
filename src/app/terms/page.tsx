import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function TermsPage() {
  return (
    <div className="bg-black text-white">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white">Terms of Service</h1>
          <p className="mt-2 text-sm text-gray-500">Last updated: March 2026</p>
        </div>

        <div className="space-y-10 text-gray-300 leading-relaxed">
          {/* Acceptance of Terms */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the Vexcraft website (vexcraft.io) and any services offered
              thereon (collectively, the &quot;Services&quot;), you agree to be bound by these Terms of
              Service (&quot;Terms&quot;). If you do not agree to these Terms, please do not access or use
              our Services.
            </p>
            <p className="mt-3">
              These Terms apply to all visitors, users, and others who access or use the Services.
              You must be at least 16 years of age to use our Services. By using our Services, you
              represent and warrant that you meet this age requirement.
            </p>
          </section>

          {/* Services */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">2. Services</h2>
            <p>
              Vexcraft provides professional digital services including, but not limited to, Discord
              server setup and design, website development, streaming overlays, mobile application
              development, and related digital creative work.
            </p>
            <p className="mt-3">
              All services are delivered as described in the relevant service listing at the time of
              purchase. We reserve the right to modify, suspend, or discontinue any service at any
              time without prior notice. Service specifications, pricing, and delivery timelines are
              subject to change.
            </p>
            <p className="mt-3">
              Delivery timelines are estimates and may vary depending on project complexity,
              communication, and client response times. Vexcraft is not liable for delays caused by
              incomplete or delayed client input.
            </p>
          </section>

          {/* Payment & Refunds */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">3. Payment &amp; Refunds</h2>
            <p>
              Payment for services is processed securely through Stripe. By completing a purchase,
              you authorise Vexcraft to charge the applicable fees to your selected payment method.
              All prices are displayed in the currency indicated at checkout and are inclusive of
              applicable taxes where required by law.
            </p>
            <p className="mt-3 font-medium text-white">Refund Policy:</p>
            <ul className="mt-2 space-y-2 list-none">
              {[
                "Refunds may be requested before work has commenced on your order.",
                "Once production has begun, refunds are at the sole discretion of Vexcraft and may be issued as partial refunds proportional to the work remaining.",
                "Completed and delivered work is non-refundable unless it materially fails to meet the agreed specifications.",
                "Disputes must be raised within 14 days of delivery.",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-0.5 text-purple-400 shrink-0">&#8226;</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3">
              To request a refund, contact us at{" "}
              <a href="mailto:support@vexcraft.io" className="text-purple-400 hover:text-purple-300">
                support@vexcraft.io
              </a>
              .
            </p>
          </section>

          {/* Right of Withdrawal */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">3b. Right of Withdrawal (EU/EEA Customers)</h2>
            <p>
              If you are a consumer located in the EU or EEA, you have the right to withdraw from a
              distance contract within 14 days of purchase without giving any reason, in accordance
              with the EU Consumer Rights Directive (2011/83/EU).
            </p>
            <p className="mt-3">
              To exercise your right of withdrawal, you must inform us of your decision by a clear
              statement (e.g. an email to{" "}
              <a href="mailto:support@vexcraft.io" className="text-purple-400 hover:text-purple-300">
                support@vexcraft.io
              </a>
              ) before the 14-day period expires.
            </p>
            <p className="mt-3 font-medium text-white">Important exceptions:</p>
            <ul className="mt-2 space-y-2 list-none">
              {[
                "If you have given explicit prior consent for work to begin within the withdrawal period, and you acknowledge that you will lose your right of withdrawal once the service has been fully performed, the right of withdrawal ceases upon full performance.",
                "For digital content delivered without a physical medium, the right of withdrawal ceases once delivery has begun, provided you gave prior express consent and acknowledged the loss of your right of withdrawal.",
                "Custom-made or clearly personalised goods and services are exempt from the right of withdrawal.",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-0.5 text-purple-400 shrink-0">&#8226;</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3">
              If you withdraw before work has started, you will receive a full refund within 14
              days. If work has partially commenced with your consent, we may deduct a proportionate
              amount for the services already provided.
            </p>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">4. Intellectual Property</h2>
            <p>
              Upon full payment for a service, Vexcraft transfers to you a non-exclusive licence to
              use the delivered work for the purpose for which it was commissioned. Unless otherwise
              agreed in writing, Vexcraft retains the right to display completed work in our
              portfolio.
            </p>
            <p className="mt-3">
              All intellectual property rights in the Vexcraft website, brand, logo, and any
              original materials not specifically commissioned by you remain the exclusive property
              of Vexcraft. You may not reproduce, distribute, or create derivative works from our
              materials without express written permission.
            </p>
            <p className="mt-3">
              You represent and warrant that any materials, assets, or content you provide to us for
              use in your project do not infringe any third-party intellectual property rights. You
              assume full liability for any claims arising from materials you supply.
            </p>
          </section>

          {/* User Responsibilities */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">5. User Responsibilities</h2>
            <p>By using our Services, you agree to:</p>
            <ul className="mt-3 space-y-2 list-none">
              {[
                "Provide accurate, complete, and current information when registering an account or placing an order.",
                "Maintain the security of your account credentials and notify us immediately of any unauthorised access.",
                "Not use the Services for any unlawful purpose or in violation of any applicable laws or regulations.",
                "Not attempt to interfere with, disrupt, or gain unauthorised access to any part of our platform.",
                "Not use the Services to create content that is illegal, harmful, threatening, abusive, defamatory, or otherwise objectionable.",
                "Respond promptly to reasonable requests for information or feedback during project delivery.",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-0.5 text-purple-400 shrink-0">&#8226;</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3">
              Violation of these responsibilities may result in immediate termination of your account
              and access to Services without refund.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">6. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, Vexcraft and its operators shall
              not be liable for any indirect, incidental, special, consequential, or punitive
              damages, including but not limited to loss of profits, data, or goodwill, arising out
              of or in connection with your use of the Services.
            </p>
            <p className="mt-3">
              In no event shall our total liability to you for any claims arising under these Terms
              exceed the amount you paid to Vexcraft in the twelve (12) months preceding the event
              giving rise to the claim.
            </p>
            <p className="mt-3">
              The Services are provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties
              of any kind, either express or implied, including but not limited to implied warranties
              of merchantability, fitness for a particular purpose, or non-infringement.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">7. Changes to Terms</h2>
            <p>
              We reserve the right to update or modify these Terms at any time at our sole
              discretion. When we make changes, we will update the &quot;Last updated&quot; date at the top of
              this page. We may also notify you via email or a notice on our website.
            </p>
            <p className="mt-3">
              Your continued use of the Services after any changes become effective constitutes your
              acceptance of the revised Terms. If you do not agree to the updated Terms, you must
              stop using the Services.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">8. Contact</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-4 space-y-1 text-sm">
              <p>
                <span className="text-gray-400">Email:</span>{" "}
                <a href="mailto:support@vexcraft.io" className="text-purple-400 hover:text-purple-300">
                  support@vexcraft.io
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
