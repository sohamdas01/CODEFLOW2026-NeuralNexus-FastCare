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

    const records = await MedicalRecord.find({ patientId: params.id })
      .select("cloudinaryUrl publicId reportType processingStatus recordDate createdAt uploadedBy")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ records });
  } catch (error) {
    console.error("[Records API] Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
