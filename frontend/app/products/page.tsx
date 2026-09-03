import ProductCard from "@/components/products/ProductCard";
import { getProducts } from "@/lib/api";
import Navbar from "@/components/layout/Navbar";
import ProductSort from "@/components/products/ProductSort";
type ProductsPageProps = {
    searchParams: Promise<{
        category?: string;
        sort?: string;
    }>;
};

export default async function ProductsPage({
    searchParams,
}: ProductsPageProps) {
    const products = await getProducts();
    const { category, sort } = await searchParams;

    const filteredProducts = category
        ? products.filter(
            (product) => product.category?.slug === category
        )
        : products;
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (sort) {
            case "price-asc":
                return Number(a.price) - Number(b.price);

            case "price-desc":
                return Number(b.price) - Number(a.price);

            case "name-asc":
                return a.name.localeCompare(b.name);

            default:
                return 0;
        }
    });

    const categoryName =
        filteredProducts[0]?.category?.name ?? "All products";

    return (
        <main className="min-h-screen bg-white">
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
                                {category ? categoryName : "All products"}
                            </h1>

                            <p className="mt-4 text-neutral-600">
                                {category
                                    ? `Explore our ${categoryName.toLowerCase()} collection.`
                                    : "Explore our complete collection."}
                            </p>
                        </div>

                        <p className="text-sm text-neutral-500">
                            {filteredProducts.length}{" "}
                            {filteredProducts.length === 1 ? "product" : "products"}
                        </p>
                    </div>
                </div>
            </section>
            {/* Category navigation */}
            <section className="mx-auto max-w-7xl px-6 pt-8 lg:px-8">
                <div className="flex flex-wrap gap-3">
                    <a
                        href="/products"
                        className={`rounded-full border px-4 py-2 text-sm transition ${!category
                            ? "border-black bg-black text-white"
                            : "border-neutral-200 text-neutral-600 hover:border-neutral-400 hover:text-black"
                            }`}
                    >
                        All products
                    </a>

                    <a
                        href="/products?category=electronics"
                        className={`rounded-full border px-4 py-2 text-sm transition ${category === "electronics"
                            ? "border-black bg-black text-white"
                            : "border-neutral-200 text-neutral-600 hover:border-neutral-400 hover:text-black"
                            }`}
                    >
                        Electronics
                    </a>

                    <a
                        href="/products?category=running-shoes"
                        className={`rounded-full border px-4 py-2 text-sm transition ${category === "running-shoes"
                            ? "border-black bg-black text-white"
                            : "border-neutral-200 text-neutral-600 hover:border-neutral-400 hover:text-black"
                            }`}
                    >
                        Running Shoes
                    </a>
                    <ProductSort category={category} sort={sort} />
                </div>
            </section>

            {/* Product grid */}
            <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
                {filteredProducts.length > 0 ? (
                    <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                        {sortedProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="py-24 text-center">
                        <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-400">
                            Nothing here yet
                        </p>

                        <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                            No products found
                        </h2>

                        <p className="mx-auto mt-3 max-w-md text-neutral-600">
                            {category
                                ? "There are currently no products in this category."
                                : "There are currently no products available."}
                        </p>

                        {category && (
                            <a
                                href="/products"
                                className="mt-6 inline-block rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
                            >
                                View all products
                            </a>
                        )}
                    </div>
                )}
            </section>
        </main>
    );
}