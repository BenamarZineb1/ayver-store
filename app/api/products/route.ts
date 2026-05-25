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
      gender,
      collection,
      sizes,
      club,
      variants
    } = body;

    if (!name || price === undefined || price === null) {
      return NextResponse.json({ error: "Le nom et le prix sont obligatoires" }, { status: 400 });
    }

    // 🛠️ CORRECTIF CRUCIAL : Ton admin envoie [[{color, images}]], on le transforme en [{color, images}]
    let cleanVariants = variants || [];
    if (Array.isArray(cleanVariants[0])) {
      cleanVariants = cleanVariants.flat();
    }

    // Extraction de toutes les images pour remplir aussi le champ images[] de base si tu veux s'en servir
    const allImages = cleanVariants.flatMap((v: any) => v.images || []);

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
        images: allImages,       // Stocke un tableau à plat de toutes les chaînes Base64
        variants: cleanVariants, // Stocke la structure complète [{color: "...", images: [...]}] dans le JSON
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("Prisma Creation Error:", error);
    return NextResponse.json({ error: "Erreur lors de l'écriture en base de données" }, { status: 500 });
  }
}