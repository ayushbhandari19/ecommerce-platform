"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import RequireAdmin from "@/components/auth/RequireAdmin";
import { authFetch, getProducts } from "@/lib/api";
import type { Product } from "@/types/product";

function AdminProductsContent() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [deletingProductId, setDeletingProductId] = useState<number | null>(
        null
    );

    async function loadProducts() {
        try {
            setError("");

            const result = await getProducts();
            setProducts(result);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Unable to load products"
            );
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadProducts();
    }, []);

    async function handleDelete(product: Product) {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${product.name}"?`
        );

        if (!confirmed) {
            return;
        }

        setError("");
        setDeletingProductId(product.id);

        try {
            const response = await authFetch(`/products/${product.id}`, {
                method: "DELETE",
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to delete product"
                );
            }

            setProducts((currentProducts) =>
                currentProducts.filter(
                    (currentProduct) => currentProduct.id !== product.id
                )
            );
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to delete product"
            );
        } finally {
            setDeletingProductId(null);
        }
    }

    return (
        <>
            <Navbar />

            <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-20">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
                            Administration
                        </p>

                        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
                            Products
                        </h1>

                        <p className="mt-4 text-neutral-500">
                            Manage the products available in your store.
                        </p>
                    </div>

                    <Link
                        href="/admin/products/new"
                        className="inline-flex w-fit rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
                    >
                        Add product
                    </Link>
                </div>

                {isLoading && (
                    <div className="mt-12">
                        <p className="text-sm text-neutral-500">
                            Loading products...
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

                {!isLoading && !error && (
                    <div className="mt-12 overflow-hidden rounded-2xl border border-neutral-200">
                        <div className="hidden grid-cols-[1fr_140px_120px_160px] gap-6 border-b border-neutral-200 bg-neutral-50 px-6 py-4 text-xs font-medium uppercase tracking-[0.15em] text-neutral-500 sm:grid">
                            <span>Product</span>
                            <span>Price</span>
                            <span>Stock</span>
                            <span>Actions</span>
                        </div>

                        <div className="divide-y divide-neutral-200">
                            {products.map((product) => (
                                <div
                                    key={product.id}
                                    className="grid gap-4 px-6 py-5 sm:grid-cols-[1fr_140px_120px_160px] sm:items-center sm:gap-6"
                                >
                                    <div>
                                        <p className="font-medium">
                                            {product.name}
                                        </p>

                                        <p className="mt-1 text-sm text-neutral-500">
                                            {product.category?.name ??
                                                "Uncategorized"}
                                        </p>
                                    </div>

                                    <p className="text-sm">
                                        ₹
                                        {Number(
                                            product.price
                                        ).toLocaleString("en-IN")}
                                    </p>

                                    <p
                                        className={`text-sm ${
                                            product.stock === 0
                                                ? "text-red-600"
                                                : product.stock <= 5
                                                    ? "text-amber-600"
                                                    : "text-neutral-600"
                                        }`}
                                    >
                                        {product.stock}
                                    </p>

                                    <div className="flex items-center gap-4">
                                        <Link
                                            href={`/admin/products/${product.id}`}
                                            className="text-sm font-medium hover:underline"
                                        >
                                            Edit →
                                        </Link>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDelete(product)
                                            }
                                            disabled={
                                                deletingProductId ===
                                                product.id
                                            }
                                            className="text-sm font-medium text-red-600 transition hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            {deletingProductId === product.id
                                                ? "Deleting..."
                                                : "Delete"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!isLoading && !error && products.length === 0 && (
                    <div className="mt-12 rounded-2xl border border-dashed border-neutral-300 py-16 text-center">
                        <h2 className="text-xl font-semibold">
                            No products yet
                        </h2>

                        <p className="mt-2 text-sm text-neutral-500">
                            Add your first product to the store.
                        </p>

                        <Link
                            href="/admin/products/new"
                            className="mt-6 inline-block rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
                        >
                            Add product
                        </Link>
                    </div>
                )}
            </main>
        </>
    );
}

export default function AdminProductsPage() {
    return (
        <RequireAdmin>
            <AdminProductsContent />
        </RequireAdmin>
    );
}