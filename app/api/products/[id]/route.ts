import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, props: RouteParams) {
  try {
    const params = await props.params;
    const id = Number(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Identifiant article invalide (Doit être un nombre)" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: "Article non trouvé dans le vestiaire" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la pièce." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, props: RouteParams) {
  try {
    const params = await props.params;
    const id = Number(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Identifiant article invalide" }, { status: 400 });
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
      image,
      images
    } = body;

    // Calcul automatique pour forcer l'épuisement si le stock tombe à 0
    const finalStock = Number(stock);
    const finalIsOutOfStock = Boolean(isOutOfStock) || finalStock === 0;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        price: Number(price),
        category,
        gender: gender || "unisex",
        club: club || "",
        sizes: sizes || {},
        stock: finalStock,
        isOutOfStock: finalIsOutOfStock,
        image: image || null,
        images: images || [],
        // Le champ 'variants' a été retiré ici pour correspondre à la galerie à plat
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification de l'article." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, props: RouteParams) {
  try {
    const params = await props.params;
    const id = Number(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Identifiant article invalide" }, { status: 400 });
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Article définitivement retiré du vestiaire AYVER" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'article." },
      { status: 500 }
    );
  }
}