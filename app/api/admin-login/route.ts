import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { pin } = await req.json();

  if (pin !== process.env.ADMIN_PIN) {
    return NextResponse.json({ success: false, message: "Invalid PIN" });
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set("admin_auth", "true", {
    httpOnly: true,
    sameSite: "strict",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 5,
  });

  return res;
}
