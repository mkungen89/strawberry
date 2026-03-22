export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Choose a service",
      description: "Browse our services and pick what you need. Not sure? We'll help you choose!",
      icon: "🎯",
    },
    {
      number: "02",
      title: "Tell us what you want",
      description: "Fill in a simple form. Share your wishes, colors, style and features.",
      icon: "📝",
    },
    {
      number: "03",
      title: "Get a recommendation",
      description: "Our AI analyzes your needs and recommends the best tech stack and hosting for you.",
      icon: "🤖",
    },
    {
      number: "04",
      title: "Pay securely",
      description: "Pay via Stripe with card or other methods. Everything is encrypted and secure.",
      icon: "💳",
    },
    {
      number: "05",
      title: "We build it",
      description: "Our team gets to work right away. You can track the status in your dashboard.",
      icon: "⚡",
    },
    {
      number: "06",
      title: "Delivery & support",
      description: "Receive your project with revision options and ongoing support.",
      icon: "🚀",
    },
  ];

  return (
    <section className="bg-white/2 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">How it works</h2>
          <p className="mx-auto max-w-2xl text-gray-400">
            From idea to finished product — simple and transparent.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="rounded-xl border border-white/10 bg-white/5 p-6 transition-all hover:border-purple-500/30"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="text-3xl font-extrabold text-white/10">{step.number}</span>
                <span className="text-2xl">{step.icon}</span>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">{step.title}</h3>
              <p className="text-sm text-gray-400">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
