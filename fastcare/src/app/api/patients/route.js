import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import Patient from "@/models/Patient";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.isDoctor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const riskLevel = searchParams.get("riskLevel") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const skip = (page - 1) * limit;

    const query = {};
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    if (riskLevel && riskLevel !== "all") {
      query.riskLevel = riskLevel;
    }

    // Sort priority mapping
    const sortPriority = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1
    };

    const patients = await Patient.aggregate([
      { $match: query },
      {
        $addFields: {
          sortRisk: {
            $switch: {
              branches: [
                { case: { $eq: ["$riskLevel", "critical"] }, then: 4 },
                { case: { $eq: ["$riskLevel", "high"] }, then: 3 },
                { case: { $eq: ["$riskLevel", "medium"] }, then: 2 },
                { case: { $eq: ["$riskLevel", "low"] }, then: 1 }
              ],
              default: 0
            }
          }
        }
      },
      { $sort: { sortRisk: -1, lastVisit: -1, createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]);

    const total = await Patient.countDocuments(query);

    return NextResponse.json({
      patients,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error("[Patients API] GET Error:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    const { name, email } = body;

    let patient = await Patient.findOne({ userId });

    if (!patient) {
      patient = await Patient.create({
        userId,
        name: name || session.user.name || "Patient",
        email: email || session.user.email || "",
      });
    }

    return NextResponse.json({ patient });
  } catch (error) {
    console.error("[Patients API] POST Error:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}