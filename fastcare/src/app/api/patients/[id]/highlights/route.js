import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "../../../../../lib/mongodb.js";
import Summary from "../../../../../models/Summary.js";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const summary = await Summary.findOne({ patientId: params.id })
      .select("criticalFlags contradictions lastUpdated")
      .lean();

    if (!summary) {
      return NextResponse.json({
        criticalFlags: [],
        contradictions: [],
        lastUpdated: null,
      });
    }

    return NextResponse.json({
      criticalFlags: summary.criticalFlags || [],
      contradictions: summary.contradictions || [],
      lastUpdated: summary.lastUpdated,
    });
  } catch (error) {
    console.error("[Highlights API] Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
