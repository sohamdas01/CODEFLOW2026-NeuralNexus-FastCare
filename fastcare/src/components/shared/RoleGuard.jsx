"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingSpinner from "./LoadingSpinner.jsx";

export default function RoleGuard({

    requiredRole,

    children

}) {

    const { user, isLoaded } =
        useUser();

    const router =
        useRouter();


    useEffect(() => {

        if (!isLoaded) return;


        if (!user) {

            router.replace(
                "/sign-in"
            );

            return;
        }


        const email =
            user.primaryEmailAddress
                ?.emailAddress
                ?.toLowerCase();


        const doctorEmails =
            process.env
                .NEXT_PUBLIC_DOCTOR_EMAILS
                ?.split(",")

                .map(
                    email =>
                        email.trim().toLowerCase()
                )

            || [];


        const role =
            doctorEmails.includes(email)

                ? "doctor"

                : "patient";


        if (
            role !== requiredRole
        ) {

            router.replace(
                `/${role}/dashboard`
            )

        }

    },
        [
            isLoaded,
            user,
            requiredRole,
            router
        ])


    if (
        !isLoaded
    ) {

        return (

            <div className="
min-h-screen
bg-background
flex
items-center
justify-center
">

                <LoadingSpinner
                    size="lg"
                    label="Checking access..."
                />

            </div>

        )

    }


    return <>{children}</>

}