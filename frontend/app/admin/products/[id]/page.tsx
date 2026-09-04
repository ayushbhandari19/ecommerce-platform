"use client";
import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import RequireAdmin from "@/components/auth/RequireAdmin";
import { authFetch, getProduct } from "@/lib/api";
import type { Category, Product } from "@/types/product";

function EditProductContent() {
    const params = useParams();
    const router = useRouter();

    const productId = String(params.id);

    const [product, setProduct] = useState<Product | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [image, setImage] = useState("");
    const [categoryId, setCategoryId] = useState("");

    const [error, setError] = useState("");

    useEffect(() => {
        async function loadData() {
            try {
                const [productResult, categoriesResponse] = await Promise.all([
                    getProduct(productId),
                    fetch(
                        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"}/categories`
                    ),
                ]);

                const categoriesResult = await categoriesResponse.json();

                if (!categoriesResponse.ok) {
                    throw new Error(
                        categoriesResult.message ||
                            "Failed to load categories"
                    );
                }

                setProduct(productResult);
                setCategories(categoriesResult.categories);

                setName(productResult.name);
                setSlug(productResult.slug);
                setDescription(productResult.description);
                setPrice(productResult.price);
                setStock(String(productResult.stock));
                setImage(productResult.image ?? "");
                setCategoryId(String(productResult.categoryId));
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : "Failed to load product"
                );
            } finally {
                setIsLoading(false);
            }
        }

        loadData();
    }, [productId]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setError("");
        setIsSubmitting(true);

        try {
            const response = await authFetch(`/products/${productId}`, {
                method: "PUT",
                body: JSON.stringify({
                    name,
                    slug,
                    description,
                    price: Number(price),
                    stock: Number(stock),
                    image: image.trim() || undefined,
                    categoryId: Number(categoryId),
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to update product"
                );
            }

            router.push("/admin/products");
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to update product"
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isLoading) {
        return (
            <>
                <Navbar />

                <main className="mx-auto max-w-3xl px-6 py-20 lg:px-8">
                    <p className="text-sm text-neutral-500">
                        Loading product...
                    </p>
                </main>
            </>
        );
    }

    if (!product) {
        return (
            <>
                <Navbar />

                <main className="mx-auto max-w-3xl px-6 py-20 lg:px-8">
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                        <h1 className="text-xl font-semibold">
                            Unable to load product
                        </h1>

                        <p className="mt-2 text-sm text-red-600">
                            {error || "Product not found."}
                        </p>

                        <Link
                            href="/admin/products"
                            className="mt-6 inline-block text-sm font-medium hover:underline"
                        >
                            ← Back to products
                        </Link>
                    </div>
                </main>
            </>
        );
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
                        Edit product
                    </h1>

                    <p className="mt-4 text-neutral-500">
                        Update the details for {product.name}.
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
                            onChange={(event) =>
                                setName(event.target.value)
                            }
                            required
                            minLength={2}
                            className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-black"
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
                        />
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
                            className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
                        >
                            <option value="">
                                Select a category
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
                            Optional. Must be a valid URL if provided.
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
                            disabled={isSubmitting}
                            className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
                        >
                            {isSubmitting
                                ? "Saving changes..."
                                : "Save changes"}
                        </button>
                    </div>
                </form>
            </main>
        </>
    );
}

export default function EditProductPage() {
    return (
        <RequireAdmin>
            <EditProductContent />
        </RequireAdmin>
    );
}

