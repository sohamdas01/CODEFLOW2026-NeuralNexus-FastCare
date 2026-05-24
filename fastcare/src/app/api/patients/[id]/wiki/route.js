import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import Summary from "@/models/Summary";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const summary = await Summary.findOne({
      patientId: id,
    });

    if (!summary) {
      return NextResponse.json({
        wiki: null,
        message: "No records processed yet",
      });
    }

    return NextResponse.json({ wiki: summary });

  } catch (err) {
    console.error("[Wiki API] Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}