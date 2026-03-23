import { createMetadata } from "@/lib/metadata";
export const metadata = createMetadata({ title: "Dashboard", description: "Track your orders and communicate with the Vexcraft team.", path: "/dashboard", noIndex: true });
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
