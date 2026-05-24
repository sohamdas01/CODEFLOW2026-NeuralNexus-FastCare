import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "../../../../lib/mongodb.js";
import Patient from "../../../../models/Patient.js";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const patient = await Patient.findById(params.id).lean();

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    return NextResponse.json({ patient });
  } catch (error) {
    console.error("[Patient API] GET Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const allowedFields = ["name", "dob", "bloodGroup", "emergencyContact", "age"];

    const update = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        update[field] = body[field];
      }
    }

    const patient = await Patient.findByIdAndUpdate(
      params.id,
      { $set: update },
      { new: true, runValidators: true }
    ).lean();

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    return NextResponse.json({ patient });
  } catch (error) {
    console.error("[Patient API] PATCH Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
