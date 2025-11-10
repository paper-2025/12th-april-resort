import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";

const roomsFile = path.join(process.cwd(), "data", "rooms.json");

function readRooms() {
  return JSON.parse(fs.readFileSync(roomsFile, "utf-8"));
}

function writeRooms(data: any) {
  fs.writeFileSync(roomsFile, JSON.stringify(data, null, 2));
}

async function sendEmail(to: string, subject: string, html: string) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"12th April Resort" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("Email send failed:", err);
  }
}

/* -----------------------------------------------------
   ✅ GET — fetch all rooms
----------------------------------------------------- */
export async function GET() {
  try {
    const rooms = readRooms();
    return NextResponse.json({ success: true, rooms });
  } catch (error: any) {
    console.error("GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load rooms", error: error.message },
      { status: 500 }
    );
  }
}

/* -----------------------------------------------------
   ✅ POST — book a room
----------------------------------------------------- */
export async function POST(req: Request) {
  try {
    const { roomId, name, email, phone, address, checkIn, checkOut } = await req.json();
    const rooms = readRooms();
    const room = rooms.find((r: any) => r.id === roomId);

    if (!room) return NextResponse.json({ success: false, message: "Room not found" });
    if (["Occupied", "Pending", "Under Maintenance"].includes(room.status))
      return NextResponse.json({ success: false, message: `Room is ${room.status.toLowerCase()}` });

    room.status = "Pending";
    room.guest = { name, email, phone, address, checkIn, checkOut };
    writeRooms(rooms);

    // Notify receptionist
    await sendEmail(
      process.env.RECEIVER_EMAIL || process.env.GMAIL_USER!,
      `New Booking Request - Room ${roomId}`,
      `
      <div style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 30px;">
        <div style="max-width: 600px; background: white; margin: auto; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
          <div style="background: #004aad; color: white; padding: 16px; text-align: center; font-size: 20px; font-weight: bold;">
            12th April Resort — New Booking Request
          </div>
          <div style="padding: 24px; color: #333;">
            <p>A new booking request has been made:</p>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td><strong>Room:</strong></td><td>${roomId}</td></tr>
              <tr><td><strong>Name:</strong></td><td>${name}</td></tr>
              <tr><td><strong>Email:</strong></td><td>${email}</td></tr>
              <tr><td><strong>Phone:</strong></td><td>${phone}</td></tr>
              <tr><td><strong>Check-in:</strong></td><td>${checkIn}</td></tr>
              <tr><td><strong>Check-out:</strong></td><td>${checkOut}</td></tr>
            </table>
            <p style="margin-top: 16px;">Please log into the admin panel to verify this booking.</p>
          </div>
          <div style="background: #eee; color: #555; padding: 12px; text-align: center; font-size: 13px;">
            © 12th April Resort | Booking Notification
          </div>
        </div>
      </div>`
    );

    return NextResponse.json({ success: true, message: `Booking for Room ${roomId} sent for verification.` });
  } catch (error: any) {
    console.error("POST error:", error);
    return NextResponse.json({ success: false, message: "Booking failed", error: error.message });
  }
}

/* -----------------------------------------------------
   ✅ PATCH — update room status
----------------------------------------------------- */
export async function PATCH(req: Request) {
  try {
    const { roomId, status } = await req.json();
    const rooms = readRooms();
    const room = rooms.find((r: any) => r.id === roomId);

    if (!room) return NextResponse.json({ success: false, message: "Room not found" });

    const prevStatus = room.status;
    room.status = status;
    writeRooms(rooms);

    // If verified to Occupied, confirm to guest
    if (prevStatus === "Pending" && status === "Occupied" && room.guest?.email) {
      const guest = room.guest;

      await sendEmail(
        guest.email,
        `Your Booking is Confirmed - Room ${roomId}`,
        `
        <div style="font-family: Arial, sans-serif; background: #fafafa; padding: 30px;">
          <div style="max-width: 600px; background: white; margin: auto; border-radius: 10px; overflow: hidden; box-shadow: 0 3px 6px rgba(0,0,0,0.1);">
            <div style="background: #004aad; color: white; padding: 20px; text-align: center; font-size: 22px; font-weight: bold;">
              Booking Confirmed — 12th April Resort
            </div>
            <div style="padding: 24px; color: #333;">
              <p>Dear <strong>${guest.name}</strong>,</p>
              <p>Your booking at <strong>12th April Resort</strong> has been confirmed!</p>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td><strong>Room:</strong></td><td>${roomId}</td></tr>
                <tr><td><strong>Check-in:</strong></td><td>${guest.checkIn}</td></tr>
                <tr><td><strong>Check-out:</strong></td><td>${guest.checkOut}</td></tr>
              </table>
              <p style="margin-top: 16px;">We can’t wait to welcome you.</p>
            </div>
            <div style="background: #eee; color: #555; padding: 12px; text-align: center; font-size: 13px;">
              © 12th April Resort | Thank you for choosing us
            </div>
          </div>
        </div>`
      );
    }

    return NextResponse.json({ success: true, message: `Room ${roomId} updated to ${status}` });
  } catch (error: any) {
    console.error("PATCH error:", error);
    return NextResponse.json({ success: false, message: "Failed to update room", error: error.message });
  }
}
