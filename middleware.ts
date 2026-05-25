import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get("host") || "";
  const pathname = url.pathname;

  // 1. Détection de l'environnement
  const isLocal = host.includes("localhost") || host.includes("127.0.0.1");
  const isAdminSubdomain = host.startsWith("admin-");

  // Récupération et vérification du cookie de session
  const adminToken = request.cookies.get("admin_session")?.value;
  const isAuthenticated = adminToken === "authenticated_ayver";

  // 🟢 CAS UNIQUE : LOCALHOST (Pour tes tests sur PC)
  if (isLocal) {
    // Si on tente d'accéder à l'admin sans être connecté -> Redirection forcée vers le login
    if (pathname.startsWith("/admin") && pathname !== "/admin/login" && !isAuthenticated) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    // Si on tape juste la racine du local, ou si on est connecté, on laisse passer
    return NextResponse.next();
  }

  // 🔴 CAS PRODUCTION : SOUS-DOMAINE ADMIN (Vercel)
  if (isAdminSubdomain) {
    // Étape A : Si un intrus tente de forcer l'accès au dossier physique /admin dans l'URL
    if (pathname.startsWith("/admin") && pathname !== "/admin/login")) {
      if (!isAuthenticated) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    }

    // Étape B : Gestion de la racine du sous-domaine (ex: https://admin-ayver-store.vercel.app/)
    if (pathname === "/") {
      if (!isAuthenticated) {
        // Un vrai redirect vers le login pour bloquer l'accès aux personnes non connectées
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
      // Si l'admin est connecté, on lui affiche le tableau de bord secrètement via un rewrite
      url.pathname = "/admin";
      return NextResponse.rewrite(url);
    }
  } else {
    // 🔵 CAS PRODUCTION : SITE PRINCIPAL (Clients)
    // Si un client lambda tente de taper "/admin" sur le site public -> Masquage total (404)
    if (pathname.startsWith("/admin") {
      return NextResponse.rewrite(new URL("/404", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};