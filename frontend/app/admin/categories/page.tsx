"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import RequireAdmin from "@/components/auth/RequireAdmin";
import { authFetch, getCategories } from "@/lib/api";
import type { Category } from "@/types/product";

function AdminCategoriesContent() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(
        null
    );
    useEffect(() => {
        getCategories()
            .then((result) => {
                setCategories(result);
            })
            .catch((error) => {
                setError(
                    error instanceof Error
                        ? error.message
                        : "Unable to load categories"
                );
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);
    async function handleDelete(category: Category) {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${category.name}"?`
        );

        if (!confirmed) {
            return;
        }

        setError("");
        setDeletingCategoryId(category.id);

        try {
            const response = await authFetch(`/categories/${category.id}`, {
                method: "DELETE",
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to delete category"
                );
            }

            setCategories((currentCategories) =>
                currentCategories.filter(
                    (currentCategory) => currentCategory.id !== category.id
                )
            );
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to delete category"
            );
        } finally {
            setDeletingCategoryId(null);
        }
    }

    return (
        <>
            <Navbar />

            <main className="mx-auto max-w-5xl px-6 py-12 lg:px-8 lg:py-20">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
                            Administration
                        </p>

                        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
                            Categories
                        </h1>

                        <p className="mt-4 text-neutral-500">
                            Manage the categories used to organize products.
                        </p>
                    </div>

                    <Link
                        href="/admin/categories/new"
                        className="inline-flex w-fit rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
                    >
                        Add category
                    </Link>
                </div>

                {isLoading && (
                    <div className="mt-12">
                        <p className="text-sm text-neutral-500">
                            Loading categories...
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
                        <div className="hidden grid-cols-[1fr_1fr_120px] gap-6 border-b border-neutral-200 bg-neutral-50 px-6 py-4 text-xs font-medium uppercase tracking-[0.15em] text-neutral-500 sm:grid">
                            <span>Name</span>
                            <span>Slug</span>
                            <span>Actions</span>
                        </div>

                        <div className="divide-y divide-neutral-200">
                            {categories.map((category) => (
                                <div
                                    key={category.id}
                                    className="grid gap-4 px-6 py-5 sm:grid-cols-[1fr_1fr_160px] sm:items-center sm:gap-6"
                                >
                                    <div>
                                        <p className="font-medium">
                                            {category.name}
                                        </p>
                                    </div>

                                    <p className="text-sm text-neutral-500">
                                        {category.slug}
                                    </p>

                                    <div className="flex items-center gap-4">
                                        <Link
                                            href={`/admin/categories/${category.id}`}
                                            className="text-sm font-medium hover:underline"
                                        >
                                            Edit →
                                        </Link>

                                        <button
                                            type="button"
                                            onClick={() => handleDelete(category)}
                                            disabled={deletingCategoryId === category.id}
                                            className="text-sm font-medium text-red-600 transition hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            {deletingCategoryId === category.id
                                                ? "Deleting..."
                                                : "Delete"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!isLoading && !error && categories.length === 0 && (
                    <div className="mt-12 rounded-2xl border border-dashed border-neutral-300 py-16 text-center">
                        <h2 className="text-xl font-semibold">
                            No categories yet
                        </h2>

                        <p className="mt-2 text-sm text-neutral-500">
                            Add your first category to organize products.
                        </p>

                        <Link
                            href="/admin/categories/new"
                            className="mt-6 inline-block rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
                        >
                            Add category
                        </Link>
                    </div>
                )}
            </main>
        </>
    );
}

export default function AdminCategoriesPage() {
    return (
        <RequireAdmin>
            <AdminCategoriesContent />
        </RequireAdmin>
    );
}