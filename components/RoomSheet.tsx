"use client";
import { useEffect } from "react";

type Room = {
  id: string;
  status: "Available" | "Pending" | "Occupied" | "Under Maintenance";
  guest?: any;
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
  children: React.ReactNode; // the booking form is passed from parent
}) {
  // lock body scroll when open
  useEffect(() => {
    if (open) document.body.classList.add("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
  }, [open]);

  if (!open || !room) return null;

  const badge =
    room.status === "Available"
      ? "bg-green-600 text-white"
      : room.status === "Pending"
      ? "bg-yellow-400 text-black"
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
      <div className="absolute inset-0 bg-white sm:rounded-none sm:shadow-none overflow-y-auto">
        <header className="sticky top-0 bg-[#0b1437] text-white px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-semibold" id="room-title">
              Room {room.id}
            </div>
            <span className={`text-xs px-2 py-1 rounded ${badge}`}>{room.status}</span>
          </div>
          <button
            onClick={onClose}
            className="rounded px-3 py-1.5 bg-white/10 hover:bg-white/20"
            aria-label="Close"
          >
            Close
          </button>
        </header>

        <div className="max-w-3xl mx-auto p-4 sm:p-6">
          {/* Hero image */}
          <img
            src={
              room.id.startsWith("S")
                ? "/images/suite-placeholder.jpg"
                : "/images/room-placeholder.jpg"
            }
            alt={`Room ${room.id}`}
            className="w-full h-56 sm:h-72 object-cover rounded-lg mb-6"
          />

          {/* Info strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 text-sm">
            <div className="bg-gray-50 border rounded p-3">
              <div className="text-gray-500">Type</div>
              <div className="font-medium">
                {room.id.startsWith("S") ? "Suite" : "Standard"}
              </div>
            </div>
            <div className="bg-gray-50 border rounded p-3">
              <div className="text-gray-500">Status</div>
              <div className="font-medium">{room.status}</div>
            </div>
            <div className="bg-gray-50 border rounded p-3">
              <div className="text-gray-500">Max Guests</div>
              <div className="font-medium">2</div>
            </div>
            <div className="bg-gray-50 border rounded p-3">
              <div className="text-gray-500">View</div>
              <div className="font-medium">Courtyard</div>
            </div>
          </div>

          {/* Booking form (injected from parent) */}
          {children}
        </div>
      </div>
    </div>
  );
}