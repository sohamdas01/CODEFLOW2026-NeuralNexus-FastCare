import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "../../../../../lib/mongodb.js";
import MedicalRecord from "../../../../../models/MedicalRecord.js";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get("reportType") || "";
    const { id } = await params;
    const query =  { patientId: id };
    if (reportType && reportType !== "all") {
      query.reportType = reportType;
    }

    const records = await MedicalRecord.find(query)
      .select(
        "reportType recordDate processingStatus structuredData nerOutput cloudinaryUrl createdAt"
      )
      .sort({ recordDate: -1 })
      .lean();

    return NextResponse.json({ records });
  } catch (error) {
    console.error("[Timeline API] Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
