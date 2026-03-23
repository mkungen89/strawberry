"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { SERVICES } from "@/lib/services-data";
import { useCurrency } from "@/lib/currency-context";

export default function ServicesPage() {
  const { format } = useCurrency();

  return (
    <div className="bg-black text-white">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold sm:text-5xl">Our Services</h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-400">
            Choose a service below and we&apos;ll guide you through every step. No technical knowledge needed.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => (
            <Card
              key={service.slug}
              className="group relative border-white/10 bg-white/5 text-white transition-all hover:border-purple-500/50"
            >
              {service.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-purple-600 text-white">Popular</Badge>
                </div>
              )}
              <CardHeader>
                <div className="mb-3 text-5xl">{service.icon}</div>
                <h2 className="text-2xl font-bold">{service.name}</h2>
                <p className="text-sm text-gray-400">{service.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="mb-6 space-y-2">
                  {service.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                      <span className="text-purple-400">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="space-y-2">
                  {service.packages.map((pkg) => (
                    <div
                      key={pkg.name}
                      className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                    >
                      <span className="text-sm font-medium">{pkg.name}</span>
                      <span className="text-sm font-bold text-purple-400">{format(pkg.price, pkg.priceGBP, pkg.priceEUR)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/services/${service.slug}`} className="w-full">
                  <Button className="w-full bg-purple-600 text-white hover:bg-purple-700">
                    Get started
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
