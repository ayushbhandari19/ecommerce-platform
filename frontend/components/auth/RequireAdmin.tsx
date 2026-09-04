"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

type StoredUser = {
    id: number;
    name: string;
    email: string;
    role: "CUSTOMER" | "ADMIN";
};

export default function RequireAdmin({
    children,
}: {
    children: ReactNode;
}) {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (!token || !storedUser) {
            router.replace("/login");
            return;
        }

        try {
            const user = JSON.parse(storedUser) as StoredUser;

            if (user.role !== "ADMIN") {
                router.replace("/");
                return;
            }

            setIsChecking(false);
        } catch {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            router.replace("/login");
        }
    }, [router]);

    if (isChecking) {
        return (
            <main className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
                <p className="text-sm text-neutral-500">
                    Checking admin access...
                </p>
            </main>
        );
    }

    return <>{children}</>;
}