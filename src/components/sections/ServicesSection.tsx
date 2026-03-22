"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { SERVICES } from "@/lib/services-data";
import { useCurrency } from "@/lib/currency-context";

export default function ServicesSection() {
  const { format } = useCurrency();

  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Our services</h2>
          <p className="mx-auto max-w-2xl text-gray-400">
            Everything you need for your digital presence — in one place.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => (
            <Card
              key={service.slug}
              className="group relative border-white/10 bg-white/5 text-white transition-all hover:border-purple-500/50 hover:bg-white/8"
            >
              {service.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-purple-600 text-white">Popular</Badge>
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="mb-3 text-4xl">{service.icon}</div>
                <h3 className="text-xl font-semibold">{service.name}</h3>
                <p className="text-sm text-gray-400">{service.description}</p>
              </CardHeader>
              <CardContent className="pb-4">
                <ul className="space-y-1">
                  {service.features.slice(0, 4).map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-400">
                      <span className="text-purple-400">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-sm text-gray-500">
                  From <span className="text-lg font-bold text-white">{format(service.basePrice, service.basePriceGBP)}</span>
                </p>
              </CardContent>
              <CardFooter>
                <Link href={`/services/${service.slug}`} className="w-full">
                  <Button
                    className="w-full border-white/20 bg-transparent text-white hover:bg-purple-600 hover:border-purple-600"
                    variant="outline"
                  >
                    Order now
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
