import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { redis } from "@/lib/redis";

export const runtime = "nodejs"; // required for nodemailer

// ---------------------- TYPES ---------------------- //
type RoomStatus = "Available" | "Pending" | "Occupied" | "Under Maintenance";

type Guest = {
  name: string;
  email: string;
  phone: string;
  address?: string;
  checkIn: string;  // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
};

type Room = {
  id: string;
  status: RoomStatus;
  guest?: Guest;
};

// -------------------- SEED ROOMS ------------------- //
function generateDefaultRooms(): Room[] {
  const rooms: Room[] = [];

  // Rooms 1202–1227
  for (let num = 1202; num <= 1227; num++) {
    rooms.push({
      id: String(num),
      status: "Available",
    });
  }

  // Suites
  rooms.push(
    { id: "Suite 1", status: "Available" },
    { id: "Suite 2", status: "Available" }
  );

  return rooms;
}

async function getRooms(): Promise<Room[]> {
  const stored = await redis.get<Room[]>("rooms");
  if (!stored || stored.length === 0) {
    const initial = generateDefaultRooms();
    await redis.set("rooms", initial);
    return initial;
  }
  return stored;
}

async function saveRooms(rooms: Room[]) {
  await redis.set("rooms", rooms);
}

// ------------------- EMAIL SENDER ------------------ //
async function sendEmail(to: string, subject: string, html: string) {
  try {
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
  } catch (err) {
    console.error("Email send failed:", err);
  }
}

// ------------------------ GET ---------------------- //
export async function GET() {
  const rooms = await getRooms();
  return NextResponse.json({ success: true, rooms });
}

// ------------------------ POST --------------------- //
// New booking – sets room to Pending and emails receptionist
export async function POST(req: Request) {
  try {
    const { roomId, name, email, phone, address, checkIn, checkOut } =
      (await req.json()) as {
        roomId: string;
        name: string;
        email: string;
        phone: string;
        address?: string;
        checkIn: string;
        checkOut: string;
      };

    const rooms = await getRooms();
    const room = rooms.find((r) => r.id === roomId);

    if (!room) {
      return NextResponse.json(
        { success: false, message: "Room not found" },
        { status: 404 }
      );
    }

    // Only allow from today forward
    const todayStr = new Date().toISOString().split("T")[0];
    if (checkIn < todayStr) {
      return NextResponse.json(
        { success: false, message: "Check-in cannot be before today." },
        { status: 400 }
      );
    }

    if (checkOut <= checkIn) {
      return NextResponse.json(
        { success: false, message: "Check-out must be after check-in." },
        { status: 400 }
      );
    }

    if (room.status !== "Available") {
      return NextResponse.json(
        { success: false, message: `Room is ${room.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    // Update room → Pending
    room.status = "Pending";
    room.guest = { name, email, phone, address, checkIn, checkOut };
    await saveRooms(rooms);

    // Email receptionist
    const receptionistEmail =
      process.env.RECEIVER_EMAIL || process.env.GMAIL_USER || "";
    if (receptionistEmail) {
      await sendEmail(
        receptionistEmail,
        `New Booking Request – Room ${roomId}`,
        `
        <div style="font-family: Arial, sans-serif; padding: 16px;">
          <h2>New Booking Request</h2>
          <p><strong>Room:</strong> ${roomId}</p>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Check-in:</strong> ${checkIn}</p>
          <p><strong>Check-out:</strong> ${checkOut}</p>
          <p><strong>Address:</strong> ${address || "-"}</p>
          <p>Please verify this booking in the Admin Panel.</p>
        </div>
        `
      );
    }

    return NextResponse.json({
      success: true,
      message: `Booking for Room ${roomId} sent for verification.`,
    });
  } catch (error: any) {
    console.error("POST /api/rooms error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Booking failed",
        error: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ----------------------- PATCH --------------------- //
// Update room status (Admin) – e.g. Pending → Occupied
export async function PATCH(req: Request) {
  try {
    const { roomId, status } = (await req.json()) as {
      roomId: string;
      status: RoomStatus;
    };

    const rooms = await getRooms();
    const room = rooms.find((r) => r.id === roomId);

    if (!room) {
      return NextResponse.json(
        { success: false, message: "Room not found" },
        { status: 404 }
      );
    }

    const prevStatus = room.status;
    room.status = status;
    await saveRooms(rooms);

    // If receptionist verifies Pending → Occupied, email guest
    if (prevStatus === "Pending" && status === "Occupied" && room.guest?.email) {
      const g = room.guest;
      await sendEmail(
        g.email,
        `Your Booking is Confirmed – Room ${roomId}`,
        `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Booking Confirmed</h2>
          <p>Dear ${g.name},</p>
          <p>Your booking at <strong>12th April Resort</strong> has been confirmed.</p>
          <p><strong>Room:</strong> ${roomId}</p>
          <p><strong>Check-in:</strong> ${g.checkIn}</p>
          <p><strong>Check-out:</strong> ${g.checkOut}</p>
          <p>We look forward to welcoming you.</p>
          <p style="margin-top: 16px; font-size: 12px; color: #666;">
            If you did not make this booking, please contact the resort immediately.
          </p>
        </div>
        `
      );
    }

    return NextResponse.json({
      success: true,
      message: `Room ${roomId} updated to ${status}`,
    });
  } catch (error: any) {
    console.error("PATCH /api/rooms error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update room",
        error: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
