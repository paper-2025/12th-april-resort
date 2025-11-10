"use client";
import { useEffect, useState } from "react";

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [status, setStatus] = useState("");

  // Load all rooms
  const loadRooms = async () => {
    const res = await fetch("/api/rooms");
    const data = await res.json();
    setRooms(data);
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const updateRoomStatus = async (roomId: string, newStatus: string) => {
    setStatus(`Updating ${roomId}...`);
    const res = await fetch("/api/rooms/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId, status: newStatus }),
    });
    const data = await res.json();
    setStatus(data.message);
    loadRooms();
  };

  return (
    <main className="min-h-screen bg-brandBg text-white px-4 py-10">
      <h1 className="text-3xl font-semibold mb-6 text-center text-brandAccent">
        Reception Dashboard
      </h1>

      <div className="overflow-x-auto">
        <table className="w-full max-w-4xl mx-auto border-collapse text-sm">
          <thead>
            <tr className="bg-black/40 text-left">
              <th className="p-3 border-b border-gray-700">Room</th>
              <th className="p-3 border-b border-gray-700">Type</th>
              <th className="p-3 border-b border-gray-700">Status</th>
              <th className="p-3 border-b border-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr
                key={room.id}
                className={`border-b border-gray-700 ${
                  room.status === "occupied"
                    ? "bg-red-900/20"
                    : room.status === "under maintenance"
                    ? "bg-yellow-900/20"
                    : "bg-green-900/10"
                }`}
              >
                <td className="p-3 font-semibold">Room {room.id.toUpperCase()}</td>
                <td className="p-3">{room.type}</td>
                <td className="p-3 capitalize">{room.status}</td>
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => updateRoomStatus(room.id, "available")}
                    className="px-3 py-1 bg-green-600 rounded text-xs hover:bg-green-700"
                  >
                    Available
                  </button>
                  <button
                    onClick={() => updateRoomStatus(room.id, "occupied")}
                    className="px-3 py-1 bg-red-600 rounded text-xs hover:bg-red-700"
                  >
                    Occupied
                  </button>
                  <button
                    onClick={() => updateRoomStatus(room.id, "under maintenance")}
                    className="px-3 py-1 bg-yellow-500 text-black rounded text-xs hover:bg-yellow-400"
                  >
                    Maintenance
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-center mt-4 text-sm text-gray-300">{status}</p>
    </main>
  );
}