import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/product";

type ProductCardProps = {
  product: Product;
};

const localImages: Record<string, string> = {
  "nike-air-max": "/products/nike-air-max.jpg",
  "sony-wh-1000xm5": "/products/sony-wh-1000xm5.avif",
  "wireless-headphones": "/products/wireless-headphones.jpg",
};

export default function ProductCard({ product }: ProductCardProps) {
  const imageUrl = localImages[product.slug];

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <article>
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-neutral-100">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-sm text-neutral-400">
                No image available
              </span>
            </div>
          )}

          {product.stock === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="rounded-full bg-white px-4 py-2 text-sm font-medium">
                Out of stock
              </span>
            </div>
          )}
        </div>

        <div className="mt-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              {product.category && (
                <p className="text-xs font-medium uppercase tracking-[0.15em] text-neutral-400">
                  {product.category.name}
                </p>
              )}

              <h3 className="mt-2 truncate font-medium transition-colors group-hover:text-neutral-600">
                {product.name}
              </h3>
            </div>

            <p className="shrink-0 font-medium">
              ₹{Number(product.price).toLocaleString("en-IN")}
            </p>
          </div>

          {product.stock > 0 && product.stock <= 5 && (
            <p className="mt-2 text-sm text-amber-600">
              Only {product.stock} left
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}