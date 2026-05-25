"use client";

import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const CLOTHING_SIZES = ["S", "M", "L", "XL", "XXL"];
const SNEAKER_SIZES = ["36", "37", "38", "39", "40", "41", "42", "43", "44"];

interface ColorVariant {
  color: string;
  images: string[];
  rawFiles?: File[];
}

interface ProductForm {
  name: string;
  price: string;
  category: string;
  club: string;
  sizes: Record<string, boolean>;
}

export default function NewProduct() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const initialSizes: Record<string, boolean> = {};
  CLOTHING_SIZES.forEach((sz) => {
    initialSizes[sz] = true;
  });

  const [form, setForm] = useState<ProductForm>({
    name: "",
    price: "",
    category: "jersey",
    club: "",
    sizes: initialSizes,
  });

  const [variants, setVariants] = useState<ColorVariant[]>([
    {
      color: "Standard",
      images: [],
      rawFiles: [],
    },
  ]);

  useEffect(() => {
    return () => {
      variants.forEach((variant) => {
        variant.images.forEach((url) => {
          if (url.startsWith("blob:")) {
            URL.revokeObjectURL(url);
          }
        });
      });
    };
  }, [variants]);

  function handleCategoryChange(newCategory: string) {
    let updatedSizes: Record<string, boolean> = {};

    if (newCategory === "sneakers") {
      SNEAKER_SIZES.forEach((sz) => {
        updatedSizes[sz] = true;
      });
    } else if (newCategory === "accessories") {
      updatedSizes = {};
    } else {
      CLOTHING_SIZES.forEach((sz) => {
        updatedSizes[sz] = true;
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
        rawFiles: [],
      },
    ]);
  }

  function removeVariant(index: number) {
    if (variants.length === 1) return;

    variants[index].images.forEach((url) => {
      if (url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    });

    setVariants((prev) => prev.filter((_, i) => i !== index));
  }

  function handleColorChange(index: number, value: string) {
    setVariants((prev) =>
      prev.map((variant, i) => {
        if (i !== index) return variant;

        return {
          ...variant,
          color: value,
        };
      })
    );
  }

  function handleImages(
    e: ChangeEvent<HTMLInputElement>,
    variantIndex: number
  ) {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);

    const previewUrls = files.map((file) => URL.createObjectURL(file));

    setVariants((prev) =>
      prev.map((variant, i) => {
        if (i !== variantIndex) return variant;

        return {
          ...variant,
          images: [...(variant.images || []), ...previewUrls],
          rawFiles: [...(variant.rawFiles || []), ...files],
        };
      })
    );

    e.target.value = "";
  }

  function removeSpecificImage(
    variantIndex: number,
    imageIndex: number
  ) {
    setVariants((prev) =>
      prev.map((variant, i) => {
        if (i !== variantIndex) return variant;

        const imageToRemove = variant.images[imageIndex];

        if (imageToRemove?.startsWith("blob:")) {
          URL.revokeObjectURL(imageToRemove);
        }

        return {
          ...variant,
          images: variant.images.filter((_, idx) => idx !== imageIndex),
          rawFiles: variant.rawFiles?.filter(
            (_, idx) => idx !== imageIndex
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

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = () => {
        resolve(reader.result as string);
      };

      reader.onerror = (error) => {
        reject(error);
      };
    });
  }

  async function submit(e: FormEvent) {
    e.preventDefault();

    setLoading(true);

    try {
      const processedVariants = await Promise.all(
        variants.map(async (variant) => {
          const base64Images = variant.rawFiles?.length
            ? await Promise.all(
                variant.rawFiles.map((file) => fileToBase64(file))
              )
            : [];

          return {
            color: variant.color || "Standard",
            images: base64Images,
          };
        })
      );

      const hasSizes = Object.keys(form.sizes).length > 0;

      const isGloballyOutOfStock = hasSizes
        ? Object.values(form.sizes).every((status) => status === false)
        : false;

      const firstImageUrl =
        processedVariants.find((v) => v.images?.length > 0)?.images?.[0] ||
        null;

      const payload = {
        ...form,
        price: Number(form.price),
        stock: isGloballyOutOfStock ? 0 : 10,
        isOutOfStock: isGloballyOutOfStock,
        variants: processedVariants,
        image: firstImageUrl,
        images: processedVariants.flatMap((v) => v.images || []),
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur serveur");
      }

      variants.forEach((variant) => {
        variant.images.forEach((url) => {
          if (url.startsWith("blob:")) {
            URL.revokeObjectURL(url);
          }
        });
      });

      router.push("/admin");
      router.refresh();
    } catch (error: any) {
      console.error("Erreur création produit :", error);
      alert(
        error?.message ||
          "Une erreur est survenue lors de la création du produit."
      );
    } finally {
      setLoading(false);
    }
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

        *,*::before,*::after{
          box-sizing:border-box;
          margin:0;
          padding:0;
        }

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

        body{
          background:var(--cream);
          color:var(--dark);
          font-family:'Jost',sans-serif;
          font-weight:300;
          overflow-x:hidden;
        }

        .admin-container{
          max-width:1000px;
          margin:0 auto;
          padding:40px 20px 80px 20px;
          min-height:100vh;
          min-height:100dvh;
          display:flex;
          flex-direction:column;
          justify-content:space-between;
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
          font-size:32px;
          font-weight:700;
          color:var(--dark);
        }

        @media(min-width:768px){
          .admin-header h1{
            font-size:42px;
          }
        }

        .admin-header h1 em{
          font-style:italic;
          font-weight:400;
          color:var(--forest);
        }

        .admin-header p{
          font-size:14px;
          color:var(--text-muted);
          margin-top:4px;
        }

        .btn-back{
          font-size:11px;
          letter-spacing:2px;
          text-transform:uppercase;
          text-decoration:none;
          color:var(--text-muted);
          border:1px solid var(--border);
          padding:10px 20px;
          background:var(--white);
          font-weight:500;
          text-align:center;
          width:100%;
        }

        @media(min-width:600px){
          .btn-back{
            width:auto;
          }
        }

        .btn-back:hover{
          color:var(--dark);
          border-color:var(--dark);
        }

        .form-surface{
          background:var(--white);
          border:1px solid var(--border);
          padding:24px;
          border-radius:2px;
        }

        @media(min-width:768px){
          .form-surface{
            padding:40px;
          }
        }

        .form-grid{
          display:grid;
          grid-template-columns:1fr;
          gap:20px;
        }

        @media(min-width:768px){
          .form-grid{
            grid-template-columns:repeat(2,1fr);
            gap:28px;
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
          border-radius:1px;
          -webkit-appearance:none;
        }

        @media(min-width:768px){
          .form-field input,
          .form-field select{
            font-size:14px;
          }
        }

        .form-field input:focus,
        .form-field select:focus{
          border-color:var(--dark);
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
          position:relative;
        }

        .variant-card-header{
          display:flex;
          flex-direction:column;
          gap:12px;
          margin-bottom:16px;
        }

        @media(min-width:600px){
          .variant-card-header{
            flex-direction:row;
            align-items:flex-end;
          }
        }

        .btn-remove-variant{
          background:none;
          border:none;
          color:var(--danger);
          font-size:11px;
          text-transform:uppercase;
          letter-spacing:1px;
          cursor:pointer;
          font-weight:500;
        }

        .btn-add-variant{
          background:var(--white);
          color:var(--dark);
          border:1px dashed var(--gold);
          padding:14px 24px;
          font-family:'Jost',sans-serif;
          font-size:11px;
          letter-spacing:2px;
          text-transform:uppercase;
          cursor:pointer;
          width:100%;
          font-weight:500;
        }

        .btn-add-variant:hover{
          background:var(--dark);
          color:var(--white);
          border-color:var(--dark);
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
          font-weight:600;
          margin-bottom:16px;
          text-align:center;
        }

        .sizes-grid{
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:10px;
        }

        @media(min-width:480px){
          .sizes-grid{
            grid-template-columns:repeat(4,1fr);
          }
        }

        @media(min-width:768px){
          .sizes-grid{
            grid-template-columns:repeat(5,1fr);
            gap:12px;
          }
        }

        .size-toggle-btn{
          background:var(--white);
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
          color:var(--dark);
        }

        .status-indicator{
          font-size:8px;
          letter-spacing:0.5px;
          text-transform:uppercase;
        }

        .size-in-stock{
          border-color:var(--forest);
          background:#FAFDF9;
        }

        .size-in-stock .status-indicator{
          color:var(--accent);
        }

        .size-out-of-stock{
          border-color:#E2DCD5;
          background:#F7F5F0;
          opacity:0.5;
        }

        .size-out-of-stock .size-label{
          color:var(--text-muted);
          text-decoration:line-through;
        }

        .size-out-of-stock .status-indicator{
          color:var(--danger);
        }

        .upload-container{
          display:flex;
          flex-direction:column;
          gap:8px;
          margin-top:16px;
        }

        .upload-label{
          font-size:11px;
          letter-spacing:1px;
          color:var(--text-muted);
          font-weight:500;
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
          border:1px solid var(--border);
          background:var(--white);
          overflow:hidden;
          position:relative;
        }

        .img-preview-image{
          object-fit:cover;
        }

        .btn-del-img{
          position:absolute;
          top:2px;
          right:2px;
          background:rgba(139,32,32,0.9);
          color:white;
          border:none;
          width:18px;
          height:18px;
          font-size:9px;
          display:flex;
          align-items:center;
          justify-content:center;
          cursor:pointer;
          border-radius:50%;
          z-index:10;
        }

        .add-photo-trigger{
          width:68px;
          height:90px;
          border:1px dashed var(--gold);
          display:flex;
          align-items:center;
          justify-content:center;
          color:var(--forest);
          cursor:pointer;
          font-size:22px;
          background:var(--white);
        }

        .btn-submit-product{
          margin-top:40px;
          background:var(--dark);
          color:var(--cream);
          padding:16px 32px;
          border:none;
          font-family:'Jost',sans-serif;
          letter-spacing:3px;
          font-size:12px;
          text-transform:uppercase;
          cursor:pointer;
          width:100%;
        }

        .btn-submit-product:hover:not(:disabled){
          background:var(--mid);
        }

        .btn-submit-product:disabled{
          opacity:0.6;
          cursor:not-allowed;
        }

        .admin-footer{
          margin-top:60px;
          display:flex;
          flex-direction:column;
          gap:8px;
          align-items:center;
          font-size:10px;
          letter-spacing:2px;
          text-transform:uppercase;
          color:var(--text-muted);
          border-top:1px solid var(--border);
          padding-top:24px;
          text-align:center;
        }

        @media(min-width:600px){
          .admin-footer{
            flex-direction:row;
            justify-content:space-between;
            margin-top:80px;
            font-size:11px;
          }
        }

        .footer-brand-mark{
          font-family:'Playfair Display',serif;
          font-weight:700;
          color:var(--forest);
        }
      `,
        }}
      />

      <div className="admin-container">
        <header className="admin-header">
          <div>
            <h1>
              Ajouter un <em>Produit</em>
            </h1>
            <p>Fiche article unifiée avec variantes multiples</p>
          </div>

          <Link href="/admin" className="btn-back">
            Retour au Dashboard
          </Link>
        </header>

        <main>
          <form onSubmit={submit} className="form-surface">
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
                  placeholder="Ex: Espagne Home Jersey 2026"
                />
              </div>

              <div className="form-field">
                <label>Prix de Vente (DH)</label>

                <input
                  type="number"
                  required
                  min="0"
                  value={form.price}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      price: e.target.value,
                    })
                  }
                  placeholder="450"
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
                  <option value="jersey">
                    Jerseys Officiels
                  </option>

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
                    Sneakers (Pointures 36-44)
                  </option>

                  <option value="accessories">
                    Accessories (Taille Unique)
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
                  placeholder="Ex: Espagne, Casablanca, Nike"
                />
              </div>
            </div>

            {form.category !== "accessories" ? (
              <div className="sizes-section">
                <div className="sizes-title">
                  {form.category === "sneakers"
                    ? "Pointures actives pour ce modèle"
                    : "Tailles actives pour ce modèle"}
                </div>

                <div className="sizes-grid">
                  {sortedSizes.map((size) => {
                    const isAvailable = form.sizes[size];

                    return (
                      <button
                        key={size}
                        type="button"
                        className={`size-toggle-btn ${
                          isAvailable
                            ? "size-in-stock"
                            : "size-out-of-stock"
                        }`}
                        onClick={() => toggleSize(size)}
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
                ✨ <strong>Mode Accessoires :</strong> Cet
                article sera configuré en taille unique.
              </div>
            )}

            <div className="variants-section">
              <div className="section-subtitle">
                Variantes de couleurs & Galeries photos
                dédiées
              </div>

              {variants.map((variant, index) => (
                <div key={index} className="variant-card">
                  <div className="variant-card-header">
                    <div
                      className="form-field"
                      style={{
                        flex: 1,
                        width: "100%",
                      }}
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
                        placeholder="Ex: Rouge, Noir, Blanc..."
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

                  <div className="upload-container">
                    <span className="upload-label">
                      Photos de la variante (
                      {variant.color ||
                        `n°${index + 1}`}
                      ) :
                    </span>

                    <div className="images-flex">
                      {variant.images?.map((img, i) => (
                        <div
                          key={i}
                          className="img-preview-box"
                        >
                          <Image
                            src={img}
                            alt="Aperçu déclinaison"
                            fill
                            sizes="68px"
                            className="img-preview-image"
                            unoptimized
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
                        htmlFor={`file-up-${index}`}
                        className="add-photo-trigger"
                      >
                        +
                      </label>

                      <input
                        id={`file-up-${index}`}
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
                </div>
              ))}

              <button
                type="button"
                className="btn-add-variant"
                onClick={addVariant}
              >
                + Ajouter une autre couleur / option
                pour ce produit
              </button>
            </div>

            <button
              type="submit"
              className="btn-submit-product"
              disabled={loading}
            >
              {loading
                ? "Enregistrement dans le vestiaire AYVER..."
                : "Enregistrer le Produit Multi-Variantes"}
            </button>
          </form>
        </main>

        <footer className="admin-footer">
          <div>
            Panneau d'Administration Sécurisé
          </div>

          <div className="footer-brand-mark">
            AYVER 2026
          </div>
        </footer>
      </div>
    </>
  );
}