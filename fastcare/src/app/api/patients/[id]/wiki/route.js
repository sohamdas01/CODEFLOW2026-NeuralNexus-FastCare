import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "../../../../../lib/mongodb.js";
import Summary from "../../../../../models/Summary.js";

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