
"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/providers/CartProvider";
import Navbar from "@/components/layout/Navbar";

const localImages: Record<string, string> = {
  "nike-air-max": "/products/nike-air-max.jpg",
  "sony-wh-1000xm5": "/products/sony-wh-1000xm5.avif",
  "wireless-headphones": "/products/wireless-headphones.jpg",
};

export default function CartPage() {
  const { cart, updateItem, removeItem } = useCart();

  async function handleUpdateQuantity(
    itemId: number,
    quantity: number
  ) {
    if (quantity < 1) return;

    try {
      await updateItem(itemId, quantity);
    } catch {
      // Provider handles the cart update.
    }
  }

  async function handleRemoveItem(itemId: number) {
    try {
      await removeItem(itemId);
    } catch {
      // Provider handles the cart update.
    }
  }

  const total =
    cart?.items.reduce(
      (sum, item) =>
        sum + Number(item.product.price) * item.quantity,
      0
    ) ?? 0;

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-20">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
            Your cart
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Shopping cart
          </h1>
        </div>

        {!cart && (
          <div className="py-20 text-center">
            <p className="text-neutral-500">
              Loading your cart...
            </p>
          </div>
        )}

        {cart && cart.items.length === 0 && (
          <div className="py-20 text-center">
            <h2 className="text-2xl font-semibold tracking-tight">
              Your cart is empty
            </h2>

            <p className="mt-3 text-neutral-500">
              Add some products to get started.
            </p>

            <Link
              href="/products"
              className="mt-8 inline-block rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              Browse products
            </Link>
          </div>
        )}

        {cart && cart.items.length > 0 && (
          <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_360px]">
            <div className="space-y-6">
              {cart.items.map((item) => {
                const imageUrl = localImages[item.product.slug];

                return (
                  <article
                    key={item.id}
                    className="flex gap-5 border-b border-neutral-200 pb-6"
                  >
                    <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-neutral-100">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={item.product.name}
                          fill
                          sizes="112px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <span className="text-xs text-neutral-400">
                            No image
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm text-neutral-500">
                            {item.product.category?.name}
                          </p>

                          <h2 className="mt-1 font-medium">
                            {item.product.name}
                          </h2>
                        </div>

                        <p className="shrink-0 font-medium">
                          ₹
                          {Number(
                            item.product.price
                          ).toLocaleString("en-IN")}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateQuantity(
                                item.id,
                                item.quantity - 1
                              )
                            }
                            disabled={item.quantity <= 1}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 text-lg hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            −
                          </button>

                          <span className="min-w-6 text-center text-sm font-medium">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateQuantity(
                                item.id,
                                item.quantity + 1
                              )
                            }
                            disabled={
                              item.quantity >= item.product.stock
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 text-lg hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveItem(item.id)
                          }
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <aside className="h-fit rounded-2xl bg-neutral-50 p-6">
              <h2 className="text-lg font-semibold">
                Order summary
              </h2>

              <div className="mt-6 flex items-center justify-between border-b border-neutral-200 pb-4 text-sm">
                <span className="text-neutral-500">
                  Subtotal
                </span>

                <span className="font-medium">
                  ₹{total.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-neutral-500">
                  Shipping
                </span>

                <span className="font-medium">Free</span>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-neutral-200 pt-6">
                <span className="font-semibold">Total</span>

                <span className="text-lg font-semibold">
                  ₹{total.toLocaleString("en-IN")}
                </span>
              </div>

              <button
                type="button"
                className="mt-6 w-full rounded-full bg-black px-6 py-3.5 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                Checkout
              </button>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}

