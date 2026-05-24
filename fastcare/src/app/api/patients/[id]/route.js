import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "../../../../lib/mongodb.js";
import Patient from "../../../../models/Patient.js";

// export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

//     await connectDB();

//     const patient = await Patient.findById(params.id).lean();

//     if (!patient) {
//       return NextResponse.json({ error: "Patient not found" }, { status: 404 });
//     }

//     return NextResponse.json({ patient });
//   } catch (error) {
//     console.error("[Patient API] GET Error:", error.message);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

// export async function PATCH(request, { params }) {
//   try {
//     const { userId } = auth();
//     if (!userId) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     await connectDB();

//     const body = await request.json();
//     const allowedFields = ["name", "dob", "bloodGroup", "emergencyContact", "age"];

//     const update = {};
//     for (const field of allowedFields) {
//       if (body[field] !== undefined) {
//         update[field] = body[field];
//       }
//     }

//     const patient = await Patient.findByIdAndUpdate(
//       params.id,
//       { $set: update },
//       { new: true, runValidators: true }
//     ).lean();

//     if (!patient) {
//       return NextResponse.json({ error: "Patient not found" }, { status: 404 });
//     }

//     return NextResponse.json({ patient });
//   } catch (error) {
//     console.error("[Patient API] PATCH Error:", error.message);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }


import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import Summary from "@/models/Summary";
import Patient from "@/models/Patient";

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const summary = await Summary.findOne({
      patientId: params.id,
    });

    if (!summary) {
      return Response.json({
        wiki: null,
        message: "No records processed yet",
      });
    }

    return Response.json({ wiki: summary });

  } catch (err) {
    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  }
}