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

    if (!recordId) {
      return NextResponse.json({ error: "recordId is required" }, { status: 400 });
    }

    // Update status step by step
    await MedicalRecord.findByIdAndUpdate(recordId, { processingStatus: "extracting" });
    console.log(`[Process] ${recordId} -> extracting`);
    await new Promise(resolve => setTimeout(resolve, 2000));

    await MedicalRecord.findByIdAndUpdate(recordId, { processingStatus: "running_ner" });
    console.log(`[Process] ${recordId} -> running_ner`);
    await new Promise(resolve => setTimeout(resolve, 2000));

    await MedicalRecord.findByIdAndUpdate(recordId, { processingStatus: "structuring" });
    console.log(`[Process] ${recordId} -> structuring`);
    await new Promise(resolve => setTimeout(resolve, 2000));

    await MedicalRecord.findByIdAndUpdate(recordId, { processingStatus: "generating_summary" });
    console.log(`[Process] ${recordId} -> generating_summary`);
    await new Promise(resolve => setTimeout(resolve, 2000));

    await MedicalRecord.findByIdAndUpdate(recordId, { processingStatus: "completed" });
    console.log(`[Process] ${recordId} -> completed`);

    return NextResponse.json({ success: true });
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
