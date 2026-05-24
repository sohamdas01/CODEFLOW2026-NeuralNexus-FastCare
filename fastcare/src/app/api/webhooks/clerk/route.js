
import { Webhook } from "svix";
import { headers } from "next/headers";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return Response.json(
      { error: "No webhook secret" },
      { status: 500 }
    );
  }

  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return Response.json(
      { error: "Missing headers" },
      { status: 400 }
    );
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    return Response.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  const eventType = evt.type;
  const { id, email_addresses, first_name, last_name } = evt.data;

  await connectDB();

  if (eventType === "user.created") {
    const email = email_addresses[0]?.email_address;
    const name = `${first_name || ""} ${last_name || ""}`.trim();

    const existing = await User.findOne({ clerkId: id });

    if (!existing) {
      await User.create({
        clerkId: id,
        email: email || "",
        name: name || "User",
        isDoctor: false,
      });
      console.log("User created in MongoDB:", email);
    }
  }

  if (eventType === "user.deleted") {
    await User.findOneAndDelete({ clerkId: id });
    console.log("User deleted from MongoDB:", id);
  }

  return Response.json(
    { message: "ok" },
    { status: 200 }
  );
}