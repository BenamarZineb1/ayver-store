import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
// GET : Récupère tous les produits
export async function GET() {
  try {
    // Trié par création décroissante (le plus récent d'abord pour la logique "New Drops")
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(products, {
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur de récupération" }, { status: 500 });
  }
}

// POST : Crée un nouveau produit
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, price, stock, isOutOfStock, category, images, gender, collection, sizes } = body;

    // Validation rapide
    if (!name || !price) {
      return NextResponse.json({ error: "Le nom et le prix sont obligatoires" }, { status: 400 });
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        price: Number(price),
        stock: Number(stock) ?? 0,
        isOutOfStock: Boolean(isOutOfStock),
        category,
        images: images || [],
        gender: gender || "unisex",
        collection: collection || "Essential Drop",
        sizes: sizes || { S: true, M: true, L: true, XL: true, XXL: true }
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("Prisma Error:", error);
    return NextResponse.json({ error: "Erreur lors de l'écriture en base de données" }, { status: 500 });
  }
}