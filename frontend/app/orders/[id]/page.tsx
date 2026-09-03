"use client";
import RequireAuth from "@/components/auth/RequireAuth";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import { getOrder, type Order } from "@/lib/api";

function OrderContent() {
    const params = useParams<{ id: string }>();

    const [order, setOrder] = useState<Order | null>(null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadOrder() {
            try {
                const result = await getOrder(params.id);
                setOrder(result);
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : "Failed to load order"
                );
            } finally {
                setIsLoading(false);
            }
        }

        loadOrder();
    }, [params.id]);

    if (isLoading) {
        return (
            <main className="min-h-screen bg-white">
                <Navbar />

                <div className="mx-auto max-w-7xl px-6 py-20 text-center lg:px-8">
                    <p className="text-neutral-500">Loading your order...</p>
                </div>
            </main>
        );
    }

    if (error || !order) {
        return (
            <main className="min-h-screen bg-white">
                <Navbar />

                <section className="mx-auto max-w-7xl px-6 py-20 text-center lg:px-8">
                    <h1 className="text-3xl font-semibold tracking-tight">
                        Order not found
                    </h1>

                    <p className="mt-3 text-neutral-500">
                        {error || "We couldn't find this order."}
                    </p>

                    <Link
                        href="/products"
                        className="mt-8 inline-block rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
                    >
                        Continue shopping
                    </Link>
                </section>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            <section className="mx-auto max-w-5xl px-6 py-12 lg:px-8 lg:py-20">
                <div>
                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
                        Order confirmed
                    </p>

                    <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
                        Thank you for your order
                    </h1>

                    <p className="mt-4 text-neutral-500">
                        Order #{order.id}
                    </p>
                </div>

                <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_320px]">
                    <div>
                        <div className="border-b border-neutral-200 pb-4">
                            <h2 className="text-lg font-semibold">
                                Items
                            </h2>
                        </div>

                        <div className="divide-y divide-neutral-200">
                            {order.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between gap-6 py-6"
                                >
                                    <div>
                                        <h3 className="font-medium">
                                            {item.product.name}
                                        </h3>

                                        <p className="mt-1 text-sm text-neutral-500">
                                            ₹
                                            {Number(item.price).toLocaleString("en-IN")}{" "}
                                            × {item.quantity}
                                        </p>
                                    </div>

                                    <p className="font-medium">
                                        ₹
                                        {(
                                            Number(item.price) * item.quantity
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
                                Status
                            </span>

                            <span
                                className={`rounded-full px-3 py-1 text-xs font-medium ${order.status === "CONFIRMED"
                                        ? "bg-green-100 text-green-700"
                                        : order.status === "SHIPPED"
                                            ? "bg-blue-100 text-blue-700"
                                            : order.status === "DELIVERED"
                                                ? "bg-emerald-100 text-emerald-700"
                                                : order.status === "CANCELLED"
                                                    ? "bg-red-100 text-red-700"
                                                    : "bg-amber-100 text-amber-700"
                                    }`}
                            >
                                {order.status}
                            </span>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-neutral-200 pt-4">
                            <span className="font-semibold">
                                Total
                            </span>

                            <span className="text-lg font-semibold">
                                ₹
                                {Number(order.totalAmount).toLocaleString(
                                    "en-IN"
                                )}
                            </span>
                        </div>
                    </aside>
                </div>

                <div className="mt-12">
                    <Link
                        href="/products"
                        className="inline-block rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
                    >
                        Continue shopping
                    </Link>
                </div>
            </section>
        </main>
    );
}
export default function OrderPage() {
    return (
        <RequireAuth>
            <OrderContent />
        </RequireAuth>
    );
}