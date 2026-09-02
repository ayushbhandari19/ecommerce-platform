
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/providers/CartProvider";

type AddToCartButtonProps = {
    productId: number;
    disabled?: boolean;
};

export default function AddToCartButton({
    productId,
    disabled = false,
}: AddToCartButtonProps) {
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const { addItem } = useCart();

    async function handleAddToCart() {
        const token = localStorage.getItem("token");

        if (!token) {
            router.push("/login");
            return;
        }

        setError("");
        setIsLoading(true);

        try {
            await addItem(productId, 1);
            router.push("/cart");
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to add product to cart"
            );
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="mt-8">
            <button
                type="button"
                onClick={handleAddToCart}
                disabled={disabled || isLoading}
                className="w-full rounded-full bg-black px-6 py-4 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300 sm:w-auto"
            >
                {isLoading ? "Adding..." : "Add to cart"}
            </button>

            {error && (
                <p
                    role="alert"
                    className="mt-3 text-sm text-red-600"
                >
                    {error}
                </p>
            )}
        </div>
    );
}

