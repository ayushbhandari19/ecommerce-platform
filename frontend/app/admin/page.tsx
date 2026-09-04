"use client";

import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import RequireAdmin from "@/components/auth/RequireAdmin";

function AdminContent() {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    return (
        <>
            <Navbar />

            <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-20">
                <div>
                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
                        Administration
                    </p>

                    <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
                        Admin dashboard
                    </h1>

                    <p className="mt-4 text-neutral-500">
                        Welcome back, {user.name || "Admin"}.
                    </p>
                </div>

                <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <Link
                        href="/admin/products"
                        className="group rounded-2xl border border-neutral-200 p-6 transition hover:border-neutral-400 hover:shadow-sm"
                    >
                        <p className="text-sm text-neutral-500">
                            Catalog
                        </p>

                        <h2 className="mt-2 text-xl font-semibold">
                            Products
                        </h2>

                        <p className="mt-3 text-sm text-neutral-500">
                            Create, update, and manage store products.
                        </p>

                        <span className="mt-6 block text-sm font-medium transition group-hover:translate-x-1">
                            Manage products →
                        </span>
                    </Link>

                    <Link
                        href="/admin/categories"
                        className="group rounded-2xl border border-neutral-200 p-6 transition hover:border-neutral-400 hover:shadow-sm"
                    >
                        <p className="text-sm text-neutral-500">
                            Catalog
                        </p>

                        <h2 className="mt-2 text-xl font-semibold">
                            Categories
                        </h2>

                        <p className="mt-3 text-sm text-neutral-500">
                            Organize products into store categories.
                        </p>

                        <span className="mt-6 block text-sm font-medium transition group-hover:translate-x-1">
                            Manage categories →
                        </span>
                    </Link>

                    <Link
                        href="/admin/orders"
                        className="group rounded-2xl border border-neutral-200 p-6 transition hover:border-neutral-400 hover:shadow-sm"
                    >
                        <p className="text-sm text-neutral-500">
                            Operations
                        </p>

                        <h2 className="mt-2 text-xl font-semibold">
                            Orders
                        </h2>

                        <p className="mt-3 text-sm text-neutral-500">
                            View orders and update their status.
                        </p>

                        <span className="mt-6 block text-sm font-medium transition group-hover:translate-x-1">
                            Manage orders →
                        </span>
                    </Link>
                </div>
            </main>
        </>
    );
}

export default function AdminPage() {
    return (
        <RequireAdmin>
            <AdminContent />
        </RequireAdmin>
    );
}
