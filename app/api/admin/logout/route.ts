import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });
  // Expire le cookie immédiatement pour couper la session
  response.cookies.set("admin_token", "", { path: "/", maxAge: 0 });
  return response;
}