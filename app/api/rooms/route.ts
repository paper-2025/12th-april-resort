import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// --------------------- TYPES -------------------
type Guest = {
  name: string;
  email: string;
  phone: string;
  address?: string;
  checkIn: string;
  checkOut: string;
};

type RoomStatus = "Available" | "Pending" | "Occupied" | "Under Maintenance";

type Room = {
  id: string;
  status: RoomStatus;
  guest?: Guest;
  prices: {
    weekday: number;
    weekend: number;
  };
};

// --------------------- UPSTASH SETTINGS -------------------
const UPS_URL = process.env.UPSTASH_REDIS_REST_URL!;
const UPS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN!;

// --------------------- REDIS HELPERS -------------------
async function upstashGet(key: string): Promise<string | null> {
  try {
    const res = await fetch(`${UPS_URL}/get/${key}`, {
      headers: { Authorization: `Bearer ${UPS_TOKEN}` },
      cache: "no-store",
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.result ?? null;
  } catch {
    return null;
  }
}

async function upstashSet(key: string, value: string): Promise<void> {
  await fetch(`${UPS_URL}/set/${key}/${encodeURIComponent(value)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${UPS_TOKEN}` },
  });
}

// --------------------- ROOM TYPE HELPERS -------------------
const doubleRooms = [
  "1204", "1214", "1222", "1210",
  "1203", "1225", "1227", "1208",
  "1205", "1223", "1220", "1218", "1219",
];

function getRoomPrices(id: string) {
  if (id.startsWith("S")) {
    return { weekday: 35000, weekend: 30000 };
  }
  if (doubleRooms.includes(id)) {
    return { weekday: 24000, weekend: 20000 };
  }
  return { weekday: 20000, weekend: 18000 }; // single rooms
}

// --------------------- SEED CLEAN ROOMS -------------------
async function seedRooms(): Promise<Room[]> {
  const rooms: Room[] = [];

  for (let i = 1202; i <= 1227; i++) {
    const id = String(i);
    rooms.push({
      id,
      status: "Available",
      guest: undefined,
      prices: getRoomPrices(id),
    });
  }

  // Suites
  ["S1", "S2"].forEach((id) =>
    rooms.push({
      id,
      status: "Available",
      guest: undefined,
      prices: { weekday: 35000, weekend: 30000 },
    })
  );

  await upstashSet("rooms", JSON.stringify(rooms));
  return rooms;
}

// --------------------- VALIDATION -------------------
function validateRooms(data: any): data is Room[] {
  if (!Array.isArray(data)) return false;

  return data.every((room) => {
    return (
      typeof room.id === "string" &&
      typeof room.status === "string" &&
      room.prices &&
      typeof room.prices.weekday === "number" &&
      typeof room.prices.weekend === "number"
    );
  });
}

// --------------------- GET ROOMS -------------------
async function getRooms(): Promise<Room[]> {
  const raw = await upstashGet("rooms");
  if (!raw) return await seedRooms();

  try {
    const parsed = JSON.parse(raw);
    if (!validateRooms(parsed)) return await seedRooms();
    return parsed;
  } catch {
    return await seedRooms();
  }
}

// --------------------- SAVE ROOMS -------------------
async function saveRooms(rooms: Room[]) {
  await upstashSet("rooms", JSON.stringify(rooms));
}

// --------------------- EMAIL -------------------
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

// ======================================================
//  GET — return all rooms
// ======================================================
export async function GET() {
  const rooms = await getRooms();
  return NextResponse.json({ success: true, rooms });
}

// ======================================================
//  POST — New Booking
// ======================================================
export async function POST(req: Request) {
  try {
    const { roomId, name, email, phone, address, checkIn, checkOut } =
      await req.json();

    const rooms = await getRooms();
    const room = rooms.find((r) => r.id === String(roomId));

    if (!room)
      return NextResponse.json({ success: false, message: "Room not found" });

    if (room.status !== "Available") {
      return NextResponse.json({
        success: false,
        message: `Room is ${room.status}`,
      });
    }

    // Check-in must be today
    const today = new Date().toISOString().split("T")[0];
    if (checkIn !== today) {
      return NextResponse.json({
        success: false,
        message: `Check-in must be today (${today})`,
      });
    }

    room.status = "Pending";
    room.guest = { name, email, phone, address, checkIn, checkOut };

    await saveRooms(rooms);

    const receptionist = process.env.RECEIVER_EMAIL || process.env.GMAIL_USER;

    await sendEmail(
      receptionist!,
      `New Booking Request – Room ${roomId}`,
      `<h2>New Booking Request</h2>
       <p>A new guest booked room <b>${roomId}</b>.</p>`
    );

    return NextResponse.json({
      success: true,
      message: "Request sent for verification",
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: "Booking failed",
      error: err.message,
    });
  }
}

// ======================================================
//  PATCH — Update Room Status
// ======================================================
export async function PATCH(req: Request) {
  try {
    const { roomId, status } = await req.json();

    const rooms = await getRooms();
    const room = rooms.find((r) => r.id === String(roomId));

    if (!room)
      return NextResponse.json({ success: false, message: "Room not found" });

    const previous = room.status;
    room.status = status;

    // Confirm
    if (previous === "Pending" && status === "Occupied" && room.guest) {
      await sendEmail(
        room.guest.email,
        `Booking Confirmed – Room ${roomId}`,
        `<h2>Your booking is confirmed!</h2>`
      );
    }

    // Reject
    if (previous === "Pending" && status === "Available" && room.guest) {
      await sendEmail(
        room.guest.email,
        `Booking Rejected – Room ${roomId}`,
        `<h2>Your booking was not approved.</h2>`
      );
      room.guest = undefined;
    }

    // Maintenance → Available
    if (previous === "Under Maintenance" && status === "Available") {
      room.guest = undefined;
    }

    await saveRooms(rooms);

    return NextResponse.json({
      success: true,
      message: "Room updated",
      room,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: "Update failed",
      error: err.message,
    });
  }
}
