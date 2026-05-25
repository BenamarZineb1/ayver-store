"use client";

import { useEffect, useState, useMemo, KeyboardEvent, MouseEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { addToCart, getCart } from "@/lib/cart";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category?: string;
  club?: string;
  gender?: string;
  images?: string[];
  isOutOfStock?: boolean;
  isNewDrop?: boolean;
  sizes?: Record<string, boolean>;
}

const CLOTHING_SIZES = ["S", "M", "L", "XL", "XXL"];
const SNEAKER_SIZES = ["36", "37", "38", "39", "40", "41", "42", "43", "44"];

export default function CatalogPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [cartCount, setCartCount] = useState<number>(0);
  const [addedProduct, setAddedProduct] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<'categories' | 'products'>('categories');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  const [search, setSearch] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedGender, setSelectedGender] = useState<string>("all");
  const [selectedAvailability, setSelectedAvailability] = useState<string>("all");
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [isNewDropOnly, setIsNewDropOnly] = useState<boolean>(false);
  const [sortPrice, setSortPrice] = useState<string>("default");

  useEffect(() => {
    fetch("/api/products", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Simulation optionnelle des drops récents sur les premiers index
          const processedData = data.map((product, index) => ({
            ...product,
            isNewDrop: product.isNewDrop ?? index < 4,
          }));
          setProducts(processedData);
        }
      })
      .catch((e) => console.error("Erreur API catalogue:", e));

    const updateCartCount = () => {
      const cart = getCart();
      setCartCount(cart.reduce((acc, item) => acc + item.qty, 0));
    };

    updateCartCount();

    window.addEventListener("storage", updateCartCount);
    window.addEventListener("cart-updated", updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("cart-updated", updateCartCount);
    };
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter((p) =>
        (p.name || "").toLowerCase().includes(searchLower) ||
        (p.club || "").toLowerCase().includes(searchLower)
      );
    }

    if (selectedCategory !== "all") {
      result = result.filter((p) => (p.category || "").toLowerCase() === selectedCategory.toLowerCase());
    }

    if (isNewDropOnly) {
      result = result.filter((p) => p.isNewDrop === true);
    }

    if (selectedGender !== "all") {
      result = result.filter((p) => p.gender === selectedGender);
    }

    if (selectedAvailability === "in") {
      result = result.filter((p) => p.stock > 0 && !p.isOutOfStock);
    } else if (selectedAvailability === "out") {
      result = result.filter((p) => p.stock === 0 || p.isOutOfStock === true);
    }

    if (selectedCategory !== "accessories" && selectedSize) {
      result = result.filter((p) => {
        if (p.category?.toLowerCase() === "accessories") return true;
        if (!p.sizes) return false;
        return p.sizes[selectedSize] === true;
      });
    }

    if (sortPrice === "low") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortPrice === "high") {
      result.sort((a, b) => a.price - b.price);
    }

    return result;
  }, [search, selectedCategory, isNewDropOnly, selectedGender, selectedAvailability, selectedSize, sortPrice, products]);

  const handleSelectCategoryFromCard = (categoryValue: string) => {
    setSelectedCategory(categoryValue);
    setIsNewDropOnly(false);
    if (categoryValue === "sneakers") {
      setSelectedSize("40");
    } else {
      setSelectedSize("M");
    }
    setViewMode('products');
  };

  const handleBackToCategories = () => {
    setSelectedCategory("all");
    setSelectedSize("M");
    setViewMode('categories');
  };

  const handleAddToCart = (e: MouseEvent<HTMLButtonElement>, product: Product) => {
    e.stopPropagation();
    if (product.stock === 0 || product.isOutOfStock) return;

    const finalSize = product.category === "accessories" ? "Unique" : selectedSize;
    const displayImage = product.images?.[0] || "/placeholder.jpg";

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      size: finalSize,
      image: displayImage
    });

    // Émission globale pour rafraîchir la Navbar instantanément
    window.dispatchEvent(new Event("cart-updated"));

    setAddedProduct(product.name);
    setTimeout(() => setAddedProduct(null), 3000);
  };

  const renderSizeSelector = () => {
    if (selectedCategory === "accessories") {
      return <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Taille Unique (Ajustable)</p>;
    }
    const sizesToRender = selectedCategory === "sneakers" ? SNEAKER_SIZES : CLOTHING_SIZES;
    return (
      <div className="size-selector-wrap">
        {sizesToRender.map((sz) => (
          <button
            key={sz}
            className={`size-btn ${selectedSize === sz ? "active" : ""}`}
            onClick={() => setSelectedSize(sz)}
          >
            {sz}
          </button>
        ))}
      </div>
    );
  };

  const FilterFilters = () => (
    <>
      <div className="filter-group">
        <label>Recherche Ciblée</label>
        <input
          type="text"
          className="search-input"
          placeholder="Rechercher un produit..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="filter-group">
        <label>Échelle des Prix</label>
        <select className="filter-select" value={sortPrice} onChange={(e) => setSortPrice(e.target.value)}>
          <option value="default">Ordre Naturel</option>
          <option value="low">Prix : Élevé ← Bas</option>
          <option value="high">Prix : Bas ← Élevé</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Vestiaire (Catégorie)</label>
        <select className="filter-select" value={selectedCategory} onChange={(e) => {
          const cat = e.target.value;
          setSelectedCategory(cat);
          if (cat === "sneakers") setSelectedSize("40");
          else if (cat !== "accessories") setSelectedSize("M");
        }}>
          <option value="all">Toutes les pièces</option>
          <option value="jersey">Jerseys Officiels</option>
          <option value="T-shirts">T-shirts Oversize</option>
          <option value="hoodies-sweats">Hoodies & Sweatshirts</option>
          <option value="jackets">Jackets & Outerwear</option>
          <option value="pants-cargo">Cargo & Pantalons</option>
          <option value="sneakers">Sneakers</option>
          <option value="accessories">Accessories</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Sélection exclusive</label>
        <select className="filter-select" value={isNewDropOnly ? "yes" : "no"} onChange={(e) => setIsNewDropOnly(e.target.value === "yes")}>
          <option value="no">Tout le catalogue</option>
          <option value="yes">Uniquement les New Drops 🔥</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Ligne</label>
        <select className="filter-select" value={selectedGender} onChange={(e) => setSelectedGender(e.target.value)}>
          <option value="all">Univers Mixte</option>
          <option value="unisex">Unisex</option>
          <option value="men">Homme</option>
          <option value="women">Femme</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Disponibilité</label>
        <select className="filter-select" value={selectedAvailability} onChange={(e) => setSelectedAvailability(e.target.value)}>
          <option value="all">Toutes les pièces</option>
          <option value="in">Disponible Immédiatement</option>
          <option value="out">Éditions Épuisées</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Coupe & Pointure Rapide</label>
        {renderSizeSelector()}
      </div>
    </>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght=0,400;0,600;0,700;0,900;1,400;1,700&family=Jost:wght=200;300;400;500&display=swap');

        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

        :root{
          --cream:#F0EDE6; --dark:#131C14; --forest:#1A2F1C; --mid:#2D4A2F;
          --accent:#3A6B3D; --gold:#C4A882; --text-muted:#7A8A7B; --border:#D4CFC8; --white:#FAFAF8;
        }

        html, body {
          background-color: #F0EDE6 !important;
          color: #131C14 !important;
          margin: 0;
          padding: 0;
          width: 100%;
          min-height: 100%;
          -webkit-text-size-adjust: 100%;
        }
        body { background:var(--cream); color:var(--dark); font-family:'Jost',sans-serif; font-weight:300; overflow-x:hidden; }

        .toast { position:fixed; bottom:30px; right:30px; background:var(--dark); color:var(--white); padding:16px 32px; font-size:11px; letter-spacing:2px; text-transform:uppercase; z-index:1000; transform:translateY(100px); opacity:0; transition:all 0.4s cubic-bezier(0.16, 1, 0.3, 1); border: 1px solid rgba(196,168,130,0.2); }
        .toast.show { transform:translateY(0); opacity:1; }

        nav { position:sticky; top:0; z-index:100; background:var(--cream); border-bottom:1px solid var(--border); padding:0 40px; display:flex; align-items:center; justify-content:space-between; height:72px; }
        .nav-links { display:flex; gap:36px; list-style:none; }
        .nav-links a, .nav-back-btn { font-size:11px; letter-spacing:2.5px; text-transform:uppercase; text-decoration:none; color:var(--dark); font-weight:400; background:none; border:none; cursor:pointer; font-family:'Jost',sans-serif; }
        .logo-wrap { display:flex; flex-direction:column; align-items:center; text-decoration:none; color:var(--dark); }
        .logo-name { font-family:'Playfair Display',serif; font-size:28px; font-weight:700; letter-spacing:6px; color:var(--forest); line-height:1; }
        .logo-sub { font-size:8px; letter-spacing:4px; color:var(--text-muted); margin-top:2px; text-transform: uppercase; }
        .nav-actions { display:flex; gap:20px; align-items:center; }
        .nav-icon { background:none; border:none; cursor:pointer; font-size:14px; color:var(--dark); text-decoration:none; font-family:'Jost',sans-serif; text-transform:uppercase; font-weight:500; letter-spacing:1px; }
        .nav-icon span.badge { background:var(--dark); color:var(--cream); padding:2px 6px; border-radius:10px; font-size:10px; margin-left:4px; }

        .categories { padding: 80px 40px; max-width: 1300px; margin: 0 auto; }
        .section-header { text-align:center; margin-bottom:54px; }
        .section-eyebrow { font-size:10px; letter-spacing:4px; color:var(--text-muted); text-transform:uppercase; margin-bottom:16px; display:block; }
        .section-title { font-family:'Playfair Display',serif; font-size:clamp(32px,4vw,54px); font-weight:700; color:var(--dark); line-height:1.1; }
        .section-title em { font-style:italic; color:var(--accent); font-weight:400; }

        .cat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
        .cat-card { position: relative; aspect-ratio: 3/4; border-radius: 4px; overflow: hidden; cursor: pointer; display: flex; flex-direction: column; justify-content: space-between; padding: 30px; border: 1px solid rgba(196,168,130,0.1); transition: transform 0.4s ease, border-color 0.3s; background-size: cover !important; background-position: center !important; }
        .cat-card:hover { transform: translateY(-4px); border-color: var(--gold); }
        .cat-img-mock { font-family: 'Playfair Display', serif; font-size: 110px; font-weight: 900; color: rgba(255,255,255,0.03); position: absolute; top: 20px; right: 20px; pointer-events: none; font-style: italic; z-index: 2; }
        .cat-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(19,28,20,0.1) 20%, rgba(19,28,20,0.85) 100%); z-index: 1; transition: background 0.3s; }
        .cat-card:hover .cat-overlay { background: linear-gradient(to bottom, rgba(19,28,20,0.3) 20%, rgba(19,28,20,0.95) 100%); }
        .cat-pill { position: relative; z-index: 2; align-self: flex-start; background: var(--gold); color: var(--dark); font-size: 9px; font-weight: 500; letter-spacing: 1.5px; text-transform: uppercase; padding: 4px 10px; border-radius: 2px; }
        .cat-info { position: relative; z-index: 2; margin-top: auto; }
        .cat-name { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 600; color: var(--cream); margin-bottom: 12px; }
        .cat-link { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: var(--gold); text-decoration: none; font-weight: 400; transition: color 0.2s; }
        .cat-card:hover .cat-link { color: var(--white); }

        .shop-header-actions { display: none; width: 100%; margin-bottom: 24px; justify-content: flex-end; }
        .btn-trigger-mobile-filter { background: var(--dark); color: var(--cream); border: none; padding: 12px 24px; font-family: 'Jost', sans-serif; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; display: flex; align-items: center; gap: 8px; }

        .shop-container { display:grid; grid-template-columns:280px 1fr; gap:60px; max-width:1300px; margin:0 auto; padding:40px 40px 100px 40px; }

        .sidebar { height:fit-content; position:sticky; top:120px; display: block; }
        .sidebar-title { font-family:'Playfair Display',serif; font-size:18px; margin-bottom:32px; font-weight:700; color:var(--dark); position:relative; padding-bottom:12px; }
        .sidebar-title::after { content:''; position:absolute; bottom:0; left:0; width:30px; height:2px; background:var(--gold); }
        .filter-group { margin-bottom:24px; display:flex; flex-direction:column; }
        .filter-group label { font-size:10px; letter-spacing:2px; text-transform:uppercase; color:var(--text-muted); margin-bottom:10px; font-weight:500; }
        .filter-select, .search-input { padding:14px; border:1px solid var(--border); background:transparent; font-family:'Jost',sans-serif; font-size:12px; color:var(--dark); outline:none; transition: all 0.3s; }
        .filter-select:focus, .search-input:focus { border-color:var(--dark); background:var(--white); }

        .mobile-filter-drawer { position: fixed; inset: 0; z-index: 999; visibility: hidden; transition: visibility 0.4s; }
        .mobile-filter-drawer.open { visibility: visible; }
        .drawer-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.5); opacity: 0; transition: opacity 0.4s ease; }
        .mobile-filter-drawer.open .drawer-overlay { opacity: 1; }
        .drawer-content { position: absolute; bottom: 0; left: 0; right: 0; background: var(--cream); height: 80vh; border-top-left-radius: 16px; border-top-right-radius: 16px; padding: 30px 24px; overflow-y: auto; transform: translateY(100%); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .mobile-filter-drawer.open .drawer-content { transform: translateY(0); }
        .drawer-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
        .drawer-title { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; }
        .btn-close-drawer { background: none; border: none; font-size: 20px; cursor: pointer; color: var(--dark); }

        .products-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:28px; }
        .prod-card { cursor:pointer; text-decoration: none; color: inherit; display: block; }
        .prod-card.is-sold-out { opacity: 0.65; cursor: not-allowed; }

        .prod-img { aspect-ratio:3/4; background:var(--dark); position:relative; overflow:hidden; margin-bottom:16px; border-radius:2px; }
        .product-image { object-fit:cover; transition:transform .5s ease; }
        .prod-img-inner { width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-family:'Playfair Display',serif; font-size:clamp(40px,6vw,72px); font-weight:900; color:rgba(255,255,255,.05); font-style:italic; transition:transform .5s ease; }
        .prod-card:not(.is-sold-out):hover .product-image, .prod-card:not(.is-sold-out):hover .prod-img-inner { transform:scale(1.04); }

        .prod-badge { position:absolute; top:12px; left:12px; background:var(--forest); color:var(--cream); font-size:9px; letter-spacing:2px; padding:4px 10px; text-transform:uppercase; z-index:4; }
        .prod-badge.out { background:#8B2020; }

        .prod-actions { position:absolute; bottom:0; left:0; right:0; transform:translateY(100%); transition:transform .35s ease; z-index:4; }
        .prod-card:not(.is-sold-out):hover .prod-actions { transform:translateY(0); }
        .prod-add { width:100%; padding:14px; background:var(--dark); color:var(--cream); border:none; cursor:pointer; font-family:'Jost',sans-serif; font-size:10px; letter-spacing:2.5px; text-transform:uppercase; font-weight:400; transition:background .2s; }
        .prod-add:hover { background:var(--forest); }

        .prod-name { font-family:'Playfair Display',serif; font-size:16px; font-weight:600; margin-bottom:6px; color:var(--dark); }
        .prod-club { font-size:11px; color:var(--text-muted); letter-spacing:1.5px; margin-bottom:8px; text-transform:uppercase; }
        .prod-price { font-size:15px; font-weight:500; color:var(--dark); }

        .size-selector-wrap { display:grid; grid-template-columns:repeat(5,1fr); gap:6px; margin-top:4px; }
        .size-btn { padding:10px 4px; border:1px solid var(--border); background:transparent; font-size:10px; font-family:'Jost',sans-serif; cursor:pointer; font-weight:400; text-align:center; color:var(--dark); transition:all 0.2s; }
        .size-btn.active { background:var(--dark); color:var(--white); border-color:var(--dark); font-weight:500; }
        .size-btn:hover:not(.active) { border-color:var(--dark); }

        footer { background:#0A0F0B; color:var(--cream); padding:60px 40px; border-top:1px solid rgba(196,168,130,0.1); }
        .footer-inner { max-width:1300px; margin:0 auto; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:30px; }
        .footer-brand { flex:1; min-width:280px; }
        .footer-logo { font-family:'Playfair Display',serif; font-size:22px; font-weight:700; letter-spacing:4px; color:var(--cream); }
        .footer-desc { font-size:12px; color:rgba(240,237,230,0.4); margin-top:8px; max-width:400px; line-height:1.6; }
        .footer-links { display:flex; gap:16px; flex-wrap:wrap; }
        .btn-footer { border:1px solid rgba(196,168,130,0.3); background:transparent; color:var(--cream); padding:12px 24px; font-size:11px; font-family:'Jost',sans-serif; letter-spacing:2px; text-transform:uppercase; text-decoration:none; transition:all 0.3s; display:inline-flex; align-items:center; gap:8px; }
        .btn-footer:hover { background:var(--cream); color:var(--dark); border-color:var(--cream); }

        @media(max-width:1100px){ .cat-grid { grid-template-columns: repeat(3, 1fr); gap: 20px; } }
        @media(max-width:900px){
          .cat-grid { grid-template-columns: repeat(2, 1fr); gap: 20px; }
          .shop-container { grid-template-columns: 1fr; gap:20px; padding-top: 20px; }
          .products-grid { grid-template-columns: repeat(2, 1fr); }
          .sidebar { display: none; }
          .shop-header-actions { display: flex; }
          .footer-inner { flex-direction:column; text-align:center; }
          .footer-links { justify-content:center; }
        }
        @media(max-width:640px){
          .categories { padding: 40px 20px; }
          .cat-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .products-grid { grid-template-columns: 1fr 1fr; gap:12px; }
          .shop-container { padding: 10px 20px 60px 20px; }
          .nav-links{display:none;}
        }
      `}} />

      {/* TOAST NOTIFICATION */}
      <div className={`toast ${addedProduct ? "show" : ""}`}>
        ✨ Ajouté au Panier : {addedProduct} ({selectedCategory === "accessories" ? "Taille Unique" : selectedSize})
      </div>

      {/* NAVBAR */}
      <nav id="navbar">
        <div className="nav-links">
          {viewMode === 'products' ? (
            <button className="nav-back-btn" onClick={handleBackToCategories}>← LES UNIVERS</button>
          ) : (
            <Link href="/">← ACCUEIL</Link>
          )}
        </div>

        <Link href="/" className="logo-wrap">
          <span className="logo-name">AYVER</span>
          <span className="logo-sub">STREETWEAR & JERSEY</span>
        </Link>

        <div className="nav-actions">
          <Link href="/cart" className="nav-icon">
            PANIER 🛍 <span className="badge">{cartCount}</span>
          </Link>
        </div>
      </nav>

      {/* ÉTAPE 1 : GRILLE DES CATÉGORIES */}
      {viewMode === 'categories' && (
        <section className="categories" id="collections">
          <div className="section-header">
            <span className="section-eyebrow">Style Urbain</span>
            <h2 className="section-title">Explorer les <em>Collections</em></h2>
          </div>

          <div className="cat-grid">
            {[
              { id: "jersey", label: "Jerseys Officiels", img: "/jerseys.jpg", initial: "M", badge: "Retro" },
              { id: "T-shirts", label: "T-Shirts Oversize", img: "/tshirtsoversize.png", initial: "T" },
              { id: "hoodies-sweats", label: "Hoodies & Sweats", img: "/hoodies.png", initial: "H" },
              { id: "jackets", label: "Jackets & Outerwear", img: "/jacket.png", initial: "J" },
              { id: "pants-cargo", label: "Cargo & Pants", img: "/pants.png", initial: "P" },
              { id: "sneakers", label: "Sneakers", img: "/sneakers.png", initial: "S", badge: "Premium" },
              { id: "accessories", label: "Accessories", img: "/accessories.png", initial: "A" },
            ].map((cat) => (
              <div
                key={cat.id}
                className="cat-card"
                style={{ background: `url('${cat.img}')` }}
                onClick={() => handleSelectCategoryFromCard(cat.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => { if (e.key === "Enter") handleSelectCategoryFromCard(cat.id); }}
              >
                <div className="cat-img-mock">{cat.initial}</div>
                <div className="cat-overlay"></div>
                {cat.badge && <div className="cat-pill">{cat.badge}</div>}
                <div className="cat-info">
                  <div className="cat-name">{cat.label}</div>
                  <span className="cat-link">Découvrir</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ÉTAPE 2 : GRILLE DE PRODUITS FILTRÉE */}
      {viewMode === 'products' && (
        <div className="shop-container">

          {/* SIDEBAR PC */}
          <aside className="sidebar">
            <h3 className="sidebar-title">Filtres</h3>
            <FilterFilters />
          </aside>

          {/* MODAL FILTRES MOBILE */}
          <div className={`mobile-filter-drawer ${isMobileFilterOpen ? "open" : ""}`}>
            <div className="drawer-overlay" onClick={() => setIsMobileFilterOpen(false)}></div>
            <div className="drawer-content">
              <div className="drawer-header">
                <span className="drawer-title">Classer & Filtrer</span>
                <button className="btn-close-drawer" onClick={() => setIsMobileFilterOpen(false)}>✕</button>
              </div>
              <FilterFilters />
            </div>
          </div>

          <main>
            <div className="shop-header-actions">
              <button className="btn-trigger-mobile-filter" onClick={() => setIsMobileFilterOpen(true)}>
                Filtrer / Classer ☰
              </button>
            </div>

            <div className="products-grid">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => {
                  const isOut = p.stock === 0 || p.isOutOfStock === true;
                  const initialLetter = p.name ? p.name.charAt(0) : "A";
                  const displayImage = p.images?.[0] || null;

                  let gradBackground = "linear-gradient(135deg, #1A2F1C 0%, #0A1209 100%)";
                  if (p.category === "jersey") gradBackground = "linear-gradient(135deg, #1C1A2F 0%, #090912 100%)";

                  return (
                    <div
                      className={`prod-card ${isOut ? 'is-sold-out' : ''}`}
                      key={p.id}
                      onClick={() => !isOut && router.push(`/products/${p.id}`)}
                      role="button"
                      tabIndex={isOut ? -1 : 0}
                      onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
                        if (!isOut && e.key === "Enter") router.push(`/products/${p.id}`);
                      }}
                    >
                      <div className="prod-img" style={{ background: gradBackground }}>
                        <div className="prod-img-inner">{initialLetter}</div>
                        {displayImage && (
                          <Image
                            src={displayImage}
                            alt={p.name || "Ayver Product"}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 900px) 50vw, 33vw"
                            className="product-image"
                            loading="lazy"
                          />
                        )}

                        {isOut ? (
                          <div className="prod-badge out">Épuisé</div>
                        ) : p.isNewDrop ? (
                          <div className="prod-badge" style={{ backgroundColor: "var(--gold)", color: "var(--dark)" }}>Drop 🔥</div>
                        ) : (
                          <div className="prod-badge">Collection</div>
                        )}

                        {!isOut && (
                          <div className="prod-actions">
                            <button className="prod-add" onClick={(e: MouseEvent<HTMLButtonElement>) => handleAddToCart(e, p)}>
                              Ajouter au panier {p.category === "accessories" ? "" : `(${selectedSize})`}
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="prod-club">{p.club || p.category}</div>
                      <div className="prod-name">{p.name}</div>
                      <div className="prod-price">
                        <span className="price-new">{p.price} DH</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p style={{ gridColumn: 'span 3', textAlign: 'center', padding: '120px 0', color: 'var(--text-muted)', fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: '16px' }}>
                  Aucun article ne correspond à votre sélection actuelle.
                </p>
              )}
            </div>
          </main>
        </div>
      )}

      <footer>
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="footer-logo">AYVER</span>
            <p className="footer-desc">
              Boutique en ligne sélective. Les plus belles pièces streetwear et maillots rétro assemblés dans un vestiaire exclusif. Livraison partout au Maroc.
            </p>
          </div>
          <div className="footer-links">
            <a href="https://www.instagram.com/ayver.store_/" target="_blank" rel="noopener noreferrer" className="btn-footer">
              Suivre sur Instagram ↗
            </a>
            <a href="https://wa.me/212694434456" target="_blank" rel="noopener noreferrer" className="btn-footer">
              Contacter via WhatsApp ↗
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}