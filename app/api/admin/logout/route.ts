import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });

  // Correction ici : Expire précisément le cookie mis en place à la connexion
  response.cookies.set("admin_session", "", {
    path: "/",
    maxAge: 0,
    expires: new Date(0)
  });

  return response;
}