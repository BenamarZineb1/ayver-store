import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// 🔍 GET : Récupère tous les produits (sans cache)
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(products, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    console.error("Error fetching all products:", error);
    return NextResponse.json({ error: "Erreur serveur de récupération" }, { status: 500 });
  }
}

// ➕ POST : Crée un nouveau produit complet
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      name,
      price,
      stock,
      isOutOfStock,
      category,
      image,
      images,
      gender,
      collection,
      sizes,
      club,
      variants
    } = body;

    if (!name || price === undefined || price === null) {
      return NextResponse.json({ error: "Le nom et le prix sont obligatoires" }, { status: 400 });
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        price: Number(price),
        stock: stock !== undefined ? Number(stock) : 10,
        isOutOfStock: Boolean(isOutOfStock),
        category: category || "jersey",
        gender: gender || "unisex",
        club: club || "",
        collection: collection || "Essential Drop",
        sizes: sizes || {},
        variants: variants || [],
        image: image || null,
        images: images || [],
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("Prisma Creation Error:", error);
    return NextResponse.json({ error: "Erreur lors de l'écriture en base de données" }, { status: 500 });
  }
}