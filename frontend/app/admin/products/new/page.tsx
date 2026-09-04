"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import RequireAdmin from "@/components/auth/RequireAdmin";
import { authFetch } from "@/lib/api";
import type { Category } from "@/types/product";

function NewProductContent() {
    const router = useRouter();

    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);

    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [image, setImage] = useState("");
    const [categoryId, setCategoryId] = useState("");

    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"}/categories`
        )
            .then(async (response) => {
                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.message || "Failed to load categories"
                    );
                }

                return result;
            })
            .then((result) => {
                setCategories(result.categories);
            })
            .catch((error) => {
                setError(
                    error instanceof Error
                        ? error.message
                        : "Failed to load categories"
                );
            })
            .finally(() => {
                setIsLoadingCategories(false);
            });
    }, []);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setError("");
        setIsSubmitting(true);

        try {
            const response = await authFetch("/products", {
                method: "POST",
                body: JSON.stringify({
                    name,
                    slug,
                    description,
                    price: Number(price),
                    stock: Number(stock),
                    ...(image.trim() ? { image: image.trim() } : {}),
                    categoryId: Number(categoryId),
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to create product"
                );
            }

            router.push("/admin/products");
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to create product"
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <>
            <Navbar />

            <main className="mx-auto max-w-3xl px-6 py-12 lg:px-8 lg:py-20">
                <div>
                    <Link
                        href="/admin/products"
                        className="text-sm text-neutral-500 hover:text-black"
                    >
                        ← Back to products
                    </Link>

                    <p className="mt-10 text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
                        Administration
                    </p>

                    <h1 className="mt-3 text-4xl font-semibold tracking-tight">
                        Add product
                    </h1>

                    <p className="mt-4 text-neutral-500">
                        Add a new product to your store catalog.
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
                            Product name
                        </label>

                        <input
                            id="name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            required
                            minLength={2}
                            className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                            placeholder="Nike Air Max"
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
                            onChange={(event) => setSlug(event.target.value)}
                            required
                            minLength={2}
                            className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                            placeholder="nike-air-max"
                        />

                        <p className="mt-2 text-xs text-neutral-500">
                            Use a unique URL-friendly identifier.
                        </p>
                    </div>

                    <div>
                        <label
                            htmlFor="description"
                            className="mb-2 block text-sm font-medium"
                        >
                            Description
                        </label>

                        <textarea
                            id="description"
                            value={description}
                            onChange={(event) =>
                                setDescription(event.target.value)
                            }
                            required
                            minLength={5}
                            rows={5}
                            className="w-full resize-none rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                            placeholder="Describe the product..."
                        />
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <div>
                            <label
                                htmlFor="price"
                                className="mb-2 block text-sm font-medium"
                            >
                                Price
                            </label>

                            <input
                                id="price"
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={price}
                                onChange={(event) =>
                                    setPrice(event.target.value)
                                }
                                required
                                className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                                placeholder="6999.99"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="stock"
                                className="mb-2 block text-sm font-medium"
                            >
                                Stock
                            </label>

                            <input
                                id="stock"
                                type="number"
                                min="0"
                                step="1"
                                value={stock}
                                onChange={(event) =>
                                    setStock(event.target.value)
                                }
                                required
                                className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                                placeholder="20"
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="category"
                            className="mb-2 block text-sm font-medium"
                        >
                            Category
                        </label>

                        <select
                            id="category"
                            value={categoryId}
                            onChange={(event) =>
                                setCategoryId(event.target.value)
                            }
                            required
                            disabled={isLoadingCategories}
                            className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black disabled:bg-neutral-100"
                        >
                            <option value="">
                                {isLoadingCategories
                                    ? "Loading categories..."
                                    : "Select a category"}
                            </option>

                            {categories.map((category) => (
                                <option
                                    key={category.id}
                                    value={category.id}
                                >
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="image"
                            className="mb-2 block text-sm font-medium"
                        >
                            Image URL
                        </label>

                        <input
                            id="image"
                            type="url"
                            value={image}
                            onChange={(event) =>
                                setImage(event.target.value)
                            }
                            className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                            placeholder="https://example.com/product.jpg"
                        />

                        <p className="mt-2 text-xs text-neutral-500">
                            Optional. Must be a valid image URL.
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
                            href="/admin/products"
                            className="rounded-full border border-neutral-300 px-6 py-3 text-center text-sm font-medium transition hover:bg-neutral-50"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            disabled={isSubmitting || isLoadingCategories}
                            className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
                        >
                            {isSubmitting
                                ? "Creating product..."
                                : "Create product"}
                        </button>
                    </div>
                </form>
            </main>
        </>
    );
}

export default function NewProductPage() {
    return (
        <RequireAdmin>
            <NewProductContent />
        </RequireAdmin>
    );
}