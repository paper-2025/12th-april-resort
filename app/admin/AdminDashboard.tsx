"use client";
import { useEffect, useState } from "react";
import RoomAdminSheet from "./RoomAdminSheet";

// ---- TYPES ----
type RoomStatus = "Available" | "Pending" | "Occupied" | "Under Maintenance";

type Guest = {
  name: string;
  email: string;
  phone: string;
  address?: string;
  checkIn: string;
  checkOut: string;
};

export type Room = {
  id: string;
  status: RoomStatus;
  guest?: Guest;
  prices: {
    weekday: number;
    weekend: number;
  };
};

// ---- COMPONENT ----
export default function AdminDashboard() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Auto-refresh every 8s
  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 8000);
    return () => clearInterval(interval);
  }, []);

  async function fetchRooms() {
    try {
      const res = await fetch("/api/rooms");
      const data = await res.json();

      if (data.success && Array.isArray(data.rooms)) {
        const sorted = sortRooms(data.rooms);
        setRooms(sorted);
      }
    } catch (err) {
      console.error("Fetch rooms failed:", err);
      setMessage("Failed to load rooms");
    }
  }

  // ---- SORTING ----
  function sortRooms(list: Room[]) {
    const order: Record<RoomStatus, number> = {
      Pending: 1,
      Occupied: 2,
      Available: 3,
      "Under Maintenance": 4,
    };
    return [...list].sort((a, b) => order[a.status] - order[b.status]);
  }

  // ---- UPDATE STATUS ----
  async function updateStatus(roomId: string, status: RoomStatus) {
    try {
      setLoading(true);
      setMessage("");

      const res = await fetch("/api/rooms", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, status }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage(`Room ${roomId} → ${status}`);
        await fetchRooms();
        setSheetOpen(false);
      } else {
        setMessage(data.message || "Update failed");
      }
    } catch (err) {
      console.error("Update error:", err);
      setMessage("Network error");
    } finally {
      setLoading(false);
    }
  }

  // ---- BADGE COLOR ----
  function statusColor(status: RoomStatus) {
    switch (status) {
      case "Available":
        return "bg-green-600 text-white";
      case "Pending":
        return "bg-yellow-300 text-black";
      case "Occupied":
        return "bg-red-600 text-white";
      case "Under Maintenance":
        return "bg-gray-600 text-white";
      default:
        return "bg-gray-400 text-black";
    }
  }

  // ---- METRICS ----
  const totalAvailable = rooms.filter((r) => r.status === "Available").length;
  const totalPending = rooms.filter((r) => r.status === "Pending").length;
  const totalOccupied = rooms.filter((r) => r.status === "Occupied").length;
  const totalMaintenance = rooms.filter((r) => r.status === "Under Maintenance").length;

  return (
    <div className="p-6 min-h-screen bg-gradient-to-b from-[#fff8f3] to-[#f2e6dc]">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#8b2f00]">
          Receptionist Control Panel
        </h1>

        <button
          onClick={async () => {
            await fetch("/api/admin-logout", { method: "POST" });
            location.reload();
          }}
          className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 text-center">
        <div className="p-4 bg-white rounded shadow font-semibold text-green-700">
          Available: {totalAvailable}
        </div>
        <div className="p-4 bg-white rounded shadow font-semibold text-yellow-600">
          Pending: {totalPending}
        </div>
        <div className="p-4 bg-white rounded shadow font-semibold text-red-600">
          Occupied: {totalOccupied}
        </div>
        <div className="p-4 bg-white rounded shadow font-semibold text-gray-600">
          Maintenance: {totalMaintenance}
        </div>
      </div>

      {/* STATUS MESSAGE */}
      {loading && (
        <p className="text-center text-sm text-gray-500 mb-2">Updating…</p>
      )}

      {message && (
        <p className="text-center font-semibold text-gray-700 mb-4">{message}</p>
      )}

      {/* ROOMS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="relative bg-white border rounded-lg shadow hover:shadow-md transition cursor-pointer overflow-hidden"
            onClick={() => {
              setSelectedRoom(room);
              setSheetOpen(true);
            }}
          >
            <img
              src={
                room.id.startsWith("S")
                  ? "/images/suite-room.jpg"
                  : Number(room.id) >= 1200 && Number(room.id) < 1300
                  ? "/images/double-room.jpg"
                  : "/images/single-room.jpg"
              }
              className="w-full h-32 object-cover"
              alt={`Room ${room.id}`}
            />

            {/* STATUS BADGE */}
            <div className={`absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded shadow ${statusColor(room.status)}`}>
              {room.status}
            </div>

            <div className="p-2 text-center text-black font-semibold">
              {room.id}
            </div>
          </div>
        ))}
      </div>

      {/* ROOM ADMIN SHEET */}
      {sheetOpen && selectedRoom && (
        <RoomAdminSheet
          open={sheetOpen}
          room={selectedRoom}
          onClose={() => setSheetOpen(false)}
          onVerify={(roomId) => updateStatus(roomId, "Occupied")}
          onStatusChange={(roomId, newStatus) =>
            updateStatus(roomId, newStatus as RoomStatus)
          }
        />
      )}
    </div>
  );
}
