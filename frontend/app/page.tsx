import Link from "next/link";
import { getProducts } from "@/lib/api";
import type { Product } from "@/types/product";
import ProductCard from "@/components/products/ProductCard";

export default async function Home() {
  let products: Product[] = [];
  let errorMessage = "";

  try {
    products = await getProducts();
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to load products";
  }

  const featuredProducts = products.slice(0, 3);

  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="border-b border-neutral-200">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link
            href="/"
            className="text-xl font-semibold tracking-tight"
          >
            STORE
          </Link>

          <nav className="hidden items-center gap-8 text-sm md:flex">
            <Link
              href="/products"
              className="text-neutral-600 transition-colors hover:text-black"
            >
              Products
            </Link>

            <Link
              href="#about"
              className="text-neutral-600 transition-colors hover:text-black"
            >
              About
            </Link>
          </nav>

          <div className="flex items-center gap-5 text-sm">
            <Link
              href="/login"
              className="hidden text-neutral-600 transition-colors hover:text-black sm:block"
            >
              Login
            </Link>

            <Link
              href="/cart"
              className="font-medium transition-colors hover:text-neutral-600"
            >
              Cart (0)
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-neutral-200">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-2 lg:px-8 lg:py-32">
          <div className="flex flex-col justify-center">
            <p className="mb-5 text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
              New collection
            </p>

            <h1 className="max-w-2xl text-5xl font-semibold tracking-tight text-neutral-950 sm:text-6xl lg:text-7xl">
              Everything you need.
              <br />
              Nothing you don&apos;t.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-neutral-600">
              Discover products selected for quality, functionality, and
              everyday life.
            </p>

            <div className="mt-8">
              <Link
                href="/products"
                className="inline-flex h-12 items-center justify-center rounded-full bg-black px-7 text-sm font-medium text-white transition-transform hover:scale-[1.02]"
              >
                Shop products
              </Link>
            </div>
          </div>

          <div className="flex min-h-[400px] items-center justify-center rounded-2xl bg-neutral-100">
            <span className="text-sm text-neutral-400">
              Featured collection
            </span>
          </div>
        </div>
      </section>

      {/* Products */}
      <section
        id="products"
        className="mx-auto max-w-7xl px-6 py-20 lg:px-8"
      >
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
              Shop
            </p>

            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              Featured products
            </h2>
          </div>

          <Link
            href="/products"
            className="hidden text-sm font-medium underline underline-offset-4 sm:block"
          >
            View all
          </Link>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-dashed border-neutral-300 py-20 text-center">
            <p className="text-neutral-500">
              {errorMessage || "No products available right now."}
            </p>
          </div>
        )}
      </section>

      {/* About */}
      <section
        id="about"
        className="border-t border-neutral-200 bg-neutral-50"
      >
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
              About
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              Built around a simple shopping experience.
            </h2>

            <p className="mt-5 text-lg leading-8 text-neutral-600">
              A full-stack ecommerce platform designed with a clean interface,
              reliable backend, and straightforward checkout experience.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-neutral-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>© 2026 Store. All rights reserved.</p>
          <p>Built with Next.js</p>
        </div>
      </footer>
    </main>
  );
}