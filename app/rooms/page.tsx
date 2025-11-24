"use client";
import { useState, useEffect } from "react";
import RoomSheet from "./RoomSheet";

export default function RoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [openSheet, setOpenSheet] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [days, setDays] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ---- Fetch Rooms ---
  async function fetchRooms() {
    try {
      const res = await fetch("/api/rooms");
      const data = await res.json();
      if (data.success) setRooms(data.rooms);
    } catch (err) {
      console.error("Fetch rooms failed:", err);
    }
  }

  useEffect(() => {
    fetchRooms();
  }, []);

  // ---- Weekend Check ---
  function isWeekend(dateStr: string) {
    const day = new Date(dateStr).getDay();
    return day === 5 || day === 6 || day === 0; // Fri, Sat, Sun
  }

  // ---- Multi-night REAL calculation ---
  function calculateTotalPrice(room: any, checkIn: string, checkOut: string) {
    if (!room || !checkIn || !checkOut) return 0;

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    let total = 0;

    const d = new Date(start);

    while (d < end) {
      const dateStr = d.toISOString().split("T")[0];
      total += isWeekend(dateStr)
        ? room.prices.weekend
        : room.prices.weekday;

      d.setDate(d.getDate() + 1);
    }

    return total;
  }

  // ---- Nights Auto Calculation ---
  useEffect(() => {
    if (checkIn && checkOut) {
      const d1 = new Date(checkIn);
      const d2 = new Date(checkOut);
      const diff = d2.getTime() - d1.getTime();

      const nights = Math.ceil(diff / (1000 * 60 * 60 * 24));
      setDays(nights > 0 ? nights : 0);
    }
  }, [checkIn, checkOut]);

  // ---- Open Sheet ---
  function openRoom(room: any) {
    const doubleRooms = [
      "1204", "1214", "1222", "1210",
      "1203", "1225", "1227", "1208",
      "1205", "1223", "1220", "1218", "1219"
    ];

    let prices = {};
    if (room.id.startsWith("S")) {
      prices = { weekday: 35000, weekend: 30000 };
      room.placeholder = "/images/suite-room.jpg";
    } else if (doubleRooms.includes(room.id)) {
      prices = { weekday: 24000, weekend: 20000 };
      room.placeholder = "/images/double-room.jpg";
    } else {
      prices = { weekday: 20000, weekend: 18000 };
      room.placeholder = "/images/single-room.jpg";
    }

    setSelectedRoom({ ...room, prices });
    setOpenSheet(true);
  }

  // ---- Booking ---
  async function handleBooking(e: any) {
    e.preventDefault();
    if (!selectedRoom) return;

    const today = new Date().toISOString().split("T")[0];
    if (checkIn !== today) {
      setMessage(`Check-In must be today (${today})`);
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
      if (!data.success) {
        setMessage(data.message || "Booking failed.");
        return;
      }

      setMessage(data.message);
      fetchRooms();
    } catch (err) {
      console.error(err);
      setMessage("Booking failed.");
    } finally {
      setLoading(false);
    }
  }

  // ---- Render ---
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Book a Room</h1>

      {/* ROOMS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {rooms.map((room) => (
          <div
            key={room.id}
            onClick={() => openRoom(room)}
            className="relative border rounded-lg shadow hover:shadow-lg cursor-pointer transition"
          >
            <img
              src={
                room.id.startsWith("S")
                  ? "/images/suite-room.jpg"
                  : [
                      "1204","1214","1222","1210",
                      "1203","1225","1227","1208",
                      "1205","1223","1220","1218","1219"
                    ].includes(room.id)
                  ? "/images/double-room.jpg"
                  : "/images/single-room.jpg"
              }
              className="w-full h-32 object-cover"
            />

            <div className="p-2 text-center font-semibold text-black">
              {room.id}
            </div>

            <span
              className={`absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded ${
                room.status === "Available"
                  ? "bg-green-600 text-white"
                  : room.status === "Pending"
                  ? "bg-yellow-300 text-black"
                  : room.status === "Occupied"
                  ? "bg-red-600 text-white"
                  : "bg-gray-500 text-white"
              }`}
            >
              {room.status}
            </span>
          </div>
        ))}
      </div>

      {/* ROOM SHEET */}
      <RoomSheet
        open={openSheet}
        room={selectedRoom}
        onClose={() => setOpenSheet(false)}
      >
        <form onSubmit={handleBooking} className="space-y-3 text-black">
          <input
            type="text"
            placeholder="Full Name"
            className="border p-2 rounded w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email"
            className="border p-2 rounded w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="tel"
            placeholder="Phone Number"
            className="border p-2 rounded w-full"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Address"
            className="border p-2 rounded w-full"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Check-In</label>
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                className="border p-2 rounded w-full bg-white text-black"
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
                className="border p-2 rounded w-full bg-white text-black"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                required
              />
            </div>
          </div>

          {/* NIGHTS / PRICE */}
          <div className="font-medium text-gray-900">
            Nights: {days}
            <br />
            <span className="text-blue-700">
              Total: ₦
              {selectedRoom &&
                calculateTotalPrice(selectedRoom, checkIn, checkOut).toLocaleString()}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading || !selectedRoom || selectedRoom.status !== "Available"}
            className={`w-full py-2 rounded text-white ${
              selectedRoom?.status === "Available"
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {loading ? "Booking..." : "Book Now"}
          </button>

          {message && <p className="text-center text-sm">{message}</p>}
        </form>
      </RoomSheet>
    </div>
  );
}
