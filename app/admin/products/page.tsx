"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CLOTHING_SIZES = ["S", "M", "L", "XL", "XXL"];
const SNEAKER_SIZES = ["36", "37", "38", "39", "40", "41", "42", "43", "44"];

interface ColorVariant {
  color: string;
  images: string[];
}

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // États du formulaire
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("10");
  const [category, setCategory] = useState("jersey");
  const [gender, setGender] = useState("unisex");
  const [club, setClub] = useState("");
  const [collection, setCollection] = useState("Essential Drop");
  const [isOutOfStock, setIsOutOfStock] = useState(false);

  // État pour la grille des tailles sélectionnées
  const [selectedSizes, setSelectedSizes] = useState<Record<string, boolean>>({
    S: false, M: true, L: false, XL: false, XXL: false,
  });

  // État pour les variantes de couleurs & galeries d'images associées
  const [variants, setVariants] = useState<ColorVariant[]>([
    { color: "Standard", images: [] }
  ]);

  const handleSizeToggle = (size: string) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [size]: !prev[size],
    }));
  };

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    if (cat === "sneakers") {
      const initialSneakers: Record<string, boolean> = {};
      SNEAKER_SIZES.forEach(s => initialSneakers[s] = s === "40" || s === "41");
      setSelectedSizes(initialSneakers);
    } else if (cat === "accessories") {
      setSelectedSizes({});
    } else {
      const initialClothing: Record<string, boolean> = {};
      CLOTHING_SIZES.forEach(s => initialClothing[s] = s === "M");
      setSelectedSizes(initialClothing);
    }
  };

  // Fonctions de gestion des variantes
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

  function handleImages(e: ChangeEvent<HTMLInputElement>, variantIndex: number) {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          const base64String = reader.result;
          setVariants((prev) =>
            prev.map((variant, i) => {
              if (i !== variantIndex) return variant;
              return {
                ...variant,
                images: [...(variant.images || []), base64String]
              };
            })
          );
        }
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    // Extraction de la toute première image valide pour servir d'image de couverture globale
    const firstImageUrl = variants?.find(v => v.images?.length > 0)?.images?.[0] || null;

    const payload = {
      name,
      price: Number(price),
      stock: Number(stock),
      isOutOfStock: isOutOfStock || Number(stock) === 0,
      category,
      gender,
      club,
      collection,
      sizes: selectedSizes,
      variants: variants,
      image: firstImageUrl,
      images: variants.flatMap(v => v.images || []) // Cumul global requis pour ton API/Base de données
    };

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "✨ Produit ajouté avec succès au vestiaire AYVER !" });
        setTimeout(() => {
          router.push("/admin");
          router.refresh();
        }, 1500);
      } else {
        setMessage({ type: "error", text: data.error || "Une erreur est survenue." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Impossible de communiquer avec l'API." });
    } finally {
      setLoading(false);
    }
  };

  // Maintient un tri logique à l'affichage des tailles / pointures
  const sortedSizes = Object.keys(selectedSizes).sort((a, b) => {
    if (!isNaN(Number(a)) && !isNaN(Number(b))) return Number(a) - Number(b);
    return CLOTHING_SIZES.indexOf(a) - CLOTHING_SIZES.indexOf(b);
  });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght=0,400;0,600;0,700&family=Jost:wght=300;400;500&display=swap');
        body { background: #F0EDE6; color: #131C14; font-family: 'Jost', sans-serif; margin: 0; padding: 0; }
        header { background: #131C14; color: #FAFAF8; padding: 20px 40px; display: flex; align-items: center; gap: 20px; }
        .nav-back { color: #C4A882; text-decoration: none; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; font-weight: 500; }
        .brand { font-family: 'Playfair Display', serif; font-size: 20px; letter-spacing: 2px; color: #FAFAF8; margin-left: auto; }

        .form-container { max-width: 800px; margin: 50px auto; padding: 40px; background: #FAFAF8; border: 1px solid #D4CFC8; border-radius: 2px; box-shadow: 0 4px 20px rgba(0,0,0,0.02); }
        .form-title { font-family: 'Playfair Display', serif; font-size: 32px; margin-bottom: 30px; font-weight: 700; text-align: center; }
        .form-title em { font-style: italic; font-weight: 400; color: #1A2F1C; }

        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-group.full { grid-column: span 2; }

        label { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #7A8A7B; font-weight: 500; }
        input, select { padding: 14px 16px; border: 1px solid #D4CFC8; background: #F0EDE6; font-family: 'Jost', sans-serif; font-size: 14px; color: #131C14; outline: none; border-radius: 1px; }
        input:focus, select:focus { border-color: #131C14; background: #FAFAF8; }

        .sizes-section { margin-top: 12px; padding: 24px; background: #F0EDE6; border: 1px solid #D4CFC8; }
        .sizes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(70px, 1fr)); gap: 10px; margin-top: 8px; }
        .size-btn { padding: 12px 6px; border: 1px solid #D4CFC8; background: #FAFAF8; font-family: 'Jost', sans-serif; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.2s; text-align: center; }
        .size-btn.active { background: #131C14; color: #FAFAF8; border-color: #131C14; }

        .variants-section { margin-top: 32px; border-top: 1px solid #D4CFC8; padding-top: 32px; }
        .section-subtitle { font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: #1A2F1C; font-weight: 600; margin-bottom: 20px; }
        .variant-card { background: #F0EDE6; border: 1px solid #D4CFC8; padding: 24px; margin-bottom: 20px; position: relative; border-radius: 1px; }
        .variant-card-header { display: flex; gap: 16px; align-items: flex-end; margin-bottom: 16px; }
        .btn-remove-variant { background: none; border: none; color: #8B2020; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; cursor: pointer; padding-bottom: 14px; font-weight: 500; }
        .btn-add-variant { background: #FAFAF8; color: #131C14; border: 1px dashed #C4A882; padding: 14px; font-family: 'Jost', sans-serif; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; width: 100%; transition: all 0.3s; font-weight: 500; }
        .btn-add-variant:hover { background: #131C14; color: #FAFAF8; border-color: #131C14; }

        .upload-container { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
        .images-flex { display: flex; flex-wrap: wrap; gap: 12px; }
        .img-preview-box { width: 68px; height: 90px; border: 1px solid #D4CFC8; background: #FAFAF8; overflow: hidden; position: relative; }
        .img-preview-box img { width: 100%; height: 100%; object-fit: cover; }
        .btn-del-img { position: absolute; top: 2px; right: 2px; background: rgba(139,32,32,0.85); color: white; border: none; width: 16px; height: 16px; font-size: 9px; display: flex; align-items: center; justify-content: center; cursor: pointer; border-radius: 50%; }
        .add-photo-trigger { width: 68px; height: 90px; border: 1px dashed #C4A882; display: flex; align-items: center; justify-content: center; color: #1A2F1C; cursor: pointer; font-size: 18px; background: #FAFAF8; }

        .checkbox-group { flex-direction: row; align-items: center; gap: 10px; margin-top: 10px; }
        .checkbox-group input { width: auto; cursor: pointer; transform: scale(1.1); }

        .btn-submit { width: 100%; padding: 18px; background: #131C14; color: #FAFAF8; border: none; font-family: 'Jost', sans-serif; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; cursor: pointer; margin-top: 30px; transition: background 0.2s; }
        .btn-submit:hover:not(:disabled) { background: #2D4A2F; }
        .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        .message { padding: 14px; font-size: 13px; text-align: center; margin-bottom: 20px; letter-spacing: 0.5px; }
        .message.success { background: rgba(45,74,47,0.1); color: #1A2F1C; border-left: 4px solid #2D4A2F; }
        .message.error { background: rgba(139,32,32,0.1); color: #8B2020; border-left: 4px solid #8B2020; }
      `}} />

      <header>
        <Link href="/admin" className="nav-back">← Retour Dashboard</Link>
        <div className="brand">AYVER ATELIER</div>
      </header>

      <div className="form-container">
        <h1 className="form-title">Ajouter une <em>Nouvelle Pièce</em></h1>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">

            <div className="form-group full">
              <label>Nom de l'article *</label>
              <input
                type="text"
                placeholder="Ex: Maillot Retro AC Milan 1996"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Prix (DH) *</label>
              <input
                type="number"
                placeholder="Ex: 450"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Stock Global Initial *</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Vestiaire (Catégorie)</label>
              <select value={category} onChange={(e) => handleCategoryChange(e.target.value)}>
                <option value="jersey">Jerseys Officiels</option>
                <option value="T-shirts">T-shirts Oversize</option>
                <option value="hoodies-sweats">Hoodies & Sweatshirts</option>
                <option value="jackets">Jackets & Outerwear</option>
                <option value="pants-cargo">Cargo & Pantalons</option>
                <option value="sneakers">Sneakers</option>
                <option value="accessories">Accessories</option>
              </select>
            </div>

            <div className="form-group">
              <label>Ligne / Genre</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="unisex">Unisex / Univers Mixte</option>
                <option value="men">Homme</option>
                <option value="women">Femme</option>
              </select>
            </div>

            <div className="form-group">
              <label>Club / Équipe (Optionnel)</label>
              <input
                type="text"
                placeholder="Ex: Real Madrid, Paris..."
                value={club}
                onChange={(e) => setClub(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Collection Drop</label>
              <input
                type="text"
                value={collection}
                onChange={(e) => setCollection(e.target.value)}
              />
            </div>

            {category !== "accessories" ? (
              <div className="form-group full sizes-section">
                <label>{category === "sneakers" ? "Pointures actives pour ce modèle" : "Tailles actives pour ce modèle"}</label>
                <div className="sizes-grid">
                  {sortedSizes.map((sz) => (
                    <button
                      type="button"
                      key={sz}
                      className={`size-btn ${selectedSizes[sz] ? "active" : ""}`}
                      onClick={() => handleSizeToggle(sz)}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="form-group full sizes-section" style={{ textAlign: "center", color: "#7A8A7B", fontSize: "12px" }}>
                ✨ <strong>Mode Accessoires :</strong> Cet article sera configuré en taille unique.
              </div>
            )}

            <div className="form-group full variants-section">
              <div className="section-subtitle">Variantes de couleurs & Galeries photos dédiées</div>

              {variants.map((v, index) => (
                <div key={index} className="variant-card">
                  <div className="variant-card-header">
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Couleur / Variante n°{index + 1}</label>
                      <input
                        type="text"
                        required
                        value={v.color}
                        onChange={(e) => handleColorChange(index, e.target.value)}
                        placeholder="Ex: Rouge (Home), Blanc (Away), Noir..."
                      />
                    </div>
                    {variants.length > 1 && (
                      <button type="button" className="btn-remove-variant" onClick={() => removeVariant(index)}>
                        Supprimer
                      </button>
                    )}
                  </div>

                  <div className="upload-container">
                    <label>Photos de la variante ({v.color || `n°${index + 1}`}) :</label>
                    <div className="images-flex">
                      {v.images.map((img, i) => (
                        <div key={i} className="img-preview-box">
                          <img src={img} alt="Aperçu déclinaison" />
                          <button type="button" className="btn-del-img" onClick={() => removeSpecificImage(index, i)}>✕</button>
                        </div>
                      ))}
                      <label htmlFor={`file-up-${index}`} className="add-photo-trigger">+</label>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleImages(e, index)}
                        style={{ display: "none" }}
                        id={`file-up-${index}`}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button type="button" className="btn-add-variant" onClick={addVariant}>
                + Ajouter une autre couleur / option pour ce produit
              </button>
            </div>

            <div className="form-group full checkbox-group">
              <input
                type="checkbox"
                id="outOfStock"
                checked={isOutOfStock}
                onChange={(e) => setIsOutOfStock(e.target.checked)}
              />
              <label htmlFor="outOfStock" style={{ margin: 0, cursor: 'pointer' }}>
                Forcer cet article en rupture de stock ("Épuisé")
              </label>
            </div>

          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Création dans l'atelier..." : "Valider et Publier l'article"}
          </button>
        </form>
      </div>
    </>
  );
}