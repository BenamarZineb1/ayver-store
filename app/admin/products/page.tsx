"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const CLOTHING_SIZES = ["S", "M", "L", "XL", "XXL"];
const SNEAKER_SIZES = ["36", "37", "38", "39", "40", "41", "42", "43", "44"];

interface ProductForm {
  name: string;
  price: string;
  stock: string;
  category: string;
  gender: string;
  club: string;
  collection: string;
  isOutOfStock: boolean;
  sizes: Record<string, boolean>;
}

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // GESTION SIMPLIFIÉE DES VISUELS (À plat, sans variantes)
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [rawFiles, setRawFiles] = useState<File[]>([]);

  // État unifié du formulaire
  const [form, setForm] = useState<ProductForm>({
    name: "",
    price: "",
    stock: "10",
    category: "jersey",
    gender: "unisex",
    club: "",
    collection: "Essential Drop",
    isOutOfStock: false,
    sizes: { S: false, M: true, L: false, XL: false, XXL: false }
  });

  const handleSizeToggle = (size: string) => {
    setForm(prev => ({
      ...prev,
      sizes: { ...prev.sizes, [size]: !prev.sizes[size] }
    }));
  };

  const handleCategoryChange = (cat: string) => {
    let updatedSizes: Record<string, boolean> = {};

    if (cat === "sneakers") {
      SNEAKER_SIZES.forEach(s => updatedSizes[s] = s === "40" || s === "41");
    } else if (cat === "accessories") {
      updatedSizes = {};
    } else {
      CLOTHING_SIZES.forEach(s => updatedSizes[s] = s === "M");
    }

    setForm(prev => ({ ...prev, category: cat, sizes: updatedSizes }));
  };

  // Traitement et création d'URLs éphémères pour l'aperçu local
  function handleImages(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const previewUrls = files.map(file => URL.createObjectURL(file));

    setImagePreviews(prev => [...prev, ...previewUrls]);
    setRawFiles(prev => [...prev, ...files]);
  }

  // Nettoyage de la mémoire et suppression de l'image sélectionnée
  function removeSpecificImage(imageIndex: number) {
    const urlToDel = imagePreviews[imageIndex];
    if (urlToDel && urlToDel.startsWith("blob:")) {
      URL.revokeObjectURL(urlToDel);
    }

    setImagePreviews(prev => prev.filter((_, idx) => idx !== imageIndex));
    setRawFiles(prev => prev.filter((_, idx) => idx !== imageIndex));
  }

  // COMPRESSION DES IMAGES CÔTÉ CLIENT (Limite à 1000px max, qualité 75%)
  const fileToCompressedBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 1000;
          const MAX_HEIGHT = 1000;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
          } else {
            if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return resolve(event.target?.result as string);

          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.75);
          resolve(compressedBase64);
        };
        img.onerror = () => reject(new Error("Erreur lors de la mise à l'échelle du fichier image"));
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // Exécution de la compression asynchrone sur toutes les images à plat
      const base64Images = await Promise.all(
        rawFiles.map(file => fileToCompressedBase64(file))
      );

      const hasSizes = Object.keys(form.sizes).length > 0;
      const isGloballyOutOfStock = hasSizes ? Object.values(form.sizes).every(status => status === false) : false;
      const firstImageUrl = base64Images[0] || null;

      const payload = {
        name: form.name,
        price: Number(form.price),
        stock: Number(form.stock),
        isOutOfStock: form.isOutOfStock || Number(form.stock) === 0 || isGloballyOutOfStock,
        category: form.category,
        gender: form.gender,
        club: form.club,
        collection: form.collection,
        sizes: form.sizes,
        image: firstImageUrl,
        images: base64Images
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "✨ Produit ajouté avec succès au vestiaire AYVER !" });

        // Révocation de toutes les URLs Blob créées pour éviter les fuites mémoire
        imagePreviews.forEach(url => {
          if (url.startsWith("blob:")) URL.revokeObjectURL(url);
        });

        setTimeout(() => {
          router.push("/admin");
          router.refresh();
        }, 1500);
      } else {
        setMessage({ type: "error", text: data.error || "Une erreur est survenue." });
      }
    } catch (error: unknown) {
      console.error(error);
      setMessage({ type: "error", text: "Impossible de communiquer avec l'API ou d'enregistrer le produit." });
    } finally {
      setLoading(false);
    }
  };

  const sortedSizes = Object.keys(form.sizes).sort((a, b) => {
    if (form.category === "sneakers") {
      return Number(a) - Number(b);
    }
    return CLOTHING_SIZES.indexOf(a) - CLOTHING_SIZES.indexOf(b);
  });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght=0,400;0,600;0,700&family=Jost:wght=300;400;500&display=swap');

        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

        html, body {
          background-color: #F0EDE6 !important;
          margin: 0;
          padding: 0;
          width: 100%;
          min-height: 100%;
          -webkit-text-size-adjust: 100%;
        }

        body { background: #F0EDE6; color: #131C14; font-family: 'Jost', sans-serif; overflow-x: hidden; }

        header {
          background: #131C14;
          color: #FAFAF8;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        @media(min-width: 768px) { header { padding: 20px 40px; } }

        .nav-back { color: #C4A882; text-decoration: none; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; font-weight: 500; }
        .brand { font-family: 'Playfair Display', serif; font-size: 18px; letter-spacing: 2px; color: #FAFAF8; }
        @media(min-width: 768px) { .brand { font-size: 20px; } }

        .form-container {
          max-width: 800px;
          margin: 24px auto 60px auto;
          padding: 24px 16px;
          background: #FAFAF8;
          border: 1px solid #D4CFC8;
          border-radius: 2px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.02);
          box-sizing: border-box;
          min-height: 100dvh;
        }
        @media(min-width: 768px) { .form-container { margin: 50px auto; padding: 40px; min-height: auto; } }

        .form-title { font-family: 'Playfair Display', serif; font-size: 28px; margin-bottom: 24px; font-weight: 700; text-align: center; line-height: 1.2; }
        @media(min-width: 768px) { .form-title { font-size: 32px; margin-bottom: 30px; } }
        .form-title em { font-style: italic; font-weight: 400; color: #1A2F1C; }

        .form-grid { display: grid; grid-template-columns: 1fr; gap: 20px; margin-bottom: 24px; }
        @media(min-width: 600px) { .form-grid { grid-template-columns: 1fr 1fr; gap: 24px; } }

        .form-group { display: flex; flex-direction: column; gap: 8px; }
        @media(min-width: 600px) { .form-group.full { grid-column: span 2; } }

        label { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #7A8A7B; font-weight: 500; }

        input, select {
          padding: 14px 16px;
          border: 1px solid #D4CFC8;
          background: #F0EDE6;
          font-family: 'Jost', sans-serif;
          font-size: 16px;
          color: #131C14;
          outline: none;
          border-radius: 1px;
          -webkit-appearance: none;
        }
        @media(min-width: 768px) { input, select { font-size: 14px; } }
        input:focus, select:focus { border-color: #131C14; background: #FAFAF8; }

        .sizes-section { margin-top: 12px; padding: 20px; background: #F0EDE6; border: 1px solid #D4CFC8; }
        @media(min-width: 768px) { .sizes-section { padding: 24px; } }

        .sizes-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 8px; }
        @media(min-width: 480px) { .sizes-grid { grid-template-columns: repeat(4, 1fr); } }
        @media(min-width: 768px) { .sizes-grid { grid-template-columns: repeat(5, 1fr); } }

        .size-btn { padding: 12px 4px; border: 1px solid #D4CFC8; background: #FAFAF8; font-family: 'Jost', sans-serif; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.2s; text-align: center; -webkit-appearance: none; }
        .size-btn.active { background: #131C14; color: #FAFAF8; border-color: #131C14; }

        .gallery-section { margin-top: 32px; border-top: 1px solid #D4CFC8; padding-top: 32px; }
        .section-subtitle { font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: #1A2F1C; font-weight: 600; margin-bottom: 20px; }
        .gallery-card { background: #F0EDE6; border: 1px solid #D4CFC8; padding: 20px; margin-bottom: 20px; position: relative; border-radius: 1px; }

        .upload-container { display: flex; flex-direction: column; gap: 8px; }
        .images-flex { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }

        .img-preview-box { width: 68px; height: 90px; border: 1px solid #D4CFC8; background: #FAFAF8; overflow: hidden; position: relative; z-index: 1; }
        .img-preview-image { object-fit: cover; }
        .btn-del-img { position: absolute; top: 2px; right: 2px; background: rgba(139,32,32,0.9); color: white; border: none; width: 18px; height: 18px; font-size: 9px; display: flex; align-items: center; justify-content: center; cursor: pointer; border-radius: 50%; z-index: 10; }
        .add-photo-trigger { width: 68px; height: 90px; border: 1px dashed #C4A882; display: flex; align-items: center; justify-content: center; color: #1A2F1C; cursor: pointer; font-size: 22px; background: #FAFAF8; font-weight: 300; }

        .checkbox-group { flex-direction: row; align-items: center; gap: 10px; margin-top: 16px; }
        .checkbox-group input { width: auto; cursor: pointer; transform: scale(1.1); -webkit-appearance: checkbox; }

        .btn-submit { width: 100%; padding: 18px; background: #131C14; color: #FAFAF8; border: none; font-family: 'Jost', sans-serif; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; cursor: pointer; margin-top: 30px; transition: background 0.2s; text-align: center; -webkit-appearance: none; }
        .btn-submit:hover:not(:disabled) { background: #2D4A2F; }
        .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        .message { padding: 14px; font-size: 13px; text-align: center; margin-bottom: 20px; letter-spacing: 0.5px; }
        .message.success { background: rgba(45,74,47,0.1); color: #1A2F1C; border-left: 4px solid #2D4A2F; }
        .message.error { background: rgba(139,32,32,0.1); color: #8B2020; border-left: 4px solid #8B2020; }
      `}} />

      <header>
        <Link href="/admin" className="nav-back">← Dashboard</Link>
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
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Prix (DH) *</label>
              <input
                type="number"
                placeholder="Ex: 450"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Stock Global Initial *</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Vestiaire (Catégorie)</label>
              <select value={form.category} onChange={(e) => handleCategoryChange(e.target.value)}>
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
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
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
                value={form.club}
                onChange={(e) => setForm({ ...form, club: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Collection Drop</label>
              <input
                type="text"
                value={form.collection}
                onChange={(e) => setForm({ ...form, collection: e.target.value })}
              />
            </div>

            {form.category !== "accessories" ? (
              <div className="form-group full sizes-section">
                <label>{form.category === "sneakers" ? "Pointures actives pour ce modèle" : "Tailles actives pour ce modèle"}</label>
                <div className="sizes-grid">
                  {sortedSizes.map((sz) => (
                    <button
                      type="button"
                      key={sz}
                      className={`size-btn ${form.sizes[sz] ? "active" : ""}`}
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

            {/* GALERIE DE VISUELS SIMPLIFIÉE */}
            <div className="form-group full gallery-section">
              <div className="section-subtitle">Gestion des visuels produits</div>

              <div className="gallery-card">
                <div className="upload-container">
                  <span style={{ fontSize: "10px", letterSpacing: "1px", color: "#7A8A7B", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
                    Photos du produit (la première sera la photo principale) :
                  </span>
                  <div className="images-flex">
                    {imagePreviews.map((img, i) => (
                      <div key={i} className="img-preview-box">
                        <Image
                          src={img}
                          alt="Aperçu produit"
                          fill
                          sizes="68px"
                          className="img-preview-image"
                          unoptimized
                        />
                        <button type="button" className="btn-del-img" onClick={() => removeSpecificImage(i)}>✕</button>
                      </div>
                    ))}
                    <label htmlFor="file-up-page" className="add-photo-trigger">+</label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImages}
                      style={{ display: "none" }}
                      id="file-up-page"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="form-group full checkbox-group">
              <input
                type="checkbox"
                id="outOfStock"
                checked={form.isOutOfStock}
                onChange={(e) => setForm({ ...form, isOutOfStock: e.target.checked })}
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