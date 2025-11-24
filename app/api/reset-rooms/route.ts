import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";  // same redis connection file

// ----------------------
// ROOM TYPE DEFINITIONS
// ----------------------

const doubleRooms = [
  "1204", "1214", "1222", "1210",
  "1203", "1225", "1227", "1208",
  "1205", "1223", "1220", "1218", "1219"
];

function generateRooms() {
  const rooms: any[] = [];

  for (let i = 1202; i <= 1227; i++) {
    const id = String(i);

    // Skip numbers if they do NOT exist in your building
    // (you can add more skips here if necessary)
    if (["1211", "1212", "1213", "1215", "1216", "1217", "1224"].includes(id)) {
      continue;
    }

    // Determine room type
    const isDouble = doubleRooms.includes(id);
    const type = isDouble ? "Double" : "Single";

    // Assign pricing
    const weekdayPrice = isDouble ? 24000 : 20000;
    const weekendPrice = isDouble ? 20000 : 18000;

    // Assign image
    const image = isDouble
      ? "/images/double-placeholder.jpg"
      : "/images/single-placeholder.jpg";

    rooms.push({
      id,
      type,
      weekdayPrice,
      weekendPrice,
      image,
      status: "Available",
      guest: null,
    });
  }

  // ---- SUITES ----
  rooms.push({
    id: "S1",
    type: "Suite",
    weekdayPrice: 35000,
    weekendPrice: 30000,
    image: "/images/suite-placeholder.jpg",
    status: "Available",
    guest: null,
  });

  rooms.push({
    id: "S2",
    type: "Suite",
    weekdayPrice: 35000,
    weekendPrice: 30000,
    image: "/images/suite-placeholder.jpg",
    status: "Available",
    guest: null,
  });

  return rooms;
}

export async function GET() {
  try {
    // erase old broken data
    await redis.del("rooms");

    // generate clean new data
    const freshRooms = generateRooms();

    await redis.set("rooms", JSON.stringify(freshRooms));

    return NextResponse.json({
      success: true,
      message: "All rooms reset successfully.",
      rooms: freshRooms,
    });
  } catch (err: any) {
    console.error("RESET ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Reset failed", error: err.message },
      { status: 500 }
    );
  }
}