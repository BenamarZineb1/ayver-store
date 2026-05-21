"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CLOTHING_SIZES = ["S", "M", "L", "XL", "XXL"];
const SNEAKER_SIZES = ["36", "37", "38", "39", "40", "41", "42", "43", "44"];

interface ColorVariant {
  color: string;
  images: string[];
}

export default function NewProduct() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Initialisation par défaut basée sur "jersey"
  const initialSizes: Record<string, boolean> = {};
  CLOTHING_SIZES.forEach(sz => { initialSizes[sz] = true; });

  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "jersey",
    gender: "unisex",
    club: "",
    sizes: initialSizes as Record<string, boolean>
  });

  const [variants, setVariants] = useState<ColorVariant[]>([
    { color: "Rouge", images: [] }
  ]);

  // CORRECTION 8 : Gestion du changement de catégorie sans boucle infinie
  function handleCategoryChange(newCategory: string) {
    let updatedSizes: Record<string, boolean> = {};

    if (newCategory === "sneakers") {
      SNEAKER_SIZES.forEach(sz => { updatedSizes[sz] = true; });
    } else if (newCategory === "accessories") {
      updatedSizes = {};
    } else {
      CLOTHING_SIZES.forEach(sz => { updatedSizes[sz] = true; });
    }

    setForm(prev => ({
      ...prev,
      category: newCategory,
      sizes: updatedSizes
    }));
  }

  function addVariant() {
    setVariants([...variants, { color: "", images: [] }]);
  }

  function removeVariant(index: number) {
    if (variants.length === 1) return;
    setVariants(variants.filter((_, i) => i !== index));
  }

  function handleColorChange(index: number, value: string) {
    const updated = [...variants];
    updated[index].color = value;
    setVariants(updated);
  }

  // CORRECTION 5 : Rerender React sécurisé avec .map() pour les images
  function handleImages(e: any, variantIndex: number) {
    const files = Array.from(e.target.files);
    files.forEach((file: any) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVariants((prev) =>
          prev.map((variant, i) => {
            if (i !== variantIndex) return variant;
            return {
              ...variant,
              images: [...(variant.images || []), reader.result as string]
            };
          })
        );
      };
      reader.readAsDataURL(file);
    });
  }

  function removeSpecificImage(variantIndex: number, imageIndex: number) {
    setVariants((prev) =>
      prev.map((variant, i) => {
        if (i !== variantIndex) return variant;
        return {
          ...variant,
          images: variant.images.filter((_, imgIdx) => imgIdx !== imageIndex)
        };
      })
    );
  }

  function toggleSize(size: string) {
    setForm((prev: any) => ({
      ...prev,
      sizes: { ...prev.sizes, [size]: !prev.sizes[size] }
    }));
  }

  async function submit(e: any) {
    e.preventDefault();
    setLoading(true);

    const hasSizes = Object.keys(form.sizes).length > 0;
    const isGloballyOutOfStock = hasSizes ? Object.values(form.sizes).every(status => status === false) : false;

    // CORRECTION 1 : Enregistrement forcé de image et images au payload
    const firstImageUrl = variants?.[0]?.images?.[0] || null;

    const payload = {
      ...form,
      price: Number(form.price),
      stock: isGloballyOutOfStock ? 0 : 10,
      isOutOfStock: isGloballyOutOfStock,
      variants: variants,
      image: firstImageUrl,
      images: firstImageUrl ? [firstImageUrl] : []
    };

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erreur serveur");

      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Une erreur est survenue lors de l'enregistrement.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=Jost:wght=200;300;400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --cream:#F0EDE6; --dark:#131C14; --forest:#1A2F1C; --mid:#2D4A2F;
          --accent:#3A6B3D; --gold:#C4A882; --text-muted:#7A8A7B; --border:#D4CFC8; --white:#FAFAF8; --danger:#8B2020;
        }
        body { background:var(--cream); color:var(--dark); font-family:'Jost',sans-serif; font-weight:300; overflow-x:hidden; }
        .admin-container { max-width:1000px; margin:0 auto; padding:80px 40px 120px 40px; min-height:100vh; display:flex; flex-direction:column; justify-content:space-between; }
        .admin-header { margin-bottom:50px; padding-bottom:24px; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:flex-end; }
        .admin-header h1 { font-family:'Playfair Display',serif; font-size:42px; font-weight:700; color:var(--dark); }
        .admin-header h1 em { font-style:italic; font-weight:400; color:var(--forest); }
        .btn-back { font-size:11px; letter-spacing:2px; text-transform:uppercase; text-decoration:none; color:var(--text-muted); border:1px solid var(--border); padding:10px 20px; background:var(--white); transition:all 0.3s; font-weight:500; }
        .btn-back:hover { color:var(--dark); border-color:var(--dark); }
        .form-surface { background:var(--white); border:1px solid var(--border); padding:40px; border-radius:2px; }
        .form-grid { display:grid; grid-template-columns:repeat(2, 1fr); gap:28px; }
        .form-field { display:flex; flex-direction:column; gap:8px; }
        .form-field label { font-size:10px; letter-spacing:2px; text-transform:uppercase; color:var(--text-muted); font-weight:500; }
        .form-field input, .form-field select { padding:14px 16px; border:1px solid var(--border); background:var(--cream); font-family:'Jost',sans-serif; font-size:14px; color:var(--dark); outline:none; border-radius:1px; }
        .variants-section { margin-top:32px; border-top:1px solid var(--border); padding-top:32px; }
        .section-subtitle { font-size:12px; letter-spacing:2px; text-transform:uppercase; color:var(--forest); font-weight:600; margin-bottom:20px; }
        .variant-card { background:var(--cream); border:1px solid var(--border); padding:24px; margin-bottom:20px; position:relative; border-radius:1px; }
        .variant-card-header { display:flex; gap:16px; align-items:flex-end; margin-bottom:16px; }
        .btn-remove-variant { background:none; border:none; color:var(--danger); font-size:11px; text-transform:uppercase; letter-spacing:1px; cursor:pointer; padding-bottom:16px; font-weight:500; }
        .btn-add-variant { background:var(--white); color:var(--dark); border:1px dashed var(--gold); padding:12px 24px; font-family:'Jost',sans-serif; font-size:11px; letter-spacing:2px; text-transform:uppercase; cursor:pointer; width:100%; transition:all 0.3s; font-weight:500; }
        .btn-add-variant:hover { background:var(--dark); color:var(--white); border-color:var(--dark); }
        .sizes-section { margin-top:32px; padding:30px; background:var(--cream); border:1px solid var(--border); }
        .sizes-title { font-size:10px; letter-spacing:2px; text-transform:uppercase; color:var(--text-muted); font-weight:600; margin-bottom:16px; text-align:center; }
        .sizes-grid { display:grid; grid-template-columns:repeat(5, 1fr); gap:12px; }
        .size-toggle-btn { background: var(--white); border: 1px solid var(--border); padding: 14px 6px; display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: pointer; }
        .size-label { font-family:'Playfair Display', serif; font-size:16px; font-weight:700; color:var(--dark); }
        .status-indicator { font-size:8px; letter-spacing:1px; text-transform:uppercase; }
        .size-in-stock { border-color: var(--forest); background: #FAFDF9; }
        .size-in-stock .status-indicator { color: var(--accent); }
        .size-out-of-stock { border-color: #E2DCD5; background: #F7F5F0; opacity: 0.5; }
        .size-out-of-stock .size-label { color: var(--text-muted); text-decoration: line-through; }
        .size-out-of-stock .status-indicator { color: var(--danger); }
        .upload-container { display:flex; flex-direction:column; gap:8px; margin-top:8px; }
        .upload-label { font-size:10px; letter-spacing:1px; text-transform:uppercase; color:var(--text-muted); }
        .images-flex { display:flex; flex-wrap:wrap; gap:12px; }
        .img-preview-box { width:68px; height:90px; border:1px solid var(--border); background:var(--white); overflow:hidden; position:relative; }
        .img-preview-box img { width:100%; height:100%; object-fit:cover; }
        .btn-del-img { position:absolute; top:2px; right:2px; background:rgba(139,32,32,0.85); color:white; border:none; width:16px; height:16px; font-size:9px; display:flex; align-items:center; justify-content:center; cursor:pointer; border-radius:50%; }
        .add-photo-trigger { width:68px; height:90px; border:1px dashed var(--gold); display:flex; align-items:center; justify-content:center; color:var(--forest); cursor:pointer; font-size:18px; background:var(--white); }
        .btn-submit-product { margin-top:40px; background:var(--dark); color:var(--cream); padding:16px 32px; border:none; font-family:'Jost',sans-serif; letter-spacing:3px; font-size:12px; text-transform:uppercase; cursor:pointer; width:100%; }
        .admin-footer { margin-top:80px; display:flex; justify-content:space-between; align-items:center; font-size:11px; letter-spacing:2px; text-transform:uppercase; color:var(--text-muted); border-top:1px solid var(--border); padding-top:24px; }
        .footer-brand-mark { font-family:'Playfair Display',serif; font-weight:700; color:var(--forest); }
        @media(max-width:768px){ .form-grid { grid-template-columns:1fr; } .sizes-grid { grid-template-columns:repeat(3, 1fr); } }
      `}} />

      <div className="admin-container">
        <header className="admin-header">
          <div>
            <h1>Ajouter un <em>Produit</em></h1>
            <p>Fiche article unifiée avec variantes multiples</p>
          </div>
          <Link href="/admin/products" className="btn-back">Retour à la Liste</Link>
        </header>

        <main>
          <form onSubmit={submit} className="form-surface">
            <div className="form-grid">
              <div className="form-field">
                <label>Nom du Produit</label>
                <input
                  type="text" required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Espagne Home Jersey 2026"
                />
              </div>

              <div className="form-field">
                <label>Prix de Vente (DH)</label>
                <input
                  type="number" required value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="450"
                />
              </div>

              {/* CORRECTION 9 : select synchronisé sur handleCategoryChange */}
              <div className="form-field">
                <label>Vestiaire (Catégorie)</label>
                <select
                  value={form.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                >
                  <option value="jersey">Jerseys Officiels</option>
                  <option value="T-shirts">T-shirts Oversize</option>
                  <option value="hoodies-sweats">Hoodies & Sweatshirts</option>
                  <option value="jackets">Jackets & Outerwear</option>
                  <option value="pants-cargo">Cargo & Pantalons</option>
                  <option value="sneakers">Sneakers (Pointures 36-44)</option>
                  <option value="accessories">Accessories (Taille Unique)</option>
                </select>
              </div>

              <div className="form-field">
                <label>Club / Équipe / Marque (Optionnel)</label>
                <input
                  type="text" value={form.club}
                  onChange={(e) => setForm({ ...form, club: e.target.value })}
                  placeholder="Ex: Espagne, Casablanca, Nike"
                />
              </div>

              <div className="form-field">
                <label>Ligne (Genre)</label>
                <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                  <option value="unisex">Unisex</option>
                  <option value="men">Homme</option>
                  <option value="women">Femme</option>
                </select>
              </div>
            </div>

            {form.category !== "accessories" ? (
              <div className="sizes-section">
                <div className="sizes-title">
                  {form.category === "sneakers" ? "Pointures actives pour ce modèle" : "Tailles actives pour ce modèle"}
                </div>
                <div className="sizes-grid">
                  {Object.keys(form.sizes).map((size) => {
                    const isAvailable = form.sizes[size];
                    return (
                      <button
                        type="button" key={size}
                        className={`size-toggle-btn ${isAvailable ? "size-in-stock" : "size-out-of-stock"}`}
                        onClick={() => toggleSize(size)}
                      >
                        <span className="size-label">{size}</span>
                        <span className="status-indicator">
                          {isAvailable ? "Dispo ✓" : "Bloqué ✕"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="sizes-section" style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "12px" }}>
                ✨ <strong>Mode Accessoires :</strong> Cet article sera configuré en taille unique.
              </div>
            )}

            <div className="variants-section">
              <div className="section-subtitle">Variantes de couleurs & Galeries photos dédiées</div>

              {variants.map((v, index) => (
                <div key={index} className="variant-card">
                  <div className="variant-card-header">
                    <div className="form-field" style={{ flex: 1 }}>
                      <label>Couleur / Variante n°{index + 1}</label>
                      <input
                        type="text" required value={v.color}
                        onChange={(e) => handleColorChange(index, e.target.value)}
                        placeholder="Ex: Rouge (Home), Blanc (Away), Vert..."
                      />
                    </div>
                    {variants.length > 1 && (
                      <button type="button" className="btn-remove-variant" onClick={() => removeVariant(index)}>
                        Supprimer
                      </button>
                    )}
                  </div>

                  <div className="upload-container">
                    <span className="upload-label">Photos de la variante ({v.color || `n°${index + 1}`}) :</span>
                    <div className="images-flex">
                      {v.images.map((img, i) => (
                        <div key={i} className="img-preview-box">
                          <img src={img} alt="Aperçu déclinaison" />
                          <button type="button" className="btn-del-img" onClick={() => removeSpecificImage(index, i)}>✕</button>
                        </div>
                      ))}
                      <label htmlFor={`file-up-${index}`} className="add-photo-trigger">+</label>
                      <input
                        type="file" multiple accept="image/*"
                        onChange={(e) => handleImages(e, index)}
                        style={{ display: "none" }} id={`file-up-${index}`}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button type="button" className="btn-add-variant" onClick={addVariant}>
                + Ajouter une autre couleur / option pour ce produit
              </button>
            </div>

            <button className="btn-submit-product" disabled={loading}>
              {loading ? "Enregistrement en cours..." : "Enregistrer le Produit Multi-Variantes"}
            </button>
          </form>
        </main>

        <footer className="admin-footer">
          <div>Panneau d'Administration Sécurisé</div>
          <div className="footer-brand-mark">AYVER 2026</div>
        </footer>
      </div>
    </>
  );
}