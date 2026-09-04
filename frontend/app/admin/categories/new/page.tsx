"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import RequireAdmin from "@/components/auth/RequireAdmin";
import { authFetch } from "@/lib/api";

function CreateCategoryContent() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setError("");
        setIsSubmitting(true);

        try {
            const response = await authFetch("/categories", {
                method: "POST",
                body: JSON.stringify({
                    name: name.trim(),
                    slug: slug.trim(),
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to create category"
                );
            }

            router.push("/admin/categories");
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to create category"
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <>
            <Navbar />

            <main className="mx-auto max-w-3xl px-6 py-12 lg:px-8 lg:py-20">
                <Link
                    href="/admin/categories"
                    className="text-sm text-neutral-500 hover:text-black"
                >
                    ← Back to categories
                </Link>

                <div className="mt-10">
                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
                        Administration
                    </p>

                    <h1 className="mt-3 text-4xl font-semibold tracking-tight">
                        Add category
                    </h1>

                    <p className="mt-4 text-neutral-500">
                        Create a new category for organizing products.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="mt-12 space-y-6"
                >
                    <div>
                        <label
                            htmlFor="name"
                            className="mb-2 block text-sm font-medium"
                        >
                            Category name
                        </label>

                        <input
                            id="name"
                            value={name}
                            onChange={(event) =>
                                setName(event.target.value)
                            }
                            required
                            minLength={2}
                            className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                            placeholder="e.g. Accessories"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="slug"
                            className="mb-2 block text-sm font-medium"
                        >
                            Slug
                        </label>

                        <input
                            id="slug"
                            value={slug}
                            onChange={(event) =>
                                setSlug(event.target.value)
                            }
                            required
                            minLength={2}
                            className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                            placeholder="e.g. accessories"
                        />

                        <p className="mt-2 text-xs text-neutral-500">
                            Use lowercase letters and hyphens for the URL-friendly slug.
                        </p>
                    </div>

                    {error && (
                        <div
                            role="alert"
                            className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"
                        >
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
                        <Link
                            href="/admin/categories"
                            className="rounded-full border border-neutral-300 px-6 py-3 text-center text-sm font-medium transition hover:bg-neutral-50"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
                        >
                            {isSubmitting
                                ? "Creating..."
                                : "Create category"}
                        </button>
                    </div>
                </form>
            </main>
        </>
    );
}

export default function CreateCategoryPage() {
    return (
        <RequireAdmin>
            <CreateCategoryContent />
        </RequireAdmin>
    );
}