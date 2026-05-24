"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingSpinner from "./LoadingSpinner.jsx";

export default function RoleGuard({ requiredRole, children }) {
    const { data: session, status } = useSession();
    const isLoaded = status !== "loading";
    const router = useRouter();

    useEffect(() => {
        if (!isLoaded) return;

        if (status === "unauthenticated" || !session?.user) {
            router.replace("/sign-in");
            return;
        }

        const role = session.user.isDoctor ? "doctor" : "patient";

        if (role !== requiredRole) {
            router.replace(`/${role}/dashboard`);
        }
    }, [isLoaded, session, status, requiredRole, router]);

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <LoadingSpinner size="lg" label="Checking access..." />
            </div>
        );
    }

    const role = session?.user?.isDoctor ? "doctor" : "patient";

    if (!session?.user || role !== requiredRole) {
        return null;
    }

    return <>{children}</>;
}