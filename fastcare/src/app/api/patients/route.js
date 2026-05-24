import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAlerts } from "../../../services/alertService.js";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const severity = searchParams.get("severity") || "";
    const reviewed = searchParams.get("reviewed") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const result = await getAlerts({ severity, reviewed, page, limit });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[Alerts API] GET Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
