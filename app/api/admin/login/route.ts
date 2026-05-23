import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const expectedUsername = process.env.ADMIN_USERNAME;
    const expectedPassword = process.env.ADMIN_PASSWORD;

    if (username === expectedUsername && password === expectedPassword) {
      const response = NextResponse.json({ success: true, message: "Connexion réussie" });

      // Configuration du cookie de session sécurisé
      response.cookies.set("admin_session", "authenticated_ayver", {
        httpOnly: true, // Empêche l'accès via JavaScript (protection XSS)
        secure: process.env.NODE_ENV === "production", // HTTPS uniquement en prod
        sameSite: "strict", // Protection contre les failles CSRF
        maxAge: 60 * 60 * 24, // Session active pendant 24 heures
        path: "/",
      });

      return response;
    }

    return NextResponse.json(
      { error: "Identifiant ou mot de passe incorrect." },
      { status: 401 }
    );
  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}