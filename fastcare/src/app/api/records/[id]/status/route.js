import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "../../../../../lib/mongodb.js";
import MedicalRecord from "../../../../../models/MedicalRecord.js";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const record = await MedicalRecord.findById(params.id)
      .select("processingStatus processingError reportType recordDate")
      .lean();

    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    return NextResponse.json({
      processingStatus: record.processingStatus,
      processingError: record.processingError || null,
      reportType: record.reportType,
      recordDate: record.recordDate,
    });
  } catch (error) {
    console.error("[Record Status] Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
