"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const CLOTHING_SIZES = ["S", "M", "L", "XL", "XXL"];
const SNEAKER_SIZES = ["36", "37", "38", "39", "40", "41", "42", "43", "44"];

interface ColorVariant {
  color: string;
  images: string[];
}

interface ProductForm {
  name: string;
  price: string;
  category: string;
  club: string;
  sizes: Record<string, boolean>;
}

interface ProductResponse {
  name?: string;
  price?: number;
  category?: string;
  club?: string;
  sizes?: Record<string, boolean>;
  variants?: ColorVariant[];
  error?: string;
}

export default function EditProduct() {
  const router = useRouter();
  const params = useParams();

  const id =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
      ? params.id[0]
      : null;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<ProductForm>({
    name: "",
    price: "",
    category: "jersey",
    club: "",
    sizes: {},
  });

  const [variants, setVariants] = useState<ColorVariant[]>([
    {
      color: "Standard",
      images: [],
    },
  ]);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${id}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Impossible de charger la fiche produit");
        }

        const data: ProductResponse = await res.json();

        if (data.error) {
          throw new Error(data.error);
        }

        const productCategory = data.category || "jersey";

        const productSizes: Record<string, boolean> = {
          ...(data.sizes || {}),
        };

        if (
          Object.keys(productSizes).length === 0 &&
          productCategory !== "accessories"
        ) {
          const targetGrid =
            productCategory === "sneakers"
              ? SNEAKER_SIZES
              : CLOTHING_SIZES;

          targetGrid.forEach((size) => {
            productSizes[size] = false;
          });
        }

        setForm({
          name: data.name || "",
          price: data.price ? String(data.price) : "",
          category: productCategory,
          club: data.club || "",
          sizes: productSizes,
        });

        setVariants(
          data.variants && data.variants.length > 0
            ? data.variants
            : [{ color: "Standard", images: [] }]
        );
      } catch (error) {
        console.error("Erreur chargement produit :", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  function handleCategoryChange(newCategory: string) {
    const updatedSizes: Record<string, boolean> = {};

    if (newCategory === "sneakers") {
      SNEAKER_SIZES.forEach((size) => {
        updatedSizes[size] =
          form.sizes[size] ?? size === "40" || size === "41";
      });
    } else if (newCategory !== "accessories") {
      CLOTHING_SIZES.forEach((size) => {
        updatedSizes[size] = form.sizes[size] ?? size === "M";
      });
    }

    setForm((prev) => ({
      ...prev,
      category: newCategory,
      sizes: updatedSizes,
    }));
  }

  function addVariant() {
    setVariants((prev) => [
      ...prev,
      {
        color: "",
        images: [],
      },
    ]);
  }

  function removeVariant(index: number) {
    if (variants.length === 1) return;

    setVariants((prev) => prev.filter((_, i) => i !== index));
  }

  function handleColorChange(index: number, value: string) {
    setVariants((prev) =>
      prev.map((variant, i) =>
        i === index
          ? {
              ...variant,
              color: value,
            }
          : variant
      )
    );
  }

  function handleImages(
    e: ChangeEvent<HTMLInputElement>,
    variantIndex: number
  ) {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);

    files.forEach((file) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        if (typeof reader.result !== "string") return;

        setVariants((prev) =>
          prev.map((variant, index) => {
            if (index !== variantIndex) return variant;

            return {
              ...variant,
              images: [...variant.images, reader.result as string],
            };
          })
        );
      };

      reader.readAsDataURL(file);
    });
  }

  function removeSpecificImage(
    variantIndex: number,
    imageIndex: number
  ) {
    setVariants((prev) =>
      prev.map((variant, index) => {
        if (index !== variantIndex) return variant;

        return {
          ...variant,
          images: variant.images.filter(
            (_, imgIndex) => imgIndex !== imageIndex
          ),
        };
      })
    );
  }

  function toggleSize(size: string) {
    setForm((prev) => ({
      ...prev,
      sizes: {
        ...prev.sizes,
        [size]: !prev.sizes[size],
      },
    }));
  }

  async function handleUpdate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!id) return;

    setSubmitting(true);

    try {
      const hasSizes = Object.keys(form.sizes).length > 0;

      const isGloballyOutOfStock = hasSizes
        ? Object.values(form.sizes).every((status) => status === false)
        : false;

      const firstImageUrl =
        variants.find((v) => v.images.length > 0)?.images[0] || null;

      const payload = {
        ...form,
        price: Number(form.price),
        stock: isGloballyOutOfStock ? 0 : 10,
        isOutOfStock: isGloballyOutOfStock,
        variants,
        image: firstImageUrl,
        images: variants.flatMap((v) => v.images),
      };

      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la mise à jour");
      }

      router.push("/admin");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Une erreur est survenue lors de la mise à jour.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!id) return;

    const confirmDelete = confirm(
      "Supprimer définitivement ce produit du catalogue AYVER ?"
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur suppression");
      }

      router.push("/admin");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la suppression du produit.");
    }
  }

  if (loading) {
    return (
      <div className="state-container">
        <div className="state-text">
          Chargement de la fiche article...
        </div>

        <style
          dangerouslySetInnerHTML={{
            __html: `
              .state-container {
                background: #F0EDE6;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
              }

              .state-text {
                color: #7A8A7B;
                font-family: 'Jost', sans-serif;
                letter-spacing: 2px;
                text-transform: uppercase;
                font-size: 13px;
              }
            `,
          }}
        />
      </div>
    );
  }

  const sortedSizes = Object.keys(form.sizes).sort((a, b) => {
    if (form.category === "sneakers") {
      return Number(a) - Number(b);
    }

    return CLOTHING_SIZES.indexOf(a) - CLOTHING_SIZES.indexOf(b);
  });

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght=0,400;0,600;0,700;0,900;1,400;1,700&family=Jost:wght=200;300;400;500&display=swap');

        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

        html, body {
          background-color: #F0EDE6 !important;
          margin: 0;
          padding: 0;
          width: 100%;
          min-height: 100%;
          -webkit-text-size-adjust: 100%;
        }

        :root{
          --cream:#F0EDE6;
          --dark:#131C14;
          --forest:#1A2F1C;
          --mid:#2D4A2F;
          --accent:#3A6B3D;
          --gold:#C4A882;
          --text-muted:#7A8A7B;
          --border:#D4CFC8;
          --white:#FAFAF8;
          --danger:#8B2020;
        }

        body {
          background:var(--cream);
          color:var(--dark);
          font-family:'Jost',sans-serif;
          font-weight:300;
          overflow-x:hidden;
        }

        .admin-container{
          max-width:1000px;
          margin:0 auto;
          padding:24px 16px 80px 16px;
          min-height:100vh;
          min-height:100dvh;
        }

        @media(min-width:768px){
          .admin-container{
            padding:80px 40px 120px 40px;
          }
        }

        .admin-header{
          margin-bottom:32px;
          padding-bottom:20px;
          border-bottom:1px solid var(--border);
          display:flex;
          flex-direction:column;
          gap:16px;
        }

        @media(min-width:600px){
          .admin-header{
            flex-direction:row;
            justify-content:space-between;
            align-items:flex-end;
          }
        }

        .admin-header h1{
          font-family:'Playfair Display',serif;
          font-size:42px;
          font-weight:700;
        }

        .admin-header h1 em{
          font-style:italic;
          font-weight:400;
          color:var(--forest);
        }

        .admin-header p{
          font-size:13px;
          color:var(--text-muted);
          margin-top:4px;
        }

        .header-actions{
          display:flex;
          gap:10px;
        }

        .btn-back,
        .btn-delete-top{
          font-size:11px;
          letter-spacing:2px;
          text-transform:uppercase;
          padding:10px 20px;
          cursor:pointer;
          text-decoration:none;
          transition:0.3s;
          font-weight:500;
        }

        .btn-back{
          color:var(--text-muted);
          border:1px solid var(--border);
          background:var(--white);
        }

        .btn-delete-top{
          color:var(--danger);
          border:1px solid var(--danger);
          background:transparent;
        }

        .btn-delete-top:hover{
          background:var(--danger);
          color:white;
        }

        .form-surface{
          background:var(--white);
          border:1px solid var(--border);
          padding:20px;
        }

        .form-grid{
          display:grid;
          grid-template-columns:1fr;
          gap:20px;
        }

        @media(min-width:768px){
          .form-grid{
            grid-template-columns:repeat(2,1fr);
          }
        }

        .form-field{
          display:flex;
          flex-direction:column;
          gap:8px;
        }

        .form-field label{
          font-size:10px;
          letter-spacing:2px;
          text-transform:uppercase;
          color:var(--text-muted);
          font-weight:500;
        }

        .form-field input,
        .form-field select{
          padding:14px 16px;
          border:1px solid var(--border);
          background:var(--cream);
          font-family:'Jost',sans-serif;
          font-size:16px;
          color:var(--dark);
          outline:none;
        }

        .variants-section{
          margin-top:32px;
          border-top:1px solid var(--border);
          padding-top:32px;
        }

        .section-subtitle{
          font-size:12px;
          letter-spacing:2px;
          text-transform:uppercase;
          color:var(--forest);
          font-weight:600;
          margin-bottom:20px;
        }

        .variant-card{
          background:var(--cream);
          border:1px solid var(--border);
          padding:20px;
          margin-bottom:20px;
        }

        .variant-card-header{
          display:flex;
          gap:16px;
          align-items:flex-end;
          margin-bottom:16px;
        }

        .btn-remove-variant{
          background:none;
          border:none;
          color:var(--danger);
          cursor:pointer;
          font-size:11px;
          text-transform:uppercase;
        }

        .btn-add-variant{
          width:100%;
          padding:14px;
          border:1px dashed var(--gold);
          background:var(--white);
          cursor:pointer;
          text-transform:uppercase;
          font-size:11px;
          letter-spacing:2px;
        }

        .sizes-section{
          margin-top:32px;
          padding:20px;
          background:var(--cream);
          border:1px solid var(--border);
        }

        .sizes-title{
          font-size:10px;
          letter-spacing:2px;
          text-transform:uppercase;
          color:var(--text-muted);
          margin-bottom:16px;
          text-align:center;
        }

        .sizes-grid{
          display:grid;
          grid-template-columns:repeat(5,1fr);
          gap:12px;
        }

        .size-toggle-btn{
          background:white;
          border:1px solid var(--border);
          padding:12px 4px;
          display:flex;
          flex-direction:column;
          align-items:center;
          gap:6px;
          cursor:pointer;
        }

        .size-label{
          font-family:'Playfair Display',serif;
          font-size:15px;
          font-weight:700;
        }

        .status-indicator{
          font-size:8px;
          text-transform:uppercase;
        }

        .size-in-stock{
          border-color:var(--forest);
        }

        .size-out-of-stock{
          opacity:0.5;
        }

        .images-flex{
          display:flex;
          flex-wrap:wrap;
          gap:12px;
          align-items:center;
        }

        .img-preview-box{
          width:68px;
          height:90px;
          position:relative;
          border:1px solid var(--border);
          overflow:hidden;
        }

        .img-preview-image{
          object-fit:cover;
        }

        .btn-del-img{
          position:absolute;
          top:2px;
          right:2px;
          width:18px;
          height:18px;
          border:none;
          border-radius:50%;
          background:rgba(139,32,32,0.9);
          color:white;
          cursor:pointer;
          z-index:10;
        }

        .add-photo-trigger{
          width:68px;
          height:90px;
          border:1px dashed var(--gold);
          display:flex;
          align-items:center;
          justify-content:center;
          cursor:pointer;
          font-size:22px;
          background:white;
        }

        .form-actions-bar{
          margin-top:40px;
          display:flex;
          gap:16px;
        }

        .btn-submit-product{
          flex:2;
          background:var(--dark);
          color:var(--cream);
          border:none;
          padding:16px;
          cursor:pointer;
          text-transform:uppercase;
          letter-spacing:3px;
        }

        .btn-cancel{
          flex:1;
          border:1px solid var(--border);
          display:flex;
          align-items:center;
          justify-content:center;
          text-decoration:none;
          color:var(--dark);
        }

        .admin-footer{
          margin-top:80px;
          display:flex;
          justify-content:space-between;
          font-size:11px;
          letter-spacing:2px;
          text-transform:uppercase;
          color:var(--text-muted);
          border-top:1px solid var(--border);
          padding-top:24px;
        }
      `,
        }}
      />

      <div className="admin-container">
        <header className="admin-header">
          <div>
            <h1>
              Éditer le <em>Produit</em>
            </h1>
            <p>
              Mettre à jour les données et les stocks de l'article
            </p>
          </div>

          <div className="header-actions">
            <button
              type="button"
              className="btn-delete-top"
              onClick={handleDelete}
            >
              Supprimer l'article
            </button>

            <Link href="/admin" className="btn-back">
              Retour
            </Link>
          </div>
        </header>

        <main>
          <form onSubmit={handleUpdate} className="form-surface">
            <div className="form-grid">
              <div className="form-field">
                <label>Nom du Produit</label>

                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-field">
                <label>Prix de Vente (DH)</label>

                <input
                  type="number"
                  required
                  value={form.price}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      price: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-field">
                <label>Vestiaire (Catégorie)</label>

                <select
                  value={form.category}
                  onChange={(e) =>
                    handleCategoryChange(e.target.value)
                  }
                >
                  <option value="jersey">Jerseys Officiels</option>
                  <option value="T-shirts">
                    T-shirts Oversize
                  </option>
                  <option value="hoodies-sweats">
                    Hoodies & Sweatshirts
                  </option>
                  <option value="jackets">
                    Jackets & Outerwear
                  </option>
                  <option value="pants-cargo">
                    Cargo & Pantalons
                  </option>
                  <option value="sneakers">
                    Sneakers (36-44)
                  </option>
                  <option value="accessories">
                    Accessories
                  </option>
                </select>
              </div>

              <div className="form-field">
                <label>
                  Club / Équipe / Marque (Optionnel)
                </label>

                <input
                  type="text"
                  value={form.club}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      club: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {form.category !== "accessories" ? (
              <div className="sizes-section">
                <div className="sizes-title">
                  {form.category === "sneakers"
                    ? "Pointures disponibles"
                    : "Tailles disponibles"}
                </div>

                <div className="sizes-grid">
                  {sortedSizes.map((size) => {
                    const isAvailable = form.sizes[size];

                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={`size-toggle-btn ${
                          isAvailable
                            ? "size-in-stock"
                            : "size-out-of-stock"
                        }`}
                      >
                        <span className="size-label">
                          {size}
                        </span>

                        <span className="status-indicator">
                          {isAvailable
                            ? "Dispo ✓"
                            : "Bloqué ✕"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div
                className="sizes-section"
                style={{
                  textAlign: "center",
                  color: "var(--text-muted)",
                  fontSize: "12px",
                }}
              >
                Taille unique activée.
              </div>
            )}

            <div className="variants-section">
              <div className="section-subtitle">
                Variantes & Photos
              </div>

              {variants.map((variant, index) => (
                <div key={index} className="variant-card">
                  <div className="variant-card-header">
                    <div
                      className="form-field"
                      style={{ flex: 1 }}
                    >
                      <label>
                        Couleur / Variante n°
                        {index + 1}
                      </label>

                      <input
                        type="text"
                        required
                        value={variant.color}
                        onChange={(e) =>
                          handleColorChange(
                            index,
                            e.target.value
                          )
                        }
                      />
                    </div>

                    {variants.length > 1 && (
                      <button
                        type="button"
                        className="btn-remove-variant"
                        onClick={() =>
                          removeVariant(index)
                        }
                      >
                        Supprimer
                      </button>
                    )}
                  </div>

                  <div className="images-flex">
                    {variant.images.map((img, i) => (
                      <div
                        key={i}
                        className="img-preview-box"
                      >
                        <Image
                          src={img}
                          alt="preview"
                          fill
                          sizes="68px"
                          className="img-preview-image"
                          unoptimized={img.startsWith(
                            "data:"
                          )}
                        />

                        <button
                          type="button"
                          className="btn-del-img"
                          onClick={() =>
                            removeSpecificImage(
                              index,
                              i
                            )
                          }
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    <label
                      htmlFor={`upload-${index}`}
                      className="add-photo-trigger"
                    >
                      +
                    </label>

                    <input
                      id={`upload-${index}`}
                      type="file"
                      multiple
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) =>
                        handleImages(e, index)
                      }
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                className="btn-add-variant"
                onClick={addVariant}
              >
                + Ajouter une variante
              </button>
            </div>

            <div className="form-actions-bar">
              <Link href="/admin" className="btn-cancel">
                Annuler
              </Link>

              <button
                type="submit"
                className="btn-submit-product"
                disabled={submitting}
              >
                {submitting
                  ? "Mise à jour..."
                  : "Mettre à jour le Produit"}
              </button>
            </div>
          </form>
        </main>

        <footer className="admin-footer">
          <div>Panneau Administration AYVER</div>
          <div>AYVER 2026</div>
        </footer>
      </div>
    </>
  );
}