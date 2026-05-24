// import { auth } from "@clerk/nextjs/server";
// import connectDB from "@/lib/mongodb";
// import Patient from "@/models/Patient";
// import MedicalRecord from "@/models/MedicalRecord";
// import { processWithNLP } from "@/services/processingService";

// export async function POST(req) {
//   try {
//     const { userId } = auth();
//     if (!userId) {
//       return Response.json(
//         { error: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     await connectDB();

//     const patient = await Patient.findOne({ clerkId: userId });
//     if (!patient) {
//       return Response.json(
//         { error: "Patient not found" },
//         { status: 404 }
//       );
//     }

//     const formData = await req.formData();
//     const files = formData.getAll("files");
//     const reportType = formData.get("reportType") || "other";

//     if (!files || files.length === 0) {
//       return Response.json(
//         { error: "No files uploaded" },
//         { status: 400 }
//       );
//     }

//     // Create record in DB
//     const record = await MedicalRecord.create({
//       patientId: patient._id,
//       publicId: `record_${Date.now()}`,
//       reportType,
//       processingStatus: "uploading",
//       uploadedBy: userId,
//       recordDate: new Date(),
//     });

//     // Fire and forget — dont await
//     processWithNLP(record._id, patient, files).catch(
//       err => console.error("Background processing failed:", err)
//     );

//     return Response.json({
//       success: true,
//       recordId: record._id,
//     });

//   } catch (err) {
//     console.error("Upload route error:", err);
//     return Response.json(
//       { error: err.message },
//       { status: 500 }
//     );
//   }
// }

import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import Patient from "@/models/Patient";
import MedicalRecord from "@/models/MedicalRecord";
import { processWithNLP } from "@/services/processingService";

export async function POST(req) {
  try {
    const { userId } = auth();
    if (!userId) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const patient = await Patient.findOne({ clerkId: userId });
    if (!patient) {
      return Response.json(
        { error: "Patient not found" },
        { status: 404 }
      );
    }

    const formData = await req.formData();
    const files = formData.getAll("files");
    const reportType = formData.get("reportType") || "other";

    if (!files || files.length === 0) {
      return Response.json(
        { error: "No files uploaded" },
        { status: 400 }
      );
    }

    // Create record in DB
    const record = await MedicalRecord.create({
      patientId: patient._id,
      publicId: `record_${Date.now()}`,
      reportType,
      processingStatus: "uploading",
      uploadedBy: userId,
      recordDate: new Date(),
    });

    // Fire and forget — dont await
    processWithNLP(record._id, patient, files).catch(
      err => console.error("Background processing failed:", err)
    );

    return Response.json({
      success: true,
      recordId: record._id,
    });

  } catch (err) {
    console.error("Upload route error:", err);
    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  }
}