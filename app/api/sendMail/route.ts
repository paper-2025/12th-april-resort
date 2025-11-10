import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    // Create reusable transporter using Gmail + App Password
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Send the mail
    await transporter.sendMail({
      from: `"12th April Resort" <${process.env.GMAIL_USER}>`,
      to: process.env.RECEIVER_EMAIL || process.env.GMAIL_USER, // who receives it
      subject: `New message from ${name}`,
      text: `From: ${name} (${email})\n\n${message}`,
    });

    console.log("✅ Email sent successfully");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ Mail send error:", error.message || error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}