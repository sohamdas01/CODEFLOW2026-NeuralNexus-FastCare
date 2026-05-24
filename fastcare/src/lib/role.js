export function getRole(email) {

    const doctors =
        process.env
            .NEXT_PUBLIC_DOCTOR_EMAILS
            ?.split(",")

        || []

    return doctors.includes(
        email
    )
        ? "doctor"
        : "patient"

}