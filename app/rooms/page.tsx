"use client";

import { useState, useEffect } from "react";

// ✅ Define proper Room type
type Room = {
  id: string;
  status: "Available" | "Occupied" | "Under Maintenance";
  guest?: {
    name: string;
    phone: string;
    address?: string;
    checkIn?: string;
    checkOut?: string;
  };
};

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [checkIn, setCheckIn] = useState<string>("");
  const [checkOut, setCheckOut] = useState<string>("");
  const [days, setDays] = useState<number>(0);
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>(""); 

  // ✅ Fetch actual data
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    const res = await fetch("/api/rooms");
    const data = await res.json();
    if (data.success) setRooms(data.rooms);
  };

  // ✅ Auto calculate nights
  useEffect(() => {
    if (checkIn && checkOut) {
      const inDate = new Date(checkIn);
      const outDate = new Date(checkOut);
      const diff = outDate.getTime() - inDate.getTime();
      const daysCount = Math.ceil(diff / (1000 * 60 * 60 * 24));
      setDays(daysCount > 0 ? daysCount : 0);
    }
  }, [checkIn, checkOut]);
// Debug: log when rooms are loaded
useEffect(() => {
  console.log("Fetched rooms:", rooms);
}, [rooms]);
  // ✅ Handle booking
  async function handleBooking(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!selectedRoom) {
      alert("Please select a room first.");
      setLoading(false);
      return;
    }

    // Prevent booking of occupied or maintenance rooms (frontend safety)
    if (selectedRoom.status === "Occupied") {
      alert("This room is currently occupied.");
      setLoading(false);
      return;
    }

    if (selectedRoom.status === "Under Maintenance") {
      alert("This room is under maintenance.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: selectedRoom.id,
          name,
          phone,
          address,
          checkIn,
          checkOut,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Booking failed. Please try again.");
        setMessage(data.message);
        return;
      }

      setMessage(`✅ ${data.message}`);
      fetchRooms(); // refresh room statuses
    } catch (error) {
      console.error("Booking error:", error);
      setMessage("❌ Error booking room. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Book a Room</h1>

      {/* ✅ Room Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {rooms.map((room) => (
          <div
            key={room.id}
            onClick={() => setSelectedRoom(room)}
            className={`relative border rounded-lg shadow overflow-hidden cursor-pointer transition-transform hover:scale-105 ${
              selectedRoom?.id === room.id ? "ring-4 ring-blue-500" : ""
            }`}
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
            <div className="p-2 text-center font-semibold text-black">
              {room.id}
            </div>

            {/* ✅ Colored status badge */}
            <span
              className={`absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded ${
                room.status === "Available"
                  ? "bg-green-600 text-white"
                  : room.status === "Occupied"
                  ? "bg-red-600 text-white"
                  : "bg-yellow-500 text-black"
              }`}
            >
              {room.status}
            </span>
          </div>
        ))}
      </div>

      {/* ✅ Booking Form */}
      <form
        onSubmit={handleBooking}
        className="max-w-lg mx-auto bg-white shadow-lg rounded p-4 space-y-3"
      >
        <input
          type="text"
          placeholder="Full Name"
          className="border p-2 rounded w-full text-black"
          value={name}
          onChange={(e) => setName(e.target.value)}
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
        <input
          type="email"
          placeholder="Email Address"
          className="border p-2 rounded w-full text-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* ✅ Date Pickers */}
        <div className="grid grid-cols-2 gap-3">
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

        <div className="text-gray-700">Nights: {days}</div>

        {/* ✅ Smart button */}
        <button
          type="submit"
          disabled={loading || selectedRoom?.status !== "Available"}
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
            : "Unavailable"}
        </button>

        {/* ✅ Dynamic message */}
        {selectedRoom?.status !== "Available" && selectedRoom && (
          <p className="text-center text-red-600 text-sm mt-2">
            {selectedRoom.status === "Occupied"
              ? "This room is currently occupied."
              : selectedRoom.status === "Under Maintenance"
              ? "This room is under maintenance."
              : ""}
          </p>
        )}
      </form>

      {message && (
  <p
    className={`text-center mt-4 font-semibold px-4 py-2 rounded-md shadow-sm ${
      message.includes("✅")
        ? "bg-green-100 text-green-800 border border-green-400"
        : message.includes("❌")
        ? "bg-red-100 text-red-800 border border-red-400"
        : "bg-yellow-100 text-yellow-800 border border-yellow-400"
    }`}
  >
    {message}
  </p>
)}
    </div>
  );
}