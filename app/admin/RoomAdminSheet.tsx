"use client";
import { useEffect } from "react";
import type { Room } from "./AdminDashboard";

type Props = {
  open: boolean;
  room: Room;
  onClose: () => void;
  onVerify: (roomId: string) => void;
  onStatusChange: (roomId: string, newStatus: string) => void;
};

export default function RoomAdminSheet({
  open,
  room,
  onClose,
  onVerify,
  onStatusChange,
}: Props) {
  // Lock scroll
  useEffect(() => {
    if (open) document.body.classList.add("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
  }, [open]);

  if (!open || !room) return null;

  // DOUBLE ROOM IDs
  const doubleRooms = [
    "1204", "1214", "1222", "1210", "1203", "1225", "1227",
    "1208", "1205", "1223", "1220", "1218", "1219"
  ];

  // ROOM TYPE
  const type = room.id.startsWith("S")
    ? "Suite"
    : doubleRooms.includes(room.id)
    ? "Double Room"
    : "Single Room";

  // ROOM IMAGE
  const imageSrc = room.id.startsWith("S")
    ? "/images/suite-room.jpg"
    : doubleRooms.includes(room.id)
    ? "/images/double-room.jpg"
    : "/images/single-room.jpg";

  // BADGE COLORS
  const badge =
    room.status === "Available"
      ? "bg-green-600 text-white"
      : room.status === "Pending"
      ? "bg-yellow-300 text-black"
      : room.status === "Occupied"
      ? "bg-red-600 text-white"
      : "bg-gray-600 text-white";

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* SHEET */}
      <div className="absolute inset-0 bg-white overflow-y-auto shadow-xl animate-slideUp">
        {/* HEADER */}
        <header className="sticky top-0 bg-[#0b1437] text-white px-4 py-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold">Room {room.id}</h2>
            <span className={`text-xs px-2 py-1 rounded ${badge}`}>
              {room.status}
            </span>
          </div>

          <button
            onClick={onClose}
            className="rounded px-3 py-1.5 bg-white/10 hover:bg-white/20"
          >
            Close
          </button>
        </header>

        {/* CONTENT */}
        <div className="max-w-3xl mx-auto p-4 text-black">
          {/* IMAGE */}
          <img
            src={imageSrc}
            alt={`Room ${room.id}`}
            className="w-full h-60 object-cover rounded-lg mb-6 shadow"
          />

          {/* BASIC INFO GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 text-sm">
            <div className="bg-gray-100 border rounded p-3">
              <div className="text-gray-600">Type</div>
              <div className="font-semibold">{type}</div>
            </div>

            <div className="bg-gray-100 border rounded p-3">
              <div className="text-gray-600">Status</div>
              <div className="font-semibold">{room.status}</div>
            </div>

            <div className="bg-gray-100 border rounded p-3">
              <div className="text-gray-600">Weekday Rate</div>
              <div className="font-semibold text-blue-800">
                ₦{room.prices.weekday.toLocaleString()}
              </div>
            </div>

            <div className="bg-gray-100 border rounded p-3">
              <div className="text-gray-600">Weekend Rate</div>
              <div className="font-semibold text-green-700">
                ₦{room.prices.weekend.toLocaleString()}
              </div>
            </div>
          </div>

          {/* GUEST DETAILS */}
          {room.guest ? (
            <div className="bg-white border rounded-lg shadow p-4 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Guest Information
              </h3>

              <div className="space-y-2 text-gray-800">
                <p><strong>Name:</strong> {room.guest.name}</p>
                <p><strong>Email:</strong> {room.guest.email}</p>
                <p><strong>Phone:</strong> {room.guest.phone}</p>
                <p><strong>Address:</strong> {room.guest.address || "N/A"}</p>
                <p><strong>Check-In:</strong> {room.guest.checkIn}</p>
                <p><strong>Check-Out:</strong> {room.guest.checkOut}</p>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 italic mb-6">
              No guest assigned.
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="flex flex-wrap gap-3 justify-center">
            {/* VERIFY */}
            {room.status === "Pending" && (
              <button
                onClick={() => onVerify(room.id)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Verify Booking
              </button>
            )}

            {/* REJECT */}
            {room.status === "Pending" && (
              <button
                onClick={() => onStatusChange(room.id, "Available")}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Reject Booking
              </button>
            )}

            {/* MAINTENANCE */}
            {room.status !== "Pending" && (
              <button
                onClick={() => onStatusChange(room.id, "Under Maintenance")}
                className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
              >
                Maintenance
              </button>
            )}

            {/* MAKE AVAILABLE */}
            {room.status === "Under Maintenance" && (
              <button
                onClick={() => onStatusChange(room.id, "Available")}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Make Available
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
