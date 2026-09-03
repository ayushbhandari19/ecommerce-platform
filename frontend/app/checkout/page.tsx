"use client";
import RequireAuth from "@/components/auth/RequireAuth";
import Link from "next/link";
import { useCart } from "@/components/providers/CartProvider";
import { createOrder } from "@/lib/api";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";


function CheckoutContent() {
    const { cart, refreshCart } = useCart();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const total =
        cart?.items.reduce(
            (sum, item) =>
                sum + Number(item.product.price) * item.quantity,
            0
        ) ?? 0;

    if (!cart) {
        return (
            <main className="min-h-screen bg-white">
                <Navbar />

                <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
                    <div className="py-20 text-center">
                        <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-400">
                            Checkout
                        </p>

                        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                            Loading your order
                        </h1>

                        <p className="mt-3 text-neutral-500">
                            We're getting everything ready for you.
                        </p>
                    </div>
                </section>
            </main>
        );
    }

    if (cart.items.length === 0) {
        return (
            <main className="min-h-screen bg-white">
                <Navbar />

                <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
                    <div className="py-20 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
                            <span className="text-2xl">🛒</span>
                        </div>

                        <p className="mt-8 text-sm font-medium uppercase tracking-[0.2em] text-neutral-400">
                            Nothing to checkout
                        </p>

                        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                            Your cart is empty
                        </h1>

                        <p className="mx-auto mt-4 max-w-md text-neutral-600">
                            Add something to your cart before continuing to
                            checkout.
                        </p>

                        <Link
                            href="/products"
                            className="mt-8 inline-block rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
                        >
                            Browse products
                        </Link>
                    </div>
                </section>
            </main>
        );
    }
    async function handlePlaceOrder() {
        setError("");
        setIsLoading(true);

        try {
            const order = await createOrder();

            await refreshCart();

            router.push(`/payment/${order.id}`);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to place order"
            );
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-20">
                <div>
                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
                        Checkout
                    </p>

                    <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
                        Review your order
                    </h1>
                </div>

                <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_360px]">
                    <div>
                        <div className="border-b border-neutral-200 pb-4">
                            <h2 className="text-lg font-semibold">
                                Order items
                            </h2>
                        </div>

                        <div className="divide-y divide-neutral-200">
                            {cart.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between gap-6 py-6"
                                >
                                    <div>
                                        <h3 className="font-medium">
                                            {item.product.name}
                                        </h3>

                                        <p className="mt-1 text-sm text-neutral-500">
                                            Quantity: {item.quantity}
                                        </p>
                                    </div>

                                    <p className="font-medium">
                                        ₹
                                        {(
                                            Number(item.product.price) * item.quantity
                                        ).toLocaleString("en-IN")}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <aside className="h-fit rounded-2xl bg-neutral-50 p-6">
                        <h2 className="text-lg font-semibold">
                            Order summary
                        </h2>

                        <div className="mt-6 flex items-center justify-between text-sm">
                            <span className="text-neutral-500">
                                Subtotal
                            </span>

                            <span>
                                ₹{total.toLocaleString("en-IN")}
                            </span>
                        </div>

                        <div className="mt-4 flex items-center justify-between text-sm">
                            <span className="text-neutral-500">
                                Shipping
                            </span>

                            <span>Free</span>
                        </div>

                        <div className="mt-6 flex items-center justify-between border-t border-neutral-200 pt-6">
                            <span className="font-semibold">
                                Total
                            </span>

                            <span className="text-lg font-semibold">
                                ₹{total.toLocaleString("en-IN")}
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={handlePlaceOrder}
                            disabled={isLoading}
                            className="mt-6 w-full rounded-full bg-black px-6 py-3.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
                        >
                            {isLoading ? "Creating order..." : "Continue to payment"}
                        </button>

                        {error && (
                            <p
                                role="alert"
                                className="mt-3 text-sm text-red-600"
                            >
                                {error}
                            </p>
                        )}

                        <Link
                            href="/cart"
                            className="mt-4 block text-center text-sm text-neutral-500 hover:text-black"
                        >
                            Back to cart
                        </Link>
                    </aside>
                </div>
            </section>
        </main>
    );
}
export default function CheckoutPage() {
    return (
        <RequireAuth>
            <CheckoutContent />
        </RequireAuth>
    );
}