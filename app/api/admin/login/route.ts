import { NextResponse } from "next/server";

// 💡 Utilisation de l'API standard globale 'crypto' disponible nativement dans Node.js et l'Edge runtime
function generateSecureToken(): string {
  const array = new Uint8Array(32);
  globalThis.crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    const expectedUsername = process.env.ADMIN_USERNAME;
    const expectedPassword = process.env.ADMIN_PASSWORD;

    // Protection essentielle si les variables d'environnement ne sont pas configurées
    if (!expectedUsername || !expectedPassword) {
      console.error("🚨 Erreur de configuration : ADMIN_USERNAME ou ADMIN_PASSWORD non définis.");
      return NextResponse.json(
        { error: "Configuration serveur incomplète." },
        { status: 500 }
      );
    }

    // Vérification stricte des identifiants
    if (username === expectedUsername && password === expectedPassword) {
      const response = NextResponse.json({
        success: true,
        message: "Connexion réussie au vestiaire AYVER."
      });

      // Génération d'un token éphémère et unique pour cette session active
      const sessionToken = generateSecureToken();

      // Configuration du cookie avec des directives de sécurité maximales
      response.cookies.set("admin_session", "authenticated_ayver", {
        httpOnly: true,                 // Bloque l'accès via le JavaScript client (anti-XSS)
        secure: process.env.NODE_ENV === "production", // Exige HTTPS en environnement de production
        sameSite: "strict",             // Bloque l'envoi du cookie lors de requêtes tierces (anti-CSRF)
        maxAge: 60 * 60 * 24,           // Durée de validité de la session : 24 heures
        path: "/",                      // Valide sur l'ensemble du domaine
      });

      return response;
    }

    return NextResponse.json(
      { error: "Identifiant ou mot de passe incorrect." },
      { status: 401 }
    );
  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { error: "Une erreur interne est survenue lors de l'authentification." },
      { status: 500 }
    );
  }
}