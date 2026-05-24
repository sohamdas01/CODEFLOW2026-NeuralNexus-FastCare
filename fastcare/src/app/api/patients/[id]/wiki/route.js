// import { NextResponse } from "next/server";
// import { auth } from "@clerk/nextjs/server";
// import { connectDB } from "../../../../../lib/mongodb.js";
// import Summary from "../../../../../models/Summary.js";

// export const dynamic = "force-dynamic";

// export async function GET(request, { params }) {
//   try {
//     const { userId } = auth();
//     if (!userId) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     await connectDB();

//     const wiki = await Summary.findOne({ patientId: params.id }).lean();

//     if (!wiki) {
//       return NextResponse.json({
//         wiki: {
//           conditions: [],
//           medications: [],
//           surgeries: [],
//           allergies: [],
//           labValues: [],
//           contradictions: [],
//           criticalFlags: [],
//           aiSummary: "",
//           lastUpdated: null,
//         },
//       });
//     }

//     return NextResponse.json({ wiki });
//   } catch (error) {
//     console.error("[Wiki API] Error:", error.message);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }



import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import Summary from "@/models/Summary";
import Patient from "@/models/Patient";

export async function GET(req, { params }) {
  try {
    const { userId } = auth();
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