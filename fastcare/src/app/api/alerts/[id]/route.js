import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { markReviewed } from "../../../../services/alertService.js";

export const dynamic = "force-dynamic";

export async function PATCH(request, { params }) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    if (!body.reviewed) {
      return NextResponse.json({ error: "reviewed field required" }, { status: 400 });
    }

    const alert = await markReviewed(params.id);

    return NextResponse.json({ alert });
  } catch (error) {
    console.error("[Alert PATCH] Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
