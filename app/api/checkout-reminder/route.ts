import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPS_URL = process.env.UPSTASH_REDIS_REST_URL!;
const UPS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN!;

async function upstashGet(key: string): Promise<string | null> {
  const res = await fetch(`${UPS_URL}/get/${key}`, {
    headers: { Authorization: `Bearer ${UPS_TOKEN}` },
    cache: "no-store",
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.result ?? null;
}

async function getRooms() {
  const raw = await upstashGet("rooms");
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function sendEmail(to: string, subject: string, html: string) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"12th April Resort" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });
}

export async function GET() {
  const rooms = await getRooms();
  const today = new Date().toISOString().split("T")[0];

  const receptionist = process.env.RECEIVER_EMAIL || process.env.GMAIL_USER;

  const dueRooms = rooms.filter(
    (room: any) =>
      room.status === "Occupied" &&
      room.guest?.checkOut === today
  );

  for (const r of dueRooms) {
    await sendEmail(
      receptionist!,
      `Checkout Reminder – Room ${r.id}`,
      `
      <h2>Checkout Reminder</h2>
      <p>This guest is scheduled to checkout today at 10AM:</p>
      <ul>
        <li><strong>Room:</strong> ${r.id}</li>
        <li><strong>Name:</strong> ${r.guest.name}</li>
        <li><strong>Email:</strong> ${r.guest.email}</li>
        <li><strong>Phone:</strong> ${r.guest.phone}</li>
        <li><strong>Check-In:</strong> ${r.guest.checkIn}</li>
        <li><strong>Check-Out:</strong> ${r.guest.checkOut}</li>
      </ul>
      `
    );
  }

  return NextResponse.json({
    success: true,
    sent: dueRooms.length,
  });
}
