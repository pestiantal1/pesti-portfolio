"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();

  // Show back arrow on projects page only
  if (pathname === "/projects") {
    return (
      <nav className="mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
        </div>
      </nav>
    );
  }

  // Hide navigation on all other pages (including homepage and individual project pages)
  return null;
}