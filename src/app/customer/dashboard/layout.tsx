import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Community Management Dashboard",
  description: "Track your community management metrics, content calendar, and performance.",
  path: "/customer/dashboard",
  noIndex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
