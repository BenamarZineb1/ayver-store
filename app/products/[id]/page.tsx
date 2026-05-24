"use client";

import { useEffect, useState, MouseEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { addToCart, getCart } from "@/lib/cart";

// Contrat d'interface strict pour le produit et ses variantes
interface Variant {
  color?: string;
  images?: string[];
}

interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  stock: number;
  category?: string;
  club?: string;
  description?: string;
  image?: string;
  images?: string[];
  isOutOfStock?: boolean;
  sizes?: Record<string, boolean>;
  variants?: Variant[];
}

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [size, setSize] = useState<string>("");
  const [activeImage, setActiveImage] = useState<string>("");
  const [cartCount, setCartCount] = useState<number>(0);
  const [addedProduct, setAddedProduct] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data: Product) => {
        setProduct(data);

        // Définir la première image active disponible de manière sécurisée
        const firstImg =
          data.images?.[0] ||
          data.image ||
          data.variants?.find((v) => (v.images?.length ?? 0) > 0)?.images?.[0] ||
          "/placeholder.jpg";
        setActiveImage(firstImg);

        // Sélection automatique de la première taille disponible cochée à true
        if (data.sizes && Object.keys(data.sizes).length > 0) {
          const availableSizes = Object.keys(data.sizes).filter((s) => data.sizes?.[s] === true);
          if (availableSizes.length > 0) {
            setSize(availableSizes[0]);
          } else {
            setSize("Taille Unique");
          }
        } else {
          setSize("Taille Unique");
        }
      })
      .catch((err) => console.error("Erreur API produit:", err));

    const updateCartCount = () => {
      const cart = getCart();
      setCartCount(cart.reduce((acc, item) => acc + item.qty, 0));
    };

    updateCartCount();

    // Remplacement du setInterval par un EventListener Storage natif et propre
    window.addEventListener("storage", updateCartCount);
    return () => {
      window.removeEventListener("storage", updateCartCount);
    };
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      size: size,
      image: activeImage
    } as any);

    // Synchronisation synchrone immédiate du compteur après ajout
    const updatedCart = getCart();
    setCartCount(updatedCart.reduce((acc, item) => acc + item.qty, 0));

    setAddedProduct(product.name);
    setTimeout(() => setAddedProduct(null), 3000);
  };

  const handleVariantSelect = (variantImages?: string[]) => {
    if (variantImages && variantImages.length > 0) {
      setActiveImage(variantImages[0]);
    }
  };

  if (!product) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: `
          body { background: #F0EDE6; }
          .loading { padding: 120px 20px; text-align: center; font-family: 'Playfair Display', serif; color: #7A8A7B; font-size: 18px; font-style: italic; }
        `}} />
        <div className="loading">Chargement de la création...</div>
      </>
    );
  }

  const initialLetter = product.name ? product.name.charAt(0) : "A";
  const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : null;
  const isGloballyOut = product.stock === 0 || product.isOutOfStock;

  const activeSizesList = product.sizes
    ? Object.keys(product.sizes).filter((s) => product.sizes?.[s] === true)
    : [];

  const allImages: string[] = [
    ...(product.images || []),
    ...(product.variants?.flatMap((v) => v.images || []) || [])
  ].filter((img, index, self) => img && self.indexOf(img) === index);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght=0,400;0,600;0,700;0,900;1,400;1,700&family=Jost:wght=200;300;400;500&display=swap');

        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --cream:#F0EDE6; --dark:#131C14; --forest:#1A2F1C; --mid:#2D4A2F;
          --accent:#3A6B3D; --gold:#C4A882; --text-muted:#7A8A7B; --border:#D4CFC8; --white:#FAFAF8; --danger:#8B2020;
        }
        body { background:var(--cream); color:var(--dark); font-family:'Jost',sans-serif; font-weight:300; overflow-x:hidden; }

        .toast { position:fixed; bottom:30px; right:30px; background:var(--dark); color:var(--white); padding:16px 32px; font-size:11px; letter-spacing:2px; text-transform:uppercase; z-index:1000; transform:translateY(100px); opacity:0; transition:all 0.4s cubic-bezier(0.16, 1, 0.3, 1); border: 1px solid rgba(196,168,130,0.2); }
        .toast.show { transform:translateY(0); opacity:1; }

        nav { position:sticky; top:0; z-index:100; background:var(--cream); border-bottom:1px solid var(--border); padding:0 40px; display:flex; align-items:center; justify-content:space-between; height:72px; }
        .nav-links { display:flex; gap:36px; list-style:none; }
        .nav-links a { font-size:11px; letter-spacing:2.5px; text-transform:uppercase; text-decoration:none; color:var(--dark); font-weight:400; }
        .logo-wrap { display:flex; flex-direction:column; align-items:center; text-decoration:none; color:var(--dark); }
        .logo-name { font-family:'Playfair Display',serif; font-size:28px; font-weight:700; letter-spacing:6px; color:var(--forest); line-height:1; }
        .logo-sub { font-size:8px; letter-spacing:4px; color:var(--text-muted); margin-top:2px; text-transform: uppercase; }
        .nav-actions { display:flex; gap:20px; align-items:center; }
        .nav-icon { background:none; border:none; cursor:pointer; font-size:14px; color:var(--dark); text-decoration:none; font-family:'Jost',sans-serif; text-transform:uppercase; font-weight:500; letter-spacing:1px; }
        .nav-icon span.badge { background:var(--dark); color:var(--cream); padding:2px 6px; border-radius:10px; font-size:10px; margin-left:4px; }

        .product-container { max-width:1200px; margin:0 auto; padding:60px 40px 100px 40px; }
        .product-layout { display:grid; grid-template-columns:1.1fr 0.9fr; gap:60px; align-items:start; }

        /* GALERIE AVEC FIX POUR COMPOSANT NEXT.JS IMAGE FILL */
        .gallery-wrapper { display:flex; flex-direction:column; gap:16px; }
        .image-box { background:var(--dark); display:flex; align-items:center; justify-content:center; aspect-ratio:3/4; overflow:hidden; border-radius:2px; position:relative; }
        .main-product-image { object-fit:cover; }
        .image-placeholder { font-family:'Playfair Display',serif; font-size:120px; font-weight:900; color:rgba(255,255,255,0.04); font-style:italic; position:absolute; }
        .image-letter-front { font-family:'Playfair Display',serif; font-size:72px; font-weight:700; color:var(--cream); font-style:italic; z-index:2; }

        .thumbs-grid { display:flex; gap:10px; flex-wrap:wrap; }
        .thumb-nav { width:60px; height:80px; border:1px solid var(--border); background:var(--white); cursor:pointer; overflow:hidden; opacity:0.6; transition:all 0.2s; position:relative; }
        .thumb-nav.active, .thumb-nav:hover { opacity:1; border-color:var(--dark); }
        .thumb-image { object-fit:cover; }

        .prod-badge { position:absolute; top:20px; left:20px; background:var(--forest); color:var(--cream); font-size:9px; letter-spacing:2px; padding:6px 14px; text-transform:uppercase; z-index:3; }
        .prod-badge.sale { background:#8B2020; }

        .info-box { display:flex; flex-direction:column; }
        .info-category { font-size:11px; letter-spacing:2px; color:var(--text-muted); text-transform:uppercase; margin-bottom:12px; font-weight:500; }
        .info-title { font-family:'Playfair Display',serif; font-size:clamp(32px,4vw,46px); font-weight:700; color:var(--dark); line-height:1.1; margin-bottom:16px; }

        .price-row { display:flex; gap:16px; align-items:center; margin-bottom:24px; }
        .price-current { font-size:24px; font-weight:500; color:var(--dark); }
        .price-old { font-size:18px; color:var(--text-muted); text-decoration:line-through; }

        .stock-tag { font-size:11px; font-weight:500; color:var(--forest); letter-spacing:1.5px; text-transform:uppercase; margin-bottom:24px; display:inline-flex; align-items:center; }
        .stock-tag.out { color:var(--danger); }

        .variant-section { margin-bottom:24px; border-top: 1px solid var(--border); padding-top: 20px; }
        .variant-grid { display:flex; gap:12px; flex-wrap:wrap; margin-top:8px; }
        .variant-pill { padding: 6px 14px; border: 1px solid var(--border); background: var(--white); font-size: 12px; cursor: pointer; font-family: 'Jost', sans-serif; transition: all 0.2s; text-transform: capitalize; }
        .variant-pill:hover { border-color: var(--dark); }

        .size-section { margin-bottom:32px; }
        .size-label { font-size:11px; letter-spacing:2px; color:var(--text-muted); text-transform:uppercase; margin-bottom:12px; font-weight:500; }
        .size-grid { display:flex; gap:10px; flex-wrap:wrap; }
        .size-btn { min-width:50px; height:50px; padding:0 12px; border:1px solid var(--border); background:transparent; cursor:pointer; font-family:'Jost',sans-serif; font-size:13px; color:var(--dark); transition:all 0.2s; border-radius:1px; }
        .size-btn:hover:not(.active) { border-color:var(--dark); }
        .size-btn.active { background:var(--dark); color:var(--white); border-color:var(--dark); font-weight:500; }

        .btn-add-cart { padding:18px; background:var(--dark); color:var(--cream); border:none; font-family:'Jost',sans-serif; letter-spacing:3px; font-size:12px; text-transform:uppercase; cursor:pointer; transition:background .2s; border-radius:1px; width:100%; margin-bottom:36px; }
        .btn-add-cart:hover:not(:disabled) { background:var(--forest); }
        .btn-add-cart:disabled { background:var(--border); color:var(--text-muted); cursor:not-allowed; opacity:0.6; }

        .product-desc { font-size:14px; color:var(--dark); opacity:0.8; line-height:1.7; border-top:1px solid var(--border); padding-top:28px; }

        .features { background:var(--dark); padding:80px 60px; }
        .features-inner { max-width:1300px; margin:0 auto; display:grid; grid-template-columns:repeat(4,1fr); gap:40px; }
        .feat { display:flex; flex-direction:column; align-items:center; text-align:center; gap:16px; }
        .feat-graphic { width:32px; height:32px; position:relative; display:flex; align-items:center; justify-content:center; }
        .feat-line-h { width:100%; height:1px; background:var(--gold); opacity:0.6; position:absolute; }
        .feat-line-v { width:1px; height:100%; background:var(--gold); opacity:0.6; position:absolute; }
        .feat-diamond { width:8px; height:8px; background:var(--dark); transform:rotate(45deg); border:1px solid var(--gold); z-index:2; }
        .feat-circle { width:24px; height:24px; border:1px solid var(--gold); border-radius:50%; position:absolute; opacity:0.3; }
        .feat-square { width:20px; height:20px; border:1px solid var(--gold); position:absolute; transform:rotate(25deg); opacity:0.2; }
        .feat-title { font-family:'Playfair Display',serif; font-size:16px; color:var(--cream); font-weight:600; }
        .feat-text { font-size:13px; color:rgba(240,237,230,.45); line-height:1.7; }

        footer { background:#0A0F0B; color:var(--cream); padding:60px 40px; border-top:1px solid rgba(196,168,130,0.1); }
        .footer-inner { max-width:1300px; margin:0 auto; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:30px; }
        .footer-brand { flex:1; min-width:280px; }
        .footer-logo { font-family:'Playfair Display',serif; font-size:22px; font-weight:700; letter-spacing:4px; color:var(--cream); }
        .footer-desc { font-size:12px; color:rgba(240,237,230,0.4); margin-top:8px; max-width:400px; line-height:1.6; }
        .footer-links { display:flex; gap:16px; flex-wrap:wrap; }
        .btn-footer { border:1px solid rgba(196,168,130,0.3); background:transparent; color:var(--cream); padding:12px 24px; font-size:11px; font-family:'Jost',sans-serif; letter-spacing:2px; text-transform:uppercase; text-decoration:none; transition:all 0.3s; display:inline-flex; align-items:center; gap:8px; }
        .btn-footer:hover { background:var(--cream); color:var(--dark); border-color:var(--cream); }

        @media (max-width:900px) { .product-layout { grid-template-columns: 1fr; gap:40px; } .features-inner { grid-template-columns: repeat(2,1fr); } .footer-inner { flex-direction:column; text-align:center; } .footer-links { justify-content:center; } }
        @media (max-width:640px) { .features-inner { grid-template-columns: 1fr 1fr; } .product-container { padding:30px 20px 60px 20px; } .nav-links { display:none; } }
      `}} />

      <div className={`toast ${addedProduct ? "show" : ""}`}>
        ✨ Ajouté au Panier : {addedProduct} ({size})
      </div>

      <nav id="navbar">
        <ul className="nav-links">
          <li><Link href="/products">CATALOGUE</Link></li>
        </ul>

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

      <div className="product-container">
        <div className="product-layout">

          {/* GALERIE D'IMAGES COMPATIBLE NEXT.JS */}
          <div className="gallery-wrapper">
            <div className="image-box">
              <div className="image-placeholder">{initialLetter}</div>
              {activeImage ? (
                <Image
                  src={activeImage}
                  alt={product.name || "Ayver Premium Custom"}
                  fill
                  priority
                  sizes="(max-width: 900px) 100vw, 55vw"
                  className="main-product-image"
                />
              ) : (
                <span className="image-letter-front">{initialLetter}</span>
              )}

              {isGloballyOut ? (
                <div className="prod-badge sale">Épuisé</div>
              ) : discount ? (
                <div className="prod-badge sale">-{discount}%</div>
              ) : (
                <div className="prod-badge">Exclusivité</div>
              )}
            </div>

            {allImages.length > 1 && (
              <div className="thumbs-grid">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    className={`thumb-nav ${activeImage === img ? "active" : ""}`}
                    onClick={() => setActiveImage(img)}
                    onMouseEnter={() => setActiveImage(img)}
                  >
                    <Image
                      src={img}
                      alt={`Miniature ${i + 1}`}
                      fill
                      sizes="60px"
                      className="thumb-image"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* DÉTAILS PRODUIT */}
          <div className="info-box">
            <span className="info-category">{product.club || product.category || "Atelier AYVER"}</span>
            <h1 className="info-title">{product.name}</h1>

            <div className="price-row">
              <span className="price-current">{product.price} DH</span>
              {product.oldPrice && <span className="price-old">{product.oldPrice} DH</span>}
            </div>

            <div className={`stock-tag ${isGloballyOut ? "out" : ""}`}>
              {!isGloballyOut ? "✓ Pièce disponible en stock" : "✕ Édition archivée / épuisée"}
            </div>

            {/* VARIANTES DE COULEURS */}
            {product.variants && product.variants.length > 0 && (
              <div className="variant-section">
                <p className="size-label">Couleurs & Déclinaisons</p>
                <div className="variant-grid">
                  {product.variants.map((v, index) => (
                    <button
                      key={index}
                      className="variant-pill"
                      onClick={() => handleVariantSelect(v.images)}
                    >
                      {v.color || `Déclinaison ${index + 1}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* SÉLECTEUR DE TAILLES */}
            <div className="size-section">
              <p className="size-label">
                {product.category === "sneakers" ? "Sélectionner la Pointure" : "Sélectionner la Taille"}
              </p>
              <div className="size-grid">
                {product.category === "accessories" || activeSizesList.length === 0 ? (
                  <button className="size-btn active" disabled>Taille Unique</button>
                ) : (
                  activeSizesList.map((s) => (
                    <button
                      key={s}
                      className={`size-btn ${size === s ? "active" : ""}`}
                      onClick={() => setSize(s)}
                    >
                      {s}
                    </button>
                  ))
                )}
              </div>
            </div>

            <button
              className="btn-add-cart"
              onClick={handleAddToCart}
              disabled={isGloballyOut}
            >
              {!isGloballyOut ? "Placer dans le panier" : "Rupture de Stock Temporaire"}
            </button>

            <p className="product-desc">
              {product.description || "Sélection premium par AYVER. Cette création illustre notre engagement envers une garde-robe urbaine intransigeante : des tissus lourds à haute densité structurelle, des finitions soignées et des coupes méticuleusement ajustées pour le quotidien."}
            </p>
          </div>
        </div>
      </div>

      {/* ATTRIBUTS DE MARQUE */}
      <div className="features">
        <div className="features-inner">
          <div className="feat">
            <div className="feat-graphic">
              <div className="feat-line-h"></div>
              <div className="feat-line-v"></div>
              <div className="feat-diamond"></div>
            </div>
            <div className="feat-title">Livraison Maroc</div>
            <div className="feat-text">Expédition rapide et sécurisée à votre porte partout au Maroc sous 24h-48h.</div>
          </div>
          <div className="feat">
            <div className="feat-graphic">
              <div className="feat-circle"></div>
              <div className="feat-diamond"></div>
            </div>
            <div className="feat-title">Sélection Premium</div>
            <div className="feat-text">Boutique sélective référençant des pièces rares, des tissus lourds et des broderies d'exception.</div>
          </div>
          <div className="feat">
            <div className="feat-graphic">
              <div className="feat-square"></div>
              <div className="feat-diamond"></div>
            </div>
            <div className="feat-title">Échange Uniquement</div>
            <div className="feat-text">Pas de remboursement disponible. En cas de souci de coupe, échange sous 14 jours.</div>
          </div>
          <div className="feat">
            <div className="feat-graphic">
              <div className="feat-line-h" style={{ transform: 'rotate(45deg)' }}></div>
              <div className="feat-line-h" style={{ transform: 'rotate(-45deg)' }}></div>
              <div className="feat-diamond"></div>
            </div>
            <div className="feat-title">Support Privé</div>
            <div className="feat-text">Notre équipe confirme et planifie chaque envoi avec vous avant l'expédition finale.</div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
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