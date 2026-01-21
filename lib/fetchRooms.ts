// src/lib/fetchRooms.ts

export type Guest = {
  name: string;
  email: string;
  phone: string;
  address?: string;
  checkIn: string;
  checkOut: string;
};

export type RoomStatus = "Available" | "Pending" | "Occupied" | "Under Maintenance";

export type Room = {
  id: string;
  status: RoomStatus;
  guest?: Guest;
  prices: {
    weekday: number;
    weekend: number;
  };
};

export type RoomsResponse =
  | { success: true; rooms: Room[] }
  | { success: false; message: string; error?: string };

export async function fetchRooms(): Promise<RoomsResponse> {
  const res = await fetch("/api/rooms", {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  // ✅ Read raw text first, because res.json() crashes on empty / non-json responses
  const text = await res.text();

  // If server returned an error page or empty body, give a helpful message
  if (!res.ok) {
    return {
      success: false,
      message: `Failed to fetch rooms (HTTP ${res.status})`,
      error: text || "Empty response body",
    };
  }

  if (!text) {
    return {
      success: false,
      message: "Empty response body from /api/rooms",
    };
  }

  try {
    const data = JSON.parse(text) as RoomsResponse;

    // Basic sanity check (optional but useful)
    if (typeof (data as any)?.success !== "boolean") {
      return {
        success: false,
        message: "Invalid JSON shape returned from /api/rooms",
        error: text,
      };
    }

    return data;
  } catch (err: any) {
    return {
      success: false,
      message: "Response was not valid JSON",
      error: err?.message || text,
    };
  }
}
