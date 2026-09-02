"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setError("");
        setIsLoading(true);

        try {
            const result = await login(email, password);

            localStorage.setItem("token", result.token);
            localStorage.setItem("user", JSON.stringify(result.user));

            router.push("/products");
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Something went wrong. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-6">
            <div className="w-full max-w-md">
                <div className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
                    <Link
                        href="/"
                        className="text-xl font-semibold tracking-tight"
                    >
                        STORE
                    </Link>

                    <div className="mt-10">
                        <h1 className="text-3xl font-semibold tracking-tight">
                            Welcome back
                        </h1>

                        <p className="mt-2 text-sm text-neutral-500">
                            Sign in to continue shopping.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-2 block text-sm font-medium"
                            >
                                Email
                            </label>

                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                required
                                autoComplete="email"
                                className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="mb-2 block text-sm font-medium"
                            >
                                Password
                            </label>

                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                required
                                autoComplete="current-password"
                                className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <div
                                role="alert"
                                className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"
                            >
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full rounded-full bg-black px-6 py-3.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
                        >
                            {isLoading ? "Signing in..." : "Sign in"}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-neutral-500">
                        Don&apos;t have an account?{" "}
                        <Link
                            href="/register"
                            className="font-medium text-black hover:underline"
                        >
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}

