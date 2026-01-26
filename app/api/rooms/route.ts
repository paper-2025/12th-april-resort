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
// ✅ Supports BOTH KV_* and UPSTASH_* env names
const UPS_URL =
  process.env.KV_REST_API_URL ||
  process.env.UPSTASH_REDIS_REST_URL ||
  process.env.UPSTASH_REDIS_REST_ENDPOINT ||
  "";

const UPS_TOKEN =
  process.env.KV_REST_API_TOKEN ||
  process.env.UPSTASH_REDIS_REST_TOKEN ||
  "";

// ✅ ENV ASSERT (prevents "undefined/set/...")
function assertUpstashEnv() {
  if (!UPS_URL || !UPS_TOKEN) {
    throw new Error(
      `Missing Upstash env vars.
KV_REST_API_URL? ${Boolean(process.env.KV_REST_API_URL)}
KV_REST_API_TOKEN? ${Boolean(process.env.KV_REST_API_TOKEN)}
UPSTASH_REDIS_REST_URL? ${Boolean(process.env.UPSTASH_REDIS_REST_URL)}
UPSTASH_REDIS_REST_TOKEN? ${Boolean(process.env.UPSTASH_REDIS_REST_TOKEN)}
UPSTASH_REDIS_REST_ENDPOINT? ${Boolean(process.env.UPSTASH_REDIS_REST_ENDPOINT)}`
    );
  }
}

// --------------------- REDIS HELPERS -------------------
async function upstashGet(key: string): Promise<string | null> {
  assertUpstashEnv();

  try {
    const res = await fetch(`${UPS_URL}/get/${key}`, {
      headers: { Authorization: `Bearer ${UPS_TOKEN}` },
      cache: "no-store",
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.result ?? null;
  } catch (e: any) {
    console.error("Upstash GET failed:", e?.message || e);
    return null;
  }
}

async function upstashSet(key: string, value: string): Promise<void> {
  assertUpstashEnv();

  try {
    const res = await fetch(`${UPS_URL}/set/${key}/${encodeURIComponent(value)}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${UPS_TOKEN}` },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Upstash SET failed (${res.status}): ${text}`);
    }
  } catch (e: any) {
    console.error("Upstash SET failed:", e?.message || e);
    throw new Error(e?.message || "Upstash SET failed");
  }
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
  return { weekday: 20000, weekend: 18000 };
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

  return data.every(
    (room) =>
      typeof room.id === "string" &&
      typeof room.status === "string" &&
      room.prices &&
      typeof room.prices.weekday === "number" &&
      typeof room.prices.weekend === "number"
  );
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
  try {
    const rooms = await getRooms();
    return NextResponse.json({ success: true, rooms });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to fetch rooms" },
      { status: 500 }
    );
  }
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
      return NextResponse.json(
        { success: false, message: "Room not found" },
        { status: 404 }
      );

    if (room.status !== "Available") {
      return NextResponse.json(
        { success: false, message: `Room is ${room.status}` },
        { status: 400 }
      );
    }

    const today = new Date().toISOString().split("T")[0];
    if (checkIn !== today) {
      return NextResponse.json(
        { success: false, message: `Check-in must be today (${today})` },
        { status: 400 }
      );
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
    return NextResponse.json(
      {
        success: false,
        message: "Booking failed",
        error: err?.message || String(err),
      },
      { status: 500 }
    );
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
      return NextResponse.json(
        { success: false, message: "Room not found" },
        { status: 404 }
      );

    const previous = room.status;
    room.status = status;

    if (previous === "Pending" && status === "Occupied" && room.guest) {
      await sendEmail(
        room.guest.email,
        `Booking Confirmed – Room ${roomId}`,
        `<h2>Your booking is confirmed!</h2>`
      );
    }

    if (previous === "Pending" && status === "Available" && room.guest) {
      await sendEmail(
        room.guest.email,
        `Booking Rejected – Room ${roomId}`,
        `<h2>Your booking was not approved.</h2>`
      );
      room.guest = undefined;
    }

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
    return NextResponse.json(
      {
        success: false,
        message: "Update failed",
        error: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}
