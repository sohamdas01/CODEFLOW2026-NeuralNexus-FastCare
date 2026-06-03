import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { name, email, password, isDoctor } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    await connectDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let finalIsDoctor = isDoctor || false;
    if (finalIsDoctor) {
      const allowedEmails = (process.env.NEXT_PUBLIC_DOCTOR_EMAILS || "")
        .split(",")
        .map((e) => e.trim().toLowerCase());
      
      if (!allowedEmails.includes(email.toLowerCase())) {
        finalIsDoctor = false;
      }
    }

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isDoctor: finalIsDoctor,
    });

    return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "An error occurred during registration" }, { status: 500 });
  }
}