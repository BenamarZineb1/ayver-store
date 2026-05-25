import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // En production on prend les variables d'environnement, en local on met des valeurs par défaut si elles sont vides
    const isDev = process.env.NODE_ENV === "development";
    const expectedUsername = process.env.ADMIN_USERNAME || (isDev ? "admin" : undefined);
    const expectedPassword = process.env.ADMIN_PASSWORD || (isDev ? "admin123" : undefined);

    // Sécurité : si les variables sont absentes en production, on refuse tout par défaut
    if (!expectedUsername || !expectedPassword) {
      return NextResponse.json(
        { error: "Configuration serveur incomplète." },
        { status: 500 }
      );
    }

    if (username === expectedUsername && password === expectedPassword) {
      const response = NextResponse.json({ success: true, message: "Connexion réussie" });

      // Configuration du cookie de session sécurisé
      response.cookies.set("admin_session", "authenticated_ayver", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24,
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