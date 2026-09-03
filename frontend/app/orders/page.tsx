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

            <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
                <h1 className="text-3xl font-semibold tracking-tight">
                    Your Orders
                </h1>

                {orders.length === 0 ? (
                    <div className="mt-12">
                        <p className="text-neutral-500">
                            You haven't placed any orders yet.
                        </p>

                        <Link
                            href="/products"
                            className="mt-6 inline-block rounded-full bg-black px-6 py-3 text-sm font-medium text-white"
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
                                className="block rounded-2xl border border-neutral-200 p-6 transition hover:border-neutral-400"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">
                                            Order #{order.id}
                                        </p>

                                        <p className="mt-1 text-sm text-neutral-500">
                                            {order.items.length}{" "}
                                            {order.items.length === 1
                                                ? "item"
                                                : "items"}
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <p className="font-medium">
                                            ₹
                                            {Number(
                                                order.totalAmount
                                            ).toFixed(2)}
                                        </p>

                                        <span className="mt-1 inline-block rounded-full bg-neutral-100 px-3 py-1 text-xs">
                                            {order.status}
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