import { createMetadata } from "@/lib/metadata";
export const metadata = createMetadata({ title: "About Us", description: "Learn about Vexcraft — a digital studio specialising in custom services for creators and businesses.", path: "/about" });
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
