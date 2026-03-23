import { createMetadata } from "@/lib/metadata";
export const metadata = createMetadata({ title: "Contact", description: "Get in touch with Vexcraft. We typically reply within 24 hours. Email, Discord, or live chat.", path: "/contact" });
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
