"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import RequireAuth from "@/components/auth/RequireAuth";
import Navbar from "@/components/layout/Navbar";
import {
    confirmPayment,
    createPayment,
    getOrder,
    type Order,
    type Payment,
} from "@/lib/api";

function PaymentContent() {
    const params = useParams<{ orderId: string }>();
    const router = useRouter();

    const [order, setOrder] = useState<Order | null>(null);
    const [payment, setPayment] = useState<Payment | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadOrder() {
            try {
                const result = await getOrder(params.orderId);
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
    }, [params.orderId]);

    async function handlePayment() {
        if (!order) return;

        setError("");
        setIsProcessing(true);

        try {
            const createdPayment = await createPayment(
                order.id,
                "MOCK_PAYMENT"
            );

            setPayment(createdPayment);

            const transactionId = `MOCK-${Date.now()}`;

            const result = await confirmPayment(
                createdPayment.id,
                transactionId
            );

            router.push(`/orders/${result.order.id}`);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Payment failed"
            );
        } finally {
            setIsProcessing(false);
        }
    }

    if (isLoading) {
        return (
            <main className="min-h-screen bg-white">
                <Navbar />

                <div className="mx-auto max-w-7xl px-6 py-20 text-center lg:px-8">
                    <p className="text-neutral-500">
                        Loading payment...
                    </p>
                </div>
            </main>
        );
    }

    if (error && !order) {
        return (
            <main className="min-h-screen bg-white">
                <Navbar />

                <section className="mx-auto max-w-7xl px-6 py-20 text-center lg:px-8">
                    <h1 className="text-3xl font-semibold tracking-tight">
                        Unable to load payment
                    </h1>

                    <p className="mt-3 text-neutral-500">
                        {error}
                    </p>

                    <Link
                        href="/orders"
                        className="mt-8 inline-block rounded-full bg-black px-6 py-3 text-sm font-medium text-white"
                    >
                        View orders
                    </Link>
                </section>
            </main>
        );
    }

    if (!order) {
        return null;
    }

    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            <section className="mx-auto max-w-5xl px-6 py-12 lg:px-8 lg:py-20">
                <div>
                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
                        Secure checkout
                    </p>

                    <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
                        Complete payment
                    </h1>

                    <p className="mt-4 text-neutral-500">
                        Order #{order.id}
                    </p>
                </div>

                <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_360px]">
                    <div>
                        <div className="rounded-2xl border border-neutral-200 p-6">
                            <h2 className="text-lg font-semibold">
                                Payment method
                            </h2>

                            <div className="mt-6 rounded-xl border-2 border-black p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">
                                            Mock Payment
                                        </p>

                                        <p className="mt-1 text-sm text-neutral-500">
                                            Demo payment for this portfolio project
                                        </p>
                                    </div>

                                    <span className="text-sm font-medium">
                                        TEST
                                    </span>
                                </div>
                            </div>

                            {error && (
                                <div
                                    role="alert"
                                    className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4"
                                >
                                    <p className="text-sm font-medium text-red-700">
                                        Payment failed
                                    </p>

                                    <p className="mt-1 text-sm text-red-600">
                                        {error}
                                    </p>
                                </div>
                            )}

                            {isProcessing && (
                                <div className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50 p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-black" />

                                        <div>
                                            <p className="text-sm font-medium">
                                                Processing payment
                                            </p>

                                            <p className="mt-1 text-sm text-neutral-500">
                                                Please don't close this page.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={handlePayment}
                                disabled={isProcessing || payment !== null}
                                className="mt-6 w-full rounded-full bg-black px-6 py-3.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
                            >
                                {isProcessing
                                    ? "Processing payment..."
                                    : payment
                                        ? "Payment processing..."
                                        : `Pay ₹${Number(
                                            order.totalAmount
                                        ).toLocaleString("en-IN")}`}
                            </button>
                        </div>
                    </div>

                    <aside className="h-fit rounded-2xl bg-neutral-50 p-6">
                        <h2 className="text-lg font-semibold">
                            Order summary
                        </h2>

                        <div className="mt-6 space-y-4">
                            {order.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex justify-between gap-4 text-sm"
                                >
                                    <div>
                                        <p className="font-medium">
                                            {item.product.name}
                                        </p>

                                        <p className="mt-1 text-neutral-500">
                                            Qty: {item.quantity}
                                        </p>
                                    </div>

                                    <span className="font-medium">
                                        ₹
                                        {(
                                            Number(item.price) * item.quantity
                                        ).toLocaleString("en-IN")}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 flex items-center justify-between border-t border-neutral-200 pt-6">
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
            </section>
        </main>
    );
}
export default function PaymentPage() {
    return (
        <RequireAuth>
            <PaymentContent />
        </RequireAuth>
    );
}