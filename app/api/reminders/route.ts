import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";

const roomsFile = path.join(process.cwd(), "data", "rooms.json");

function readRooms() {
  if (!fs.existsSync(roomsFile)) return [];
  return JSON.parse(fs.readFileSync(roomsFile, "utf-8"));
}

export async function GET() {
  const rooms = readRooms();
  const today = new Date().toISOString().split("T")[0];

  const dueRooms = rooms.filter(
    (r: any) => r.booking && r.booking.checkOut === today
  );

  if (dueRooms.length === 0)
    return NextResponse.json({ message: "No checkouts today" });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  for (const room of dueRooms) {
    await transporter.sendMail({
      from: `"12th April Resort" <${process.env.GMAIL_USER}>`,
      to: process.env.RECEIVER_EMAIL || process.env.GMAIL_USER,
      subject: `Check-out Reminder — Room ${room.id}`,
      text: `Guest ${room.booking.name} is due to check out today (${room.booking.checkOut}). Please prepare for room inspection.`,
    });
  }

  return NextResponse.json({ sent: dueRooms.length });
}