import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import MedicalRecord from "@/models/MedicalRecord";
import Patient from "@/models/Patient";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const formData = await request.formData();
    const file = formData.get("file");
    const reportType = formData.get("reportType");
    const patientId = formData.get("patientId");

    if (!file || !patientId) {
      return NextResponse.json({ error: "File and patientId are required" }, { status: 400 });
    }

    const fileBuffer = await file.arrayBuffer();
    const mimeType = file.type;
    const encoding = "base64";
    const base64Data = Buffer.from(fileBuffer).toString("base64");
    const fileUri = "data:" + mimeType + ";" + encoding + "," + base64Data;

    const uploadResult = await cloudinary.uploader.upload(fileUri, {
      folder: "medical-records",
      resource_type: "auto",
    });

    const newRecord = await MedicalRecord.create({
      patientId,
      cloudinaryUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      reportType,
      uploadedBy: session.user.id,
      processingStatus: 'uploading',
    });

    await Patient.findByIdAndUpdate(patientId, {
      $inc: { recordCount: 1 },
      $set: { lastVisit: new Date() },
    });

    return NextResponse.json({ recordId: newRecord._id });
  } catch (error) {
    console.error("[Upload API] POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
