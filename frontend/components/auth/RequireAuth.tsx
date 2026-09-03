"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

export default function RequireAuth({
    children,
}: {
    children: ReactNode;
}) {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            router.replace("/login");
            return;
        }

        setIsChecking(false);
    }, [router]);

    if (isChecking) {
        return (
            <main className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
                <p className="text-sm text-neutral-500">Checking authentication...</p>
            </main>
        );
    }

    return <>{children}</>;
}