import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import OrderForm from "@/components/order/OrderForm";
import { SERVICES } from "@/lib/services-data";
import { Badge } from "@/components/ui/badge";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = SERVICES.find((s) => s.slug === slug);

  if (!service) notFound();

  return (
    <div className="bg-black text-white">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Left: Service info */}
          <div>
            <div className="mb-4 text-6xl">{service.icon}</div>
            {service.popular && (
              <Badge className="mb-3 bg-purple-600 text-white">Popular</Badge>
            )}
            <h1 className="mb-4 text-4xl font-bold">{service.name}</h1>
            <p className="mb-8 text-lg text-gray-400">{service.description}</p>

            {/* Features */}
            <div className="mb-8">
              <h2 className="mb-4 text-xl font-semibold">What&apos;s included</h2>
              <ul className="space-y-3">
                {service.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-gray-300">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-600/20 text-purple-400 text-sm">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Packages */}
            <div>
              <h2 className="mb-4 text-xl font-semibold">Packages</h2>
              <div className="space-y-3">
                {service.packages.map((pkg) => (
                  <div
                    key={pkg.name}
                    className="rounded-xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-semibold">{pkg.name}</span>
                      <span className="text-lg font-bold text-purple-400">{pkg.price} kr</span>
                    </div>
                    <ul className="space-y-1">
                      {pkg.features.map((f) => (
                        <li key={f} className="text-sm text-gray-400">• {f}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Order form */}
          <div>
            <OrderForm service={service} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
