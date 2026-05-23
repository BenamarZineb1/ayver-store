import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get("host") || "";

  // Détecter si la requête passe par le sous-domaine admin
  const isAdminSubdomain = host.startsWith("admin.");

  // 1. Un client sur le site principal tente d'accéder à l'admin -> Masquage (404)
  if (!isAdminSubdomain && (url.pathname.startsWith("/admin") || url.pathname.startsWith("/admin/login"))) {
    return NextResponse.rewrite(new URL("/404", request.url));
  }

  // 2. Traitement du sous-domaine admin.ayver-store...
  if (isAdminSubdomain) {
    const adminToken = request.cookies.get("admin_session")?.value;

    // Si l'admin arrive sur la racine du sous-domaine "admin.ayver-store.com/"
    if (url.pathname === "/") {
      if (adminToken === "authenticated_ayver") {
        url.pathname = "/admin"; // Redirige vers son tableau de bord
      } else {
        url.pathname = "/admin/login"; // Redirige vers sa page de connexion
      }
      return NextResponse.rewrite(url);
    }

    // Protection des routes internes de l'administration
    if (url.pathname.startsWith("/admin") && url.pathname !== "/admin/login") {
      if (adminToken !== "authenticated_ayver") {
        return NextResponse.redirect(new URL("/", request.url)); // Renvoie à la racine du sous-domaine (qui affichera le login)
      }
    }
  }

  return NextResponse.next();
}

// On applique le middleware partout sauf sur les fichiers statiques et les routes API globales
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};