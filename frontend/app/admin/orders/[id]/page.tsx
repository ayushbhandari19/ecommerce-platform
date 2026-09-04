"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import RequireAdmin from "@/components/auth/RequireAdmin";
import {
    getAdminOrder,
    updateOrderStatus,
} from "@/lib/api";
import type { Order } from "@/lib/api";

const getNextStatuses = (
    status: Order["status"]
): Order["status"][] => {
    switch (status) {
        case "PENDING":
            return ["CONFIRMED", "CANCELLED"];

        case "CONFIRMED":
            return ["SHIPPED", "CANCELLED"];

        case "SHIPPED":
            return ["DELIVERED"];

        case "DELIVERED":
        case "CANCELLED":
            return [];

        default:
            return [];
    }
};

function AdminOrderDetailsContent() {
    const params = useParams();
    const orderId = params.id as string;

    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        getAdminOrder(orderId)
            .then((result) => {
                setOrder(result);
            })
            .catch((error) => {
                setError(
                    error instanceof Error
                        ? error.message
                        : "Unable to load order"
                );
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [orderId]);

    const handleStatusChange = async (
        status: Order["status"]
    ) => {
        if (!order) return;

        try {
            setIsUpdating(true);
            setError("");

            const updatedOrder = await updateOrderStatus(
                order.id,
                status
            );

            setOrder(updatedOrder);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Unable to update order status"
            );
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) {
        return (
            <>
                <Navbar />

                <main className="mx-auto max-w-5xl px-6 py-12 lg:px-8 lg:py-20">
                    <p className="text-sm text-neutral-500">
                        Loading order...
                    </p>
                </main>
            </>
        );
    }

    if (error || !order) {
        return (
            <>
                <Navbar />

                <main className="mx-auto max-w-5xl px-6 py-12 lg:px-8 lg:py-20">
                    <div
                        role="alert"
                        className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"
                    >
                        {error || "Order not found"}
                    </div>

                    <Link
                        href="/admin/orders"
                        className="mt-6 inline-block text-sm font-medium hover:underline"
                    >
                        ← Back to orders
                    </Link>
                </main>
            </>
        );
    }

    const nextStatuses = getNextStatuses(order.status);

    return (
        <>
            <Navbar />

            <main className="mx-auto max-w-5xl px-6 py-12 lg:px-8 lg:py-20">
                <Link
                    href="/admin/orders"
                    className="text-sm text-neutral-500 hover:text-neutral-900"
                >
                    ← Back to orders
                </Link>

                <div className="mt-8 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
                            Administration
                        </p>

                        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
                            Order #{order.id}
                        </h1>

                        <p className="mt-3 text-sm text-neutral-500">
                            Placed{" "}
                            {new Date(
                                order.createdAt
                            ).toLocaleString("en-IN")}
                        </p>
                    </div>

                    <span
                        className={`w-fit rounded-full px-4 py-2 text-sm font-medium ${
                            order.status === "CONFIRMED"
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

                <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_320px]">
                    <section className="rounded-2xl border border-neutral-200">
                        <div className="border-b border-neutral-200 px-6 py-5">
                            <h2 className="text-lg font-semibold">
                                Order items
                            </h2>
                        </div>

                        <div className="divide-y divide-neutral-200">
                            {order.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex gap-4 px-6 py-5"
                                >
                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-neutral-100">
                                        {item.product.image ? (
                                            <img
                                                src={item.product.image}
                                                alt={item.product.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-xs text-neutral-400">
                                                No image
                                            </span>
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium">
                                            {item.product.name}
                                        </p>

                                        <p className="mt-1 text-sm text-neutral-500">
                                            Quantity: {item.quantity}
                                        </p>
                                    </div>

                                    <p className="text-sm font-medium">
                                        ₹
                                        {Number(
                                            item.price
                                        ).toLocaleString("en-IN")}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-neutral-200 px-6 py-5">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-neutral-500">
                                    Order total
                                </span>

                                <span className="text-lg font-semibold">
                                    ₹
                                    {Number(
                                        order.totalAmount
                                    ).toLocaleString("en-IN")}
                                </span>
                            </div>
                        </div>
                    </section>

                    <aside className="space-y-8">
                        <section className="rounded-2xl border border-neutral-200 p-6">
                            <h2 className="text-lg font-semibold">
                                Customer
                            </h2>

                            <div className="mt-5 space-y-3">
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-neutral-400">
                                        Name
                                    </p>

                                    <p className="mt-1 text-sm">
                                        {order.user?.name ||
                                            `Customer #${order.userId}`}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs uppercase tracking-wider text-neutral-400">
                                        Email
                                    </p>

                                    <p className="mt-1 break-all text-sm">
                                        {order.user?.email ||
                                            "Email unavailable"}
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-neutral-200 p-6">
                            <h2 className="text-lg font-semibold">
                                Payment
                            </h2>

                            {order.payment ? (
                                <div className="mt-5 space-y-3">
                                    <div className="flex justify-between gap-4 text-sm">
                                        <span className="text-neutral-500">
                                            Status
                                        </span>

                                        <span className="font-medium">
                                            {order.payment.status}
                                        </span>
                                    </div>

                                    <div className="flex justify-between gap-4 text-sm">
                                        <span className="text-neutral-500">
                                            Method
                                        </span>

                                        <span className="font-medium">
                                            {order.payment.paymentMethod ||
                                                "Not specified"}
                                        </span>
                                    </div>

                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-neutral-400">
                                            Transaction ID
                                        </p>

                                        <p className="mt-1 break-all text-sm">
                                            {order.payment.transactionId ||
                                                "Not available"}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <p className="mt-5 text-sm text-neutral-500">
                                    No payment record.
                                </p>
                            )}
                        </section>

                        {nextStatuses.length > 0 && (
                            <section className="rounded-2xl border border-neutral-200 p-6">
                                <h2 className="text-lg font-semibold">
                                    Update status
                                </h2>

                                <div className="mt-5 space-y-2">
                                    {nextStatuses.map((status) => (
                                        <button
                                            key={status}
                                            type="button"
                                            disabled={isUpdating}
                                            onClick={() =>
                                                handleStatusChange(status)
                                            }
                                            className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm font-medium transition hover:border-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {isUpdating
                                                ? "Updating..."
                                                : `Mark as ${status}`}
                                        </button>
                                    ))}
                                </div>
                            </section>
                        )}
                    </aside>
                </div>
            </main>
        </>
    );
}

export default function AdminOrderDetailsPage() {
    return (
        <RequireAdmin>
            <AdminOrderDetailsContent />
        </RequireAdmin>
    );
}