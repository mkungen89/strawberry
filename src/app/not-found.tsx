import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Home, Layers } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <Navbar />
      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <p className="mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-8xl font-extrabold text-transparent sm:text-9xl">
          404
        </p>
        <h1 className="mb-3 text-2xl font-bold sm:text-3xl">Page not found</h1>
        <p className="mb-8 max-w-sm text-gray-400">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/">
            <Button className="bg-purple-600 text-white hover:bg-purple-700 min-w-36">
              <Home className="mr-2 h-4 w-4" />
              Go home
            </Button>
          </Link>
          <Link href="/services">
            <Button
              variant="outline"
              className="border-white/20 bg-transparent text-white hover:bg-white/10 min-w-36"
            >
              <Layers className="mr-2 h-4 w-4" />
              Browse services
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
