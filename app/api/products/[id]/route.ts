import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// 🔍 GET : Récupère un produit unique par son ID
export async function GET(request: Request, props: RouteParams) {
  try {
    const params = await props.params;
    const id = Number(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du produit" },
      { status: 500 }
    );
  }
}

// 📝 PUT : Met à jour un produit existant (Nettoyé pour le JSON et sécurisé)
export async function PUT(request: Request, props: RouteParams) {
  try {
    const params = await props.params;
    const id = Number(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 });
    }

    const body = await request.json();

    const {
      name,
      price,
      category,
      gender,
      club,
      sizes,
      stock,
      isOutOfStock,
      variants,
      collection // Ajouté si jamais tu modifies aussi la collection
    } = body;

    // 🛠️ CORRECTIF : On aplatit le tableau si l'admin envoie des variants doublement imbriqués [[...]]
    let cleanVariants = variants || [];
    if (Array.isArray(cleanVariants[0])) {
      cleanVariants = cleanVariants.flat();
    }

    // Extraction de toutes les images pour mettre à jour le tableau images[] global
    const allImages = cleanVariants.flatMap((v: any) => v.images || []);

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        price: price !== undefined ? Number(price) : undefined,
        category,
        gender: gender || "unisex",
        club: club || "",
        collection: collection || undefined,
        sizes: sizes || {},
        stock: stock !== undefined ? Number(stock) : undefined,
        isOutOfStock: isOutOfStock !== undefined ? Boolean(isOutOfStock) : undefined,
        images: allImages,       // Met à jour la liste plate d'images globales
        variants: cleanVariants, // Écrit la structure propre [{color: "...", images: [...]}] dans le champ JSON
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification du produit" },
      { status: 500 }
    );
  }
}

// ❌ DELETE : Supprime un produit par son ID
export async function DELETE(request: Request, props: RouteParams) {
  try {
    const params = await props.params;
    const id = Number(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 });
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Produit supprimé avec succès" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du produit" },
      { status: 500 }
    );
  }
}