import { createMetadata } from "@/lib/metadata";
export const metadata = createMetadata({ title: "Portfolio", description: "See examples of our work — Discord servers, websites, streaming overlays, YouTube branding and more.", path: "/portfolio" });
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
