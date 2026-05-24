// import { NextResponse } from "next/server";
// import { auth } from "@clerk/nextjs/server";
// import { getAlerts } from "../../../services/alertService.js";

// export const dynamic = "force-dynamic";

// export async function GET(request) {
//   try {
//     const { userId } = auth();
//     if (!userId) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const { searchParams } = new URL(request.url);
//     const severity = searchParams.get("severity") || "";
//     const reviewed = searchParams.get("reviewed") || "";
//     const page = parseInt(searchParams.get("page") || "1", 10);
//     const limit = parseInt(searchParams.get("limit") || "20", 10);

//     const result = await getAlerts({ severity, reviewed, page, limit });

//     return NextResponse.json(result);
//   } catch (error) {
//     console.error("[Alerts API] GET Error:", error.message);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb.js";
import User from "@/models/User";
import Patient from "@/models/Patient";

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    const patients = await Patient.find({}).sort({ createdAt: -1 });

    return Response.json({ patients });
  } catch (err) {
    console.error("GET /api/patients error:", err);
    return Response.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

// POST → get or create patient profile (patient)
export async function POST(req) {
  try {
    const { userId } = auth();
    if (!userId) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { name, email } = await req.json();

    await connectDB();

    // Check if patient already exists
    let patient = await Patient.findOne({ clerkId: userId });

    if (!patient) {
      // Create new patient
      patient = await Patient.create({
        clerkId: userId,
        name: name || "Patient",
        email: email || "",
        riskLevel: "low",
        recordCount: 0,
      });
    }

    return Response.json({ patient });
  } catch (err) {
    console.error("POST /api/patients error:", err);
    return Response.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}