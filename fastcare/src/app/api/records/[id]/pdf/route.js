import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import MedicalRecord from "@/models/MedicalRecord";
import { connectDB } from "@/lib/mongodb";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectDB();
    const record = await MedicalRecord.findById(params.id);
    if (!record || !record.cloudinaryUrl) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const response = await fetch(record.cloudinaryUrl);
    if (!response.ok) {
      return new NextResponse("Failed to fetch PDF", { status: response.status });
    }

    return new NextResponse(response.body, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="record-${record._id}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF proxy error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
