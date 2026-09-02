import ProductCard from "@/components/products/ProductCard";
import { getProducts } from "@/lib/api";
import Navbar from "@/components/layout/Navbar";
export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <Navbar />

      {/* Page header */}
      <section className="border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
            Shop
          </p>

          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                All products
              </h1>

              <p className="mt-4 text-neutral-600">
                Explore our complete collection.
              </p>
            </div>

            <p className="text-sm text-neutral-500">
              {products.length} products
            </p>
          </div>
        </div>
      </section>

      {/* Product grid */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        {products.length > 0 ? (
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-neutral-500">
              No products available.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}