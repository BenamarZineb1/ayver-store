import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Session administrative clôturée avec succès."
    });

    // Invalidation définitive du cookie de session
    response.cookies.set("admin_session", "", {
      path: "/",
      maxAge: 0,                                     // Force l'expiration immédiate
      expires: new Date(0),                          // Rétrograde la date au 1er janvier 1970
      httpOnly: true,                                // Aligné avec les restrictions XSS du login
      secure: process.env.NODE_ENV === "production", // HTTPS uniquement en production
      sameSite: "strict",                            // Maintient la protection CSRF pendant l'effacement
    });

    return response;
  } catch (error) {
    console.error("Logout API Error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la déconnexion." },
      { status: 500 }
    );
  }
}