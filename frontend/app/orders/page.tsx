"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import RequireAuth from "@/components/auth/RequireAuth";
import { getOrders, type Order } from "@/lib/api";

function OrdersContent() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        getOrders()
            .then((result) => {
                setOrders(result);
            })
            .catch((error) => {
                setError(
                    error instanceof Error
                        ? error.message
                        : "Unable to load orders"
                );
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    if (isLoading) {
        return (
            <>
                <Navbar />
                <main className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
                    <p className="text-sm text-neutral-500">
                        Loading orders...
                    </p>
                </main>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <main className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
                    <h1 className="text-2xl font-semibold">
                        Unable to load orders
                    </h1>
                    <p className="mt-3 text-sm text-red-600">{error}</p>
                </main>
            </>
        );
    }

    return (
        <>
            <Navbar />

            <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-20">
                <div>
                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
                        Account
                    </p>

                    <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
                        Your orders
                    </h1>

                    <p className="mt-4 text-neutral-500">
                        View your recent purchases and order details.
                    </p>
                </div>

                {orders.length === 0 ? (
                    <div className="mt-16 py-16 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
                            <span className="text-2xl">📦</span>
                        </div>

                        <p className="mt-8 text-sm font-medium uppercase tracking-[0.2em] text-neutral-400">
                            No orders yet
                        </p>

                        <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                            Your order history is empty
                        </h2>

                        <p className="mx-auto mt-3 max-w-md text-neutral-600">
                            Once you place an order, you'll find all your purchases here.
                        </p>

                        <Link
                            href="/products"
                            className="mt-8 inline-block rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
                        >
                            Start shopping
                        </Link>
                    </div>
                ) : (
                    <div className="mt-8 space-y-4">
                        {orders.map((order) => (
                            <Link
                                key={order.id}
                                href={`/orders/${order.id}`}
                                className="group block rounded-2xl border border-neutral-200 p-6 transition hover:border-neutral-400 hover:shadow-sm"
                            >
                                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <p className="font-medium">
                                                Order #{order.id}
                                            </p>

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

                                        <p className="mt-2 text-sm text-neutral-500">
                                            {order.items.length}{" "}
                                            {order.items.length === 1 ? "item" : "items"}
                                        </p>

                                        <p className="mt-1 text-sm text-neutral-400">
                                            {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between gap-6 sm:flex-col sm:items-end">
                                        <p className="font-medium">
                                            ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                                        </p>

                                        <span className="text-sm text-neutral-500 transition group-hover:text-black">
                                            View order →
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </>
    );
}

export default function OrdersPage() {
    return (
        <RequireAuth>
            <OrdersContent />
        </RequireAuth>
    );
}