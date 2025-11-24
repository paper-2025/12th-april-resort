import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export async function GET() {
  const rooms = await kv.get("rooms");
  return NextResponse.json(rooms);
}