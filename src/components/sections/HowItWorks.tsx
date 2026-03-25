import { Badge } from "@/components/ui/badge";

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Choose a service",
      description: "Browse our services and pick what you need. Not sure? We'll help you choose!",
      icon: "🎯",
      color: "from-purple-500/20 to-purple-600/10",
    },
    {
      number: "02",
      title: "Tell us what you want",
      description: "Fill in a simple form. Share your wishes, colors, style and features.",
      icon: "📝",
      color: "from-blue-500/20 to-blue-600/10",
    },
    {
      number: "03",
      title: "We review your brief",
      description: "Our team reviews your order and reaches out within 24 hours to confirm details and get started.",
      icon: "🔍",
      color: "from-cyan-500/20 to-cyan-600/10",
    },
    {
      number: "04",
      title: "Pay securely",
      description: "Pay via Stripe with card. Everything is encrypted and secure.",
      icon: "💳",
      color: "from-green-500/20 to-green-600/10",
    },
    {
      number: "05",
      title: "We build it",
      description: "Our team gets to work. Track the status live in your dashboard.",
      icon: "⚡",
      color: "from-yellow-500/20 to-yellow-600/10",
    },
    {
      number: "06",
      title: "Delivery & support",
      description: "Receive your project with revision options and ongoing support.",
      icon: "🚀",
      color: "from-pink-500/20 to-pink-600/10",
    },
  ];

  return (
    <section className="relative px-4 py-28 sm:px-6 lg:px-8">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/[0.03] to-transparent" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <Badge className="mb-4 border-purple-500/30 bg-purple-500/10 text-purple-300 px-3">
            Process
          </Badge>
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
            From idea to{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              finished product
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-400">
            Simple, transparent, and hassle-free — every step of the way.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:border-purple-500/20 hover:bg-white/[0.04]"
            >
              {/* Step connector line (desktop) */}
              {i < steps.length - 1 && i !== 2 && (
                <div className="absolute -right-2 top-1/2 hidden h-px w-4 bg-gradient-to-r from-white/10 to-transparent lg:block" />
              )}

              <div className="mb-5 flex items-center justify-between">
                <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${step.color} text-2xl border border-white/[0.05]`}>
                  {step.icon}
                </div>
                <span className="text-4xl font-black text-white/[0.04] group-hover:text-white/[0.08] transition-colors select-none">
                  {step.number}
                </span>
              </div>

              <h3 className="mb-2 text-lg font-semibold text-white">{step.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
