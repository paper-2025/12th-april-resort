// app/api/rooms/status/route.ts
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const roomsFile = path.join(process.cwd(), "data", "rooms.json");

function readRooms() {
  return JSON.parse(fs.readFileSync(roomsFile, "utf-8"));
}
function writeRooms(data: any) {
  fs.writeFileSync(roomsFile, JSON.stringify(data, null, 2));
}

export async function POST(req: Request) {
  try {
    const { roomId, status } = await req.json();

    const allowed = ["available", "occupied", "under maintenance"];
    if (!allowed.includes(String(status))) {
      return NextResponse.json({ success: false, message: "Invalid status" }, { status: 400 });
    }

    const rooms = readRooms();
    const room = rooms.find((r: any) => r.id === String(roomId));
    if (!room) {
      return NextResponse.json({ success: false, message: "Room not found" }, { status: 404 });
    }

    room.status = String(status);
    writeRooms(rooms);

    return NextResponse.json({
      success: true,
      message: "Room " + String(roomId) + " status updated to " + String(status),
    });
  } catch (err: any) {
    const msg = err?.message ? String(err.message) : String(err);
    console.error("Update status error:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}