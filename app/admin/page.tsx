"use client";

import { useState, useEffect } from "react";

// Room type shared with RoomsPage
type Room = {
  id: string;
  status: "Available" | "Pending" | "Occupied" | "Under Maintenance";
  guest?: {
    name: string;
    phone: string;
    address?: string;
    checkIn?: string;
    checkOut?: string;
  };
};

export default function AdminPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ✅ Load rooms on mount
  useEffect(() => {
    fetchRooms();
  }, []);

  async function fetchRooms() {
    try {
      const res = await fetch("/api/rooms");
      const data = await res.json();
      if (data.success) setRooms(data.rooms);
    } catch (err) {
      console.error("Fetch rooms failed:", err);
    }
  }

  // ✅ Update room status (Verify, Reject, etc.)
  async function updateStatus(roomId: string, status: Room["status"]) {
    try {
      setLoading(true);
      setMessage("");

      const res = await fetch("/api/rooms", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, status }),
      });

      // Safely handle empty responses
      const text = await res.text();
      const data = text ? JSON.parse(text) : { success: false, message: "Empty response" };

      if (data.success) {
        setMessage(`✅ Room ${roomId} → ${status}`);
        fetchRooms(); // refresh data
      } else {
        setMessage(`❌ ${data.message || "Update failed"}`);
      }
    } catch (err) {
      console.error("Update error:", err);
      setMessage("❌ Network or server error");
    } finally {
      setLoading(false);
    }
  }

  // Color badges
  function statusBadgeColor(status: string) {
    switch (status) {
      case "Available":
        return "bg-green-600 text-white";
      case "Pending":
        return "bg-yellow-300 text-black";
      case "Occupied":
        return "bg-red-600 text-white";
      case "Under Maintenance":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-300 text-black";
    }
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-b from-[#fff8f3] to-[#f2e6dc]">
      <h1 className="text-3xl font-bold text-center mb-6 text-[#8b2f00]">
        🛎️ Receptionist Control Panel
      </h1>

      {message && (
        <p className="text-center mb-4 font-semibold text-gray-700">{message}</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="relative bg-white border rounded-lg shadow hover:shadow-md transition overflow-hidden"
          >
            <img
              src={
                room.id.startsWith("S")
                  ? "/images/suite-placeholder.jpg"
                  : "/images/room-placeholder.jpg"
              }
              alt={room.id}
              className="w-full h-32 object-cover"
            />

            <div className="absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded shadow-sm"
                 style={{ backdropFilter: "blur(4px)" }}>
              <span className={statusBadgeColor(room.status)}>{room.status}</span>
            </div>

            <div className="p-2 text-center text-black font-semibold">{room.id}</div>

            {/* ✅ Conditional buttons for pending rooms */}
            {room.status === "Pending" && (
              <div className="flex justify-center gap-2 mb-3">
                <button
                  disabled={loading}
                  onClick={() => updateStatus(room.id, "Occupied")}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded"
                >
                  ✅ Verify
                </button>
                <button
                  disabled={loading}
                  onClick={() => updateStatus(room.id, "Available")}
                  className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded"
                >
                 ❌ Reject
                </button>
              </div>
            )}

            {/* Optional admin quick actions for all rooms */}
            {room.status !== "Pending" && (
              <div className="flex justify-center gap-2 mb-3 text-xs">
                <button
                  disabled={loading}
                  onClick={() => updateStatus(room.id, "Available")}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                >
                  Set Available
                </button>
                <button
                  disabled={loading}
                  onClick={() => updateStatus(room.id, "Under Maintenance")}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded"
                >
                  Maintenance
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}