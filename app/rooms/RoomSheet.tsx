"use client";

import { useEffect } from "react";

type RoomStatus = "Available" | "Pending" | "Occupied" | "Under Maintenance";

type Room = {
  id: string;
  status: RoomStatus;
  guest?: any;
  prices?: {
    weekday: number;
    weekend: number;
  };
  placeholder?: string;
};

export default function RoomSheet({
  open,
  room,
  onClose,
  children,
}: {
  open: boolean;
  room: Room | null;
  onClose: () => void;
  children: React.ReactNode;
}) {
  // Lock body scroll when sheet is open
  useEffect(() => {
    if (open) document.body.classList.add("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
  }, [open]);

  if (!open || !room) return null;

  const badge =
    room.status === "Available"
      ? "bg-green-600 text-white"
      : room.status === "Pending"
      ? "bg-yellow-300 text-black"
      : room.status === "Occupied"
      ? "bg-red-600 text-white"
      : "bg-gray-500 text-white";

  return (
    <div
      className="fixed inset-0 z-[60]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="room-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div className="absolute inset-0 bg-white overflow-y-auto shadow-xl">
        {/* HEADER */}
        <header className="sticky top-0 bg-[#0b1437] text-white px-4 py-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-semibold" id="room-title">
              Room {room.id}
            </div>

            <span className={`text-xs px-2 py-1 rounded ${badge}`}>
              {room.status}
            </span>
          </div>

          <button
            onClick={onClose}
            className="rounded px-3 py-1.5 bg-white/10 hover:bg-white/20"
            aria-label="Close"
          >
            Close
          </button>
        </header>

        {/* CONTENT */}
        <div className="max-w-3xl mx-auto p-4 text-black">
          {/* Room Image */}
          <img
            src={
              room.placeholder
                ? room.placeholder
                : room.id.startsWith("S")
                ? "/images/suite-room.jpg"
                : room.id.match(/^(1204|1214|1222|1210|1203|1225|1227|1208|1205|1223|1220|1218|1219)$/)
                ? "/images/double-room.jpg"
                : "/images/single-room.jpg"
            }
            alt={`Room ${room.id}`}
            className="w-full h-60 object-cover rounded-lg mb-6 shadow"
          />

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 text-sm">
            <div className="bg-gray-100 border rounded p-3">
              <div className="text-gray-600">Type</div>
              <div className="font-semibold">
                {room.id.startsWith("S")
                  ? "Suite"
                  : room.id.match(/^(1204|1214|1222|1210|1203|1225|1227|1208|1205|1223|1220|1218|1219)$/)
                  ? "Double Room"
                  : "Single Room"}
              </div>
            </div>

            <div className="bg-gray-100 border rounded p-3">
              <div className="text-gray-600">Status</div>
              <div className="font-semibold">{room.status}</div>
            </div>

            <div className="bg-gray-100 border rounded p-3">
              <div className="text-gray-600">Max Guests</div>
              <div className="font-semibold">
                {room.id.startsWith("S") ? "4" : "2"}
              </div>
            </div>

            <div className="bg-gray-100 border rounded p-3">
              <div className="text-gray-600">View</div>
              <div className="font-semibold">Courtyard</div>
            </div>

            {/* Pricing */}
            {room.prices && (
              <div className="bg-gray-100 border rounded p-3 col-span-2 sm:col-span-4">
                <div className="text-gray-600">Rates</div>
<div className="font-semibold">
                  Weekday:{" "}
                  <span className="text-blue-700">
                    ₦{room.prices.weekday.toLocaleString()}
                  </span>
                  &nbsp; | &nbsp;
                  Weekend:{" "}
                  <span className="text-green-700">
                    ₦{room.prices.weekend.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Booking Form Injected */}
          {children}
        </div>
      </div>
    </div>
  );
}