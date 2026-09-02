"use client";

import Link from "next/link";
import { useCart } from "@/components/providers/CartProvider";

export default function Navbar() {
  const { itemCount } = useCart();

  return (
    <header className="border-b border-neutral-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight"
        >
          STORE
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link
            href="/products"
            className="text-neutral-600 transition hover:text-black"
          >
            Products
          </Link>

          <Link
            href="/cart"
            className="text-neutral-600 transition hover:text-black"
          >
            Cart ({itemCount})
          </Link>
        </nav>
      </div>
    </header>
  );
}