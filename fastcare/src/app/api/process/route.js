import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "../../../lib/mongodb.js";
import MedicalRecord from "../../../models/MedicalRecord.js";
import { processRecord } from "../../../services/processingService.js";
import axios from "axios";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";


export async function POST(request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { recordId } = await request.json();
    if (!recordId) {
      return NextResponse.json({ error: "recordId is required" }, { status: 400 });
    }

    const record = await MedicalRecord.findById(recordId);
    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    // Re-fetch the PDF from Cloudinary to get the buffer
    if (!record.cloudinaryUrl) {
      return NextResponse.json({ error: "No Cloudinary URL on record" }, { status: 400 });
    }

    const pdfResponse = await axios.get(record.cloudinaryUrl, {
      responseType: "arraybuffer",
      timeout: 30000,
    });
    const pdfBuffer = Buffer.from(pdfResponse.data);

    // Reset status to pending
    await MedicalRecord.findByIdAndUpdate(recordId, {
      processingStatus: "pending",
      processingError: null,
    });

    // Trigger async processing
    setImmediate(() => {
      processRecord(recordId, pdfBuffer).catch((err) => {
        console.error(`[Process Route] Re-processing failed for ${recordId}:`, err.message);
      });
    });

    return NextResponse.json({ message: "Processing re-triggered", recordId });
  } catch (error) {
    console.error("[Process Route] Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
