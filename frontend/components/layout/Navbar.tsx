"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/providers/CartProvider";

export default function Navbar() {
    const { itemCount } = useCart();
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        setIsLoggedIn(Boolean(localStorage.getItem("token")));
    }, []);

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsLoggedIn(false);
        router.push("/");
    }

    return (
        <header className="border-b border-neutral-200">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
                <Link
                    href="/"
                    className="text-xl font-semibold tracking-tight"
                >
                    STORE
                </Link>

                <nav className="flex items-center gap-6 text-sm">
                    <Link
                        href="/products"
                        className="text-neutral-600 transition hover:text-black"
                    >
                        Products
                    </Link>

                    {isLoggedIn && (
                        <Link
                            href="/orders"
                            className="text-neutral-600 transition hover:text-black"
                        >
                            Orders
                        </Link>
                    )}

                    <Link
                        href="/cart"
                        className="text-neutral-600 transition hover:text-black"
                    >
                        Cart ({itemCount})
                    </Link>

                    {isLoggedIn ? (
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="text-neutral-600 transition hover:text-black"
                        >
                            Logout
                        </button>
                    ) : (
                        <Link
                            href="/login"
                            className="text-neutral-600 transition hover:text-black"
                        >
                            Login
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
}