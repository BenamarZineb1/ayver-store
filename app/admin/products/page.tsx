"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);

  const [category, setCategory] = useState("all");
  const [gender, setGender] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [sortPrice, setSortPrice] = useState("default");

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
          setFiltered(data);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    let result = [...products];

    if (category !== "all") {
      result = result.filter((p) => p.category?.toLowerCase() === category.toLowerCase());
    }
    if (gender !== "all") {
      result = result.filter((p) => p.gender === gender);
    }
    if (availability === "in") {
      result = result.filter((p) => p.stock > 0 && !p.isOutOfStock);
    }
    if (availability === "out") {
      result = result.filter((p) => p.stock === 0 || p.isOutOfStock);
    }

    if (sortPrice === "low") result.sort((a, b) => b.price - a.price);
    if (sortPrice === "high") result.sort((a, b) => a.price - b.price);

    setFiltered(result);
  }, [category, gender, availability, sortPrice, products]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=Jost:wght=200;300;400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --cream:#F0EDE6; --dark:#131C14; --forest:#1A2F1C; --mid:#2D4A2F;
          --accent:#3A6B3D; --gold:#C4A882; --text-muted:#7A8A7B; --border:#D4CFC8; --white:#FAFAF8; --danger:#8B2020;
        }
        body { background:var(--cream); color:var(--dark); font-family:'Jost',sans-serif; font-weight:300; }
        .shop-container { max-width:1000px; margin:0 auto; padding:80px 40px; }
        .shop-header { margin-bottom:40px; padding-bottom:24px; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:flex-end; }
        .shop-header h1 { font-family:'Playfair Display',serif; font-size:42px; font-weight:700; }
        .btn-back { font-size:11px; letter-spacing:2px; text-transform:uppercase; text-decoration:none; color:var(--text-muted); border:1px solid var(--border); padding:10px 20px; background:var(--white); }
        .filter-surface { background:var(--white); border:1px solid var(--border); padding:24px; margin-bottom:40px; display:grid; grid-template-columns:repeat(4, 1fr); gap:12px; }
        .filter-group { display:flex; flex-direction:column; gap:6px; }
        .filter-group label { font-size:9px; letter-spacing:1px; color:var(--text-muted); text-transform:uppercase; }
        .filter-group select { padding:12px; border:1px solid var(--border); background:var(--cream); font-size:12px; outline:none; }
        .grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(220px, 1fr)); gap:30px; }
        .card { background:var(--white); border:1px solid var(--border); overflow:hidden; display:flex; flex-direction:column; position:relative; text-decoration:none; color:inherit; }
        .img-box { aspect-ratio:3/4; background:var(--dark); position:relative; overflow:hidden; display:flex; align-items:center; justify-content:center; }
        .img-box img { width:100%; height:100%; object-fit:cover; position:absolute; inset:0; z-index:2; }
        .badge-out-of-stock { position:absolute; top:12px; left:12px; background:var(--danger); color:var(--white); padding:6px 12px; font-size:10px; z-index:5; text-transform:uppercase; }
        .mock { font-family:'Playfair Display',serif; font-size:80px; font-weight:700; color:rgba(255,255,255,0.06); font-style:italic; z-index:1; }
        .info { padding:24px; display:flex; flex-direction:column; gap:12px; }
        .info-main h4 { font-family:'Playfair Display',serif; font-size:17px; }
        .price { font-size:14px; margin-top:4px; }
        .view-link { font-size:11px; color:var(--gold); text-transform:uppercase; }
        @media(max-width:900px){ .filter-surface { grid-template-columns:repeat(2, 1fr); } }
        @media(max-width:640px){ .grid { grid-template-columns:1fr 1fr; gap:16px; } }
      `}} />

      <div className="shop-container">
        <header className="shop-header">
          <div>
            <h1>AYVER <em>Catalogue</em></h1>
          </div>
          <Link href="/admin" className="btn-back">Retour au Dashboard</Link>
        </header>

        <section className="filter-surface">
          <div className="filter-group">
            <label>Échelle des Prix</label>
            <select value={sortPrice} onChange={(e) => setSortPrice(e.target.value)}>
              <option value="default">Ordre Naturel</option>
              <option value="low">Prix : Élevé ← Bas</option>
              <option value="high">Prix : Bas ← Élevé</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Ligne</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="all">Univers Mixte</option>
              <option value="unisex">Unisex</option>
              <option value="men">Homme</option>
              <option value="women">Femme</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Vestiaire (Catégorie)</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="all">Toutes les pièces</option>
              <option value="jersey">Jerseys Officiels</option>
              <option value="T-shirts">T-shirts Oversize</option>
              <option value="hoodies-sweats">Hoodies & Sweatshirts</option>
              <option value="jackets">Jackets & Outerwear</option>
              <option value="pants-cargo">Cargo & Pantalons</option>
              <option value="sneakers">Sneakers (36-44)</option>
              <option value="accessories">Accessories</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Disponibilité</label>
            <select value={availability} onChange={(e) => setAvailability(e.target.value)}>
              <option value="all">Tout le catalogue</option>
              <option value="in">Disponible</option>
              <option value="out">Épuisé</option>
            </select>
          </div>
        </section>

        <main>
          <div className="grid">
            {filtered.map((p) => {
              const initial = p.name ? p.name.charAt(0) : "A";
              const isOut = p.stock === 0 || p.isOutOfStock;

              // CORRECTION 3 : Fallback sécurisée au cas où le champ est corrompu ou null
              const displayImage =
                p.image ||
                p.images?.[0] ||
                p.variants?.find((v: any) => v.images?.length > 0)?.images?.[0] ||
                "/placeholder.jpg";

              return (
                <Link href={`/admin/products/${p.id}`} className={`card ${isOut ? "card-disabled" : ""}`} key={p.id}>
                  <div className="img-box">
                    {isOut && <div className="badge-out-of-stock">Épuisé</div>}
                    <div className="mock">{initial}</div>

                    {/* CORRECTION 4 : Injection du onError magique pour rattraper les liens cassés */}
                    <img
                      src={displayImage}
                      alt={p.name}
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/placeholder.jpg";
                      }}
                    />
                  </div>
                  <div className="info">
                    <div className="info-main">
                      <h4>{p.name}</h4>
                      <p className="price">{p.price} DH</p>
                    </div>
                    <span className="view-link">Modifier →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </main>
      </div>
    </>
  );
}