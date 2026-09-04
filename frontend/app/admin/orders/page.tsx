"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import RequireAdmin from "@/components/auth/RequireAdmin";
import {
    getAdminOrders,
    updateOrderStatus,
} from "@/lib/api";
import type { Order } from "@/lib/api";

function AdminOrdersContent() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

    useEffect(() => {
        getAdminOrders()
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
    const handleStatusChange = async (
        orderId: number,
        status: Order["status"]
    ) => {
        try {
            setUpdatingOrderId(orderId);
            setError("");

            const updatedOrder = await updateOrderStatus(orderId, status);

            setOrders((currentOrders) =>
                currentOrders.map((order) =>
                    order.id === orderId ? updatedOrder : order
                )
            );
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Unable to update order status"
            );
        } finally {
            setUpdatingOrderId(null);
        }
    };
    const getNextStatuses = (status: Order["status"]): Order["status"][] => {
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

    return (
        <>
            <Navbar />

            <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-20">
                <div>
                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
                        Administration
                    </p>

                    <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
                        Orders
                    </h1>

                    <p className="mt-4 text-neutral-500">
                        View and manage customer orders.
                    </p>
                </div>

                {isLoading && (
                    <div className="mt-12">
                        <p className="text-sm text-neutral-500">
                            Loading orders...
                        </p>
                    </div>
                )}

                {error && (
                    <div
                        role="alert"
                        className="mt-12 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"
                    >
                        {error}
                    </div>
                )}

                {!isLoading && !error && orders.length === 0 && (
                    <div className="mt-12 rounded-2xl border border-dashed border-neutral-300 py-16 text-center">
                        <h2 className="text-xl font-semibold">
                            No orders yet
                        </h2>

                        <p className="mt-2 text-sm text-neutral-500">
                            Customer orders will appear here.
                        </p>
                    </div>
                )}

                {!isLoading && !error && orders.length > 0 && (
                    <div className="mt-12 overflow-hidden rounded-2xl border border-neutral-200">
                        <div className="hidden grid-cols-[100px_1fr_140px_140px_100px] gap-6 border-b border-neutral-200 bg-neutral-50 px-6 py-4 text-xs font-medium uppercase tracking-[0.15em] text-neutral-500 lg:grid">
                            <span>Order</span>
                            <span>Customer</span>
                            <span>Total</span>
                            <span>Status</span>
                            <span>View</span>
                        </div>

                        <div className="divide-y divide-neutral-200">
                            {orders.map((order) => (
                                <div
                                    key={order.id}
                                    className="grid gap-4 px-6 py-5 lg:grid-cols-[100px_1fr_140px_140px_100px] lg:items-center lg:gap-6"
                                >
                                    <div>
                                        <p className="text-sm font-medium">
                                            #{order.id}
                                        </p>

                                        <p className="mt-1 text-xs text-neutral-500">
                                            {new Date(
                                                order.createdAt
                                            ).toLocaleDateString("en-IN")}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium">
                                            {order.user?.name || `Customer #${order.userId}`}
                                        </p>

                                        <p className="mt-1 text-sm text-neutral-500">
                                            {order.user?.email || "Email unavailable"}
                                        </p>

                                        <p className="mt-1 text-xs text-neutral-400">
                                            {order.items.length}{" "}
                                            {order.items.length === 1
                                                ? "item"
                                                : "items"}
                                        </p>
                                    </div>

                                    <p className="text-sm">
                                        ₹
                                        {Number(
                                            order.totalAmount
                                        ).toLocaleString("en-IN")}
                                    </p>

                                    <div>
                                        <span
                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${order.status === "CONFIRMED"
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

                                        {getNextStatuses(order.status).length > 0 && (
                                            <select
                                                value=""
                                                disabled={updatingOrderId === order.id}
                                                onChange={(event) => {
                                                    const nextStatus = event.target.value as Order["status"];

                                                    if (nextStatus) {
                                                        handleStatusChange(order.id, nextStatus);
                                                    }
                                                }}
                                                className="mt-2 block w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs outline-none focus:border-neutral-900"
                                            >
                                                <option value="">
                                                    {updatingOrderId === order.id
                                                        ? "Updating..."
                                                        : "Change status"}
                                                </option>

                                                {getNextStatuses(order.status).map((status) => (
                                                    <option key={status} value={status}>
                                                        {status}
                                                    </option>
                                                ))}
                                            </select>

                                        )}
                                        {order.payment && (
                                            <p
                                                className={`mt-2 text-xs font-medium ${order.payment.status === "SUCCESS"
                                                        ? "text-green-600"
                                                        : order.payment.status === "FAILED"
                                                            ? "text-red-600"
                                                            : "text-amber-600"
                                                    }`}
                                            >
                                                Payment: {order.payment.status}
                                            </p>
                                        )}
                                    </div>

                                    <Link
                                        href={`/admin/orders/${order.id}`}
                                        className="text-sm font-medium hover:underline"
                                    >
                                        View →
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </>
    );
}

export default function AdminOrdersPage() {
    return (
        <RequireAdmin>
            <AdminOrdersContent />
        </RequireAdmin>
    );
}