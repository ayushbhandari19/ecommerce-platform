import Link from "next/link";
import { getProducts } from "@/lib/api";
import type { Product } from "@/types/product";
import ProductCard from "@/components/products/ProductCard";
import Navbar from "@/components/layout/Navbar";
import Image from "next/image";
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

  const featuredSlugs = [
    "nike-air-max",
    "sony-wh-1000xm5",
    "wireless-headphones",
  ];

  const featuredProducts = featuredSlugs
    .map((slug) => products.find((product) => product.slug === slug))
    .filter((product): product is Product => Boolean(product));

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="border-b border-neutral-200">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-2 lg:px-8 lg:py-32">
          <div className="flex flex-col justify-center">
            <p className="mb-5 text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
              Curated for everyday
            </p>

            <h1 className="max-w-2xl text-5xl font-semibold tracking-tight text-neutral-950 sm:text-6xl lg:text-7xl">
              Products worth
              <br />
              making room for.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-neutral-600">
              A carefully selected collection of products built around quality,
              function, and everyday use.
            </p>

            <div className="mt-8">
              <Link
                href="/products"
                className="inline-flex h-12 items-center justify-center rounded-full bg-black px-7 text-sm font-medium text-white transition-transform hover:scale-[1.02]"
              >
                Explore products
              </Link>
            </div>
          </div>

          <div className="relative min-h-[400px] overflow-hidden rounded-2xl bg-neutral-100 sm:min-h-[500px]">
            <Image
              src="/products/nike-air-max.jpg"
              alt="Nike Air Max"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-6">
              <p className="text-sm font-medium text-white">
                Featured
              </p>

              <p className="mt-1 text-lg font-semibold text-white">
                Nike Air Max
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      {/* Categories */}
      <section className="border-t border-neutral-200">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
              Explore
            </p>

            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              Shop by category
            </h2>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <Link
              href="/products?category=electronics"
              className="group rounded-2xl border border-neutral-200 p-8 transition-colors hover:border-neutral-400"
            >
              <p className="text-sm text-neutral-500">
                Electronics
              </p>

              <h3 className="mt-3 text-2xl font-semibold tracking-tight">
                Audio, tech & everyday gear
              </h3>

              <p className="mt-4 text-sm text-neutral-500">
                Discover practical technology designed for everyday use.
              </p>

              <span className="mt-8 inline-block text-sm font-medium underline underline-offset-4 transition-transform group-hover:translate-x-1">
                Explore category →
              </span>
            </Link>

            <Link
              href="/products?category=running-shoes"
              className="group rounded-2xl border border-neutral-200 p-8 transition-colors hover:border-neutral-400"
            >
              <p className="text-sm text-neutral-500">
                Running Shoes
              </p>

              <h3 className="mt-3 text-2xl font-semibold tracking-tight">
                Built to move
              </h3>

              <p className="mt-4 text-sm text-neutral-500">
                Find footwear made for training, movement, and everyday runs.
              </p>

              <span className="mt-8 inline-block text-sm font-medium underline underline-offset-4 transition-transform group-hover:translate-x-1">
                Explore category →
              </span>
            </Link>
          </div>
        </div>
      </section>Ï

      {/* About */}
      {/* Why Store */}
      <section
        id="about"
        className="border-t border-neutral-200"
      >
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
              Why Store
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              Simple by design.
            </h2>

            <p className="mt-5 text-lg leading-8 text-neutral-600">
              Everything about the shopping experience is designed to stay
              straightforward, from discovering products to completing an order.
            </p>
          </div>

          <div className="mt-12 grid gap-8 border-t border-neutral-200 pt-10 sm:grid-cols-3">
            <div>
              <h3 className="font-semibold">
                Quality first
              </h3>

              <p className="mt-3 text-sm leading-6 text-neutral-500">
                Carefully selected products with a focus on quality and everyday
                usefulness.
              </p>
            </div>

            <div>
              <h3 className="font-semibold">
                Simple shopping
              </h3>

              <p className="mt-3 text-sm leading-6 text-neutral-500">
                Clear products, transparent pricing, and a straightforward checkout
                experience.
              </p>
            </div>

            <div>
              <h3 className="font-semibold">
                Built to work
              </h3>

              <p className="mt-3 text-sm leading-6 text-neutral-500">
                A reliable full-stack architecture connecting the storefront,
                backend, database, and payments.
              </p>
            </div>
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