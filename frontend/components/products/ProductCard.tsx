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
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-sm text-neutral-400">
                No image available
              </span>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            {product.category && (
              <p className="text-sm text-neutral-500">
                {product.category.name}
              </p>
            )}

            <h3 className="mt-1 font-medium">{product.name}</h3>
          </div>

          <p className="font-medium">
            ₹{Number(product.price).toLocaleString("en-IN")}
          </p>
        </div>

        <p
          className={`mt-2 text-sm ${
            product.stock > 0 ? "text-neutral-500" : "text-red-600"
          }`}
        >
          {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
        </p>
      </article>
    </Link>
  );
}