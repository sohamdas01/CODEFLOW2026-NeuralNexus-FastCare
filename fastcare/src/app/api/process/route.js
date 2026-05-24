import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import MedicalRecord from "@/models/MedicalRecord";
import Patient from "@/models/Patient";
import { processWithNLP } from "@/services/processingService";

export async function POST(request) {
  let recordId = null;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    recordId = body.recordId;
    const patientId = body.patientId;

    if (!recordId) {
      return NextResponse.json({ error: "recordId is required" }, { status: 400 });
    }

    const record = await MedicalRecord.findById(recordId);
    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    const patient = await Patient.findById(patientId || record.patientId);
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // We fetch the PDF from Cloudinary into a blob/file format for processWithNLP
    console.log(`[Process] Downloading PDF from: ${record.cloudinaryUrl}`);
    const response = await fetch(record.cloudinaryUrl);
    if (!response.ok) {
      throw new Error(`Failed to download PDF from Cloudinary. Status: ${response.status} ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    
    // Mocking the File object as processingService expects an array of files with .arrayBuffer()
    const mockFile = {
      name: "document.pdf",
      arrayBuffer: async () => arrayBuffer,
    };

    // Run the actual NLP processing pipeline asynchronously so we don't block the frontend response
    processWithNLP(recordId, patient, [mockFile]).catch(err => {
      console.error("[Process API Background] Error processing NLP:", err);
    });

    return NextResponse.json({ success: true, message: "Processing started" });
  } catch (error) {
    console.error("[Process API] Error:", error);
    if (recordId) {
      await MedicalRecord.findByIdAndUpdate(recordId, {
        processingStatus: "failed",
        processingError: error.message,
      });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
