"use client";
import { useEffect, useMemo, useState } from "react";
import RoomSheet from "@/components/RoomSheet";

type Room = {
  id: string;
  status: "Available" | "Pending" | "Occupied" | "Under Maintenance";
  guest?: any;
};

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // booking fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [days, setDays] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedRoom = useMemo(
    () => rooms.find((r) => r.id === selectedId) || null,
    [rooms, selectedId]
  );

  async function fetchRooms() {
    try {
      const res = await fetch("/api/rooms", { cache: "no-store" });
      const data = await res.json();
      if (data?.success) setRooms(data.rooms);
    } catch (e) {
      console.error("Fetch rooms failed:", e);
    }
  }

  useEffect(() => {
    fetchRooms();
    const t = setInterval(fetchRooms, 10_000); // refresh every 10s
    return () => clearInterval(t);
  }, []);

  // open sheet
  function openSheet(roomId: string) {
    setSelectedId(roomId);
    setOpen(true);
    setMessage("");
  }

  // close sheet
  function closeSheet() {
    setOpen(false);
    setSelectedId(null);
    setMessage("");
    // optional: clear form
    setName("");
    setEmail("");
    setPhone("");
    setAddress("");
    setCheckIn("");
    setCheckOut("");
    setDays(0);
  }

  // auto-calc nights
  useEffect(() => {
    if (checkIn && checkOut) {
      const s = new Date(checkIn).getTime();
      const e = new Date(checkOut).getTime();
      const d = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
      setDays(d > 0 ? d : 0);
    } else {
      setDays(0);
    }
  }, [checkIn, checkOut]);

  async function handleBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRoom) return;

    // guard by status
    if (selectedRoom.status !== "Available") {
      setMessage(
        selectedRoom.status === "Occupied"
          ? "This room is occupied."
          : selectedRoom.status === "Under Maintenance"
          ? "This room is under maintenance."
          : "This room is pending verification."
      );
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: selectedRoom.id,
          name,
          email,
          phone,
          address,
          checkIn,
          checkOut,
        }),
      });

      const data = await res.json();

      if (!data?.success) {
        setMessage(data?.message || "Booking failed, please try again.");
        return;
      }

      setMessage("Sent for verification. You’ll get a confirmation by email.");
      await fetchRooms();
    } catch (err) {
      console.error("Booking error:", err);
      setMessage("Error booking room. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ---------- UI ----------
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Book a Room</h1>

      {/* Grid of rooms */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {rooms.map((room) => {
          const badge =
            room.status === "Available"
              ? "bg-green-600 text-white"
              : room.status === "Pending"
              ? "bg-yellow-400 text-black"
              : room.status === "Occupied"
              ? "bg-red-600 text-white"
              : "bg-gray-500 text-white";

          return (
            <button
              key={room.id}
              onClick={() => openSheet(room.id)}
              className="relative border rounded-lg shadow overflow-hidden text-left focus:outline-none focus:ring-2 focus:ring-blue-600"
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
              <div className="p-2 text-center font-semibold">{room.id}</div>
              <span
                className={`absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded ${badge}`}
              >
                {room.status}
              </span>
            </button>
          );
        })}
      </div>

      {/* Full-screen sheet */}
      <RoomSheet open={open} room={selectedRoom} onClose={closeSheet}>
        {/* Booking form inside the sheet */}
        <form
          onSubmit={handleBooking}
          className="bg-white border rounded-lg shadow p-4 sm:p-5 space-y-3"
        >
          {/* Status messaging */}
          {selectedRoom && selectedRoom.status !== "Available" && (
            <div
              className={`rounded px-3 py-2 text-sm font-medium ${
                selectedRoom.status === "Occupied"
                  ? "bg-red-50 text-red-700"
                  : selectedRoom.status === "Under Maintenance"
                  ? "bg-gray-100 text-gray-800"
                  : "bg-yellow-50 text-yellow-800"
              }`}
            >
              {selectedRoom.status === "Occupied"
                ? "This room is currently occupied."
                : selectedRoom.status === "Under Maintenance"
                ? "This room is under maintenance."
                : "This room is pending verification."}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Full Name"
              className="border p-2 rounded w-full text-black"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email (for confirmation)"
              className="border p-2 rounded w-full text-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="tel"
              placeholder="Phone Number"
              className="border p-2 rounded w-full text-black"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Address"
              className="border p-2 rounded w-full text-black"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Check-In</label>
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                className="border p-2 rounded w-full text-black bg-white"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Check-Out</label>
              <input
                type="date"
                min={checkIn || new Date().toISOString().split("T")[0]}
                className="border p-2 rounded w-full text-black bg-white"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="text-gray-800 font-medium">Nights: {days}</div>

          <button
            type="submit"
            disabled={
              loading || !selectedRoom || selectedRoom.status !== "Available"
            }
            className={`w-full py-2 rounded text-white ${
              selectedRoom?.status === "Available"
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {selectedRoom?.status === "Available"
              ? loading
                ? "Booking..."
                : "Book Now"
              : selectedRoom?.status === "Occupied"
              ? "Room Occupied"
              : selectedRoom?.status === "Under Maintenance"
              ? "Under Maintenance"
              : "Pending Verification"}
          </button>

          {message && (
            <p className="text-center mt-2 text-sm font-medium text-gray-800">
              {message}
            </p>
          )}
        </form>
      </RoomSheet>
    </div>
  );
}
