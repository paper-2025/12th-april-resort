import { NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";

export async function POST() {
  const redis = getRedis();

  const rooms: any[] = [];
  for (let n = 1202; n <= 1227; n++) {
    rooms.push({ id: String(n), status: "Available" });
  }
  rooms.push({ id: "S1", status: "Available" });
  rooms.push({ id: "S2", status: "Available" });

  await redis.set("rooms", JSON.stringify(rooms));
  return NextResponse.json({ success: true, count: rooms.length });
}