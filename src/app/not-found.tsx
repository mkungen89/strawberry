import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="max-w-md text-center">
        <div className="mb-6">
          <span className="text-8xl font-black text-white/[0.05]">404</span>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-white">Page not found</h1>
        <p className="mb-8 text-gray-400">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/">
            <Button className="bg-purple-600 text-white hover:bg-purple-700 w-full">
              <Home className="mr-2 h-4 w-4" />
              Go home
            </Button>
          </Link>
          <Link href="/services">
            <Button variant="ghost" className="border border-white/20 bg-transparent text-white hover:bg-white/10 w-full">
              <Search className="mr-2 h-4 w-4" />
              Browse services
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
