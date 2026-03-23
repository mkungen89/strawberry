import { createMetadata } from "@/lib/metadata";
export const metadata = createMetadata({ title: "Pricing", description: "Simple, transparent pricing for all our services. No hidden fees. One-time payments with packages to fit every budget.", path: "/pricing" });
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
