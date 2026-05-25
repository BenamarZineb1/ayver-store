import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get("host") || "";
  const pathname = url.pathname;

  // 1. Détection de l'environnement et du type d'accès
  const isLocal = host.includes("localhost") || host.includes("127.0.0.1");

  // S'adapte que ton sous-domaine commence par "admin-" (Vercel branch) ou "admin." (Domaine personnalisé)
  const isAdminSubdomain = host.startsWith("admin-") || host.startsWith("admin.");

  // Récupération et vérification du cookie de session sécurisé
  const adminToken = request.cookies.get("admin_session")?.value;
  const isAuthenticated = adminToken === "authenticated_ayver";

  // 🟢 CAS 1 : LOCALHOST (Développement sur PC)
  if (isLocal) {
    if (pathname.startsWith("/admin") && pathname !== "/admin/login" && !isAuthenticated) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  // 🔴 CAS 2 : SOUS-DOMAINE ADMIN EN PRODUCTION (Vercel / Domaine Propre)
  if (isAdminSubdomain) {
    // Si l'utilisateur non connecté tente d'accéder à une page admin
    if (pathname.startsWith("/admin") && pathname !== "/admin/login" && !isAuthenticated) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // Gestion de la racine du sous-domaine (ex: https://admin.ayver.store/)
    if (pathname === "/") {
      if (!isAuthenticated) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
      // Si connecté, on affiche le tableau de bord situé dans /admin
      url.pathname = "/admin";
      return NextResponse.rewrite(url);
    }

    return NextResponse.next();
  }

  // 🔵 CAS 3 : SITE PUBLIC CLIENTS (Production)
  // Sécurité absolue : On bloque TOUT ce qui commence par /admin (y compris le login) sur le site public
  if (pathname.startsWith("/admin")) {
    return NextResponse.rewrite(new URL("/404", request.url));
  }

  return NextResponse.next();
}

// Configuration du matcher pour exclure les assets statiques et les routes d'API
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
// Force clear cache build Vercel