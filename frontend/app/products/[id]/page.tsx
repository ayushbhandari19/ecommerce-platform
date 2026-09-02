import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/api";
import AddToCartButton from "@/components/products/AddToCartButton";
const localImages: Record<string, string> = {
    "nike-air-max": "/products/nike-air-max.jpg",
    "sony-wh-1000xm5": "/products/sony-wh-1000xm5.avif",
    "wireless-headphones": "/products/wireless-headphones.jpg",
};
import Navbar from "@/components/layout/Navbar";
type ProductPageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function ProductPage({
    params,
}: ProductPageProps) {
    const { id } = await params;

    let product;

    try {
        product = await getProduct(id);
    } catch {
        notFound();
    }

    const imageUrl = localImages[product.slug];

    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-20">
                <Link
                    href="/products"
                    className="text-sm text-neutral-500 hover:text-black"
                >
                    ← Back to products
                </Link>

                <div className="mt-10 grid gap-12 lg:grid-cols-2 lg:gap-20">
                    <div className="relative aspect-square overflow-hidden rounded-3xl bg-neutral-100">
                        {imageUrl ? (
                            <Image
                                src={imageUrl}
                                alt={product.name}
                                fill
                                priority
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                className="object-cover"
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center">
                                <span className="text-sm text-neutral-400">
                                    No image available
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col justify-center">
                        {product.category && (
                            <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
                                {product.category.name}
                            </p>
                        )}

                        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                            {product.name}
                        </h1>

                        <p className="mt-6 text-2xl font-medium">
                            ₹{Number(product.price).toLocaleString("en-IN")}
                        </p>

                        <p className="mt-8 max-w-xl leading-7 text-neutral-600">
                            {product.description}
                        </p>

                        <div className="mt-8">
                            {product.stock > 0 ? (
                                <p className="text-sm text-neutral-600">
                                    {product.stock} in stock
                                </p>
                            ) : (
                                <p className="text-sm font-medium text-red-600">
                                    Out of stock
                                </p>
                            )}
                        </div>

                        <AddToCartButton
                            productId={product.id}
                            disabled={product.stock === 0}
                        />
                    </div>
                </div>
            </section>
        </main>
    );
}