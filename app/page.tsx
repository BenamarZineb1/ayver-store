"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getCart } from "@/lib/cart";

interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  stock: number;
  isOutOfStock?: boolean;
  category?: string;
  club?: string;
  images?: string[];
  sizes?: Record<string, boolean>;
}

export default function HomePage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    fetch("/api/products", {
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data.slice(0, 4));
        }
      })
      .catch((e) => console.error("Erreur API accueil:", e));

    const updateCartCount = () => {
      const cart = getCart();
      const total = cart.reduce((acc, item) => acc + item.qty, 0);
      setCartCount(total);
    };

    updateCartCount();

    window.addEventListener("storage", updateCartCount);
    window.addEventListener("cart-updated", updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("cart-updated", updateCartCount);
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght=0,400;0,600;0,700;0,900;1,400;1,700&family=Jost:wght=200;300;400;500&display=swap');

        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

        :root{
          --cream:#F0EDE6; --dark:#131C14; --forest:#1A2F1C; --mid:#2D4A2F;
          --accent:#3A6B3D; --gold:#C4A882; --text-muted:#7A8A7B; --border:#D4CFC8; --white:#FAFAF8; --danger:#8B2020;
        }

        html, body {
          background-color: #F0EDE6 !important;
          margin: 0;
          padding: 0;
          width: 100%;
          min-height: 100%;
          -webkit-text-size-adjust: 100%;
        }

        html { scroll-behavior: smooth; }
        body { background:var(--cream); color:var(--dark); font-family:'Jost',sans-serif; font-weight:300; overflow-x:hidden; }

        .announce { background:var(--dark); color:var(--cream); text-align:center; padding:10px 20px; font-size:11px; letter-spacing:2px; font-weight:400; text-transform:uppercase; line-height:1.4; }
        nav { position:sticky; top:0; z-index:100; background:var(--cream); border-bottom:1px solid var(--border); padding:0 40px; display:flex; align-items:center; justify-content:space-between; height:72px; }
        .nav-links { display:flex; gap:36px; list-style:none; }
        .nav-links a { font-size:11px; letter-spacing:2.5px; text-transform:uppercase; text-decoration:none; color:var(--dark); font-weight:400; }
        .logo-wrap { display:flex; flex-direction:column; align-items:center; text-decoration:none; color:var(--dark); margin: 0 auto; }
        .nav-links-wrap { flex:1; display:flex; align-items:center; }
        .nav-actions-wrap { flex:1; display:flex; justify-content:flex-end; align-items:center; }
        .logo-name { font-family:'Playfair Display',serif; font-size:28px; font-weight:700; letter-spacing:6px; color:var(--forest); line-height:1; }
        .logo-sub { font-size:8px; letter-spacing:4px; color:var(--text-muted); margin-top:2px; text-transform: uppercase; white-space:nowrap; }
        .nav-icon { background:none; border:none; cursor:pointer; font-size:12px; color:var(--dark); text-decoration:none; font-family:'Jost',sans-serif; text-transform:uppercase; font-weight:500; letter-spacing:1px; display:flex; align-items:center; }
        .nav-icon span.badge { background:var(--dark); color:var(--cream); padding:2px 7px; border-radius:10px; font-size:10px; margin-left:6px; font-weight:400; }

        .hero { position:relative; min-height:75vh; display:flex; align-items:center; overflow:hidden; background:var(--dark); padding:60px 0; }
        .hero-bg { position:absolute; inset:0; background:linear-gradient(135deg,var(--forest) 0%,var(--dark) 60%,#0A1209 100%); }
        .hero-content { position:relative; z-index:2; max-width:1300px; margin:0 auto; padding:0 40px; display:flex; flex-direction:column; align-items:center; text-align:center; width:100%; }
        .hero-h1 { font-family:'Playfair Display',serif; font-size:clamp(40px, 6vw, 86px); font-weight:900; color:var(--cream); line-height:1.1; margin-bottom:24px; }
        .hero-h1 em { font-style:italic; color:var(--gold); font-weight:400; }
        .hero-p { font-size:14px; line-height:1.8; color:rgba(240,237,230,.55); max-width:500px; margin-bottom:40px; padding:0 10px; }
        .btn-primary { background:var(--cream); color:var(--dark); padding:16px 36px; border:none; cursor:pointer; font-family:'Jost',sans-serif; font-size:11px; letter-spacing:2.5px; text-transform:uppercase; font-weight:500; text-decoration:none; display:inline-block; transition: background 0.3s; }
        .btn-primary:hover { background: var(--white); }

        section { padding:100px 40px; }
        .section-header { text-align:center; margin-bottom:64px; }
        .section-eyebrow { font-size:10px; letter-spacing:4px; color:var(--text-muted); text-transform:uppercase; margin-bottom:16px; display:block; }
        .section-title { font-family:'Playfair Display',serif; font-size:clamp(32px, 4vw, 54px); font-weight:700; color:var(--dark); line-height:1.1; }
        .section-title em { font-style:italic; color:var(--accent); font-weight:400; }

        .products { background:var(--cream); }
        .products-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:28px; max-width:1300px; margin:0 auto; }

        .prod-card { cursor:pointer; transition: opacity 0.3s ease; }
        .prod-card.is-sold-out { opacity: 0.65; }

        .prod-img { aspect-ratio:3/4; background:var(--dark); position:relative; overflow:hidden; margin-bottom:16px; border-radius:2px; display:flex; align-items:center; justify-content:center; }
        .product-image { object-fit:cover; transition:transform .5s ease; }
        .prod-img-inner { width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-family:'Playfair Display',serif; font-size:64px; font-weight:900; color:rgba(255,255,255,.05); font-style:italic; transition:transform .5s ease; }

        .prod-card:not(.is-sold-out):hover .product-image,
        .prod-card:not(.is-sold-out):hover .prod-img-inner { transform:scale(1.04); }

        .prod-badge { position:absolute; top:12px; left:12px; background:var(--forest); color:var(--cream); font-size:9px; letter-spacing:2px; padding:4px 10px; text-transform:uppercase; z-index:4; }
        .prod-badge.sale { background:#8B2020; }
        .prod-badge.out { background:var(--danger); }

        .prod-actions { position:absolute; bottom:0; left:0; right:0; transform:translateY(100%); transition:transform .35s ease; z-index:5; }
        .prod-card:not(.is-sold-out):hover .prod-actions { transform:translateY(0); }

        .prod-view { width:100%; padding:14px; background:var(--dark); color:var(--cream); border:none; text-align:center; font-family:'Jost',sans-serif; font-size:10px; letter-spacing:2.5px; text-transform:uppercase; font-weight:400; transition:background .2s; }
        .prod-view:hover { background:var(--forest); }

        .prod-name { font-family:'Playfair Display',serif; font-size:16px; font-weight:600; margin-bottom:6px; color:var(--dark); }
        .prod-club { font-size:11px; color:var(--text-muted); letter-spacing:1.5px; margin-bottom:8px; text-transform:uppercase; }
        .prod-price { display:flex; gap:12px; align-items:center; }
        .price-new { font-size:15px; font-weight:500; color:var(--dark); }
        .price-old { font-size:13px; color:var(--text-muted); text-decoration:line-through; }
        .sizes-preview { display:flex; gap:6px; margin-top:10px; flex-wrap: wrap; }
        .size-dot { font-size:9px; letter-spacing:1px; border:1px solid var(--border); padding:3px 7px; color:var(--text-muted); text-transform:uppercase; background: var(--white); }

        .features { background:var(--dark); padding:80px 40px; }
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

        @media(max-width:1100px){
          .products-grid { grid-template-columns: repeat(3, 1fr); gap: 24px; }
          .features-inner { grid-template-columns: repeat(2, 1fr); gap: 32px; }
        }

        @media(max-width:850px){
          nav { padding: 0 24px; }
          .products-grid { grid-template-columns: repeat(2, 1fr); gap: 20px; }
          .footer-inner { flex-direction: column; text-align: center; gap: 40px; }
          .footer-brand { min-width: 100%; }
          .footer-desc { margin: 12px auto 0 auto; }
          .footer-links { justify-content: center; width: 100%; }
        }

        @media(max-width:640px){
          section { padding: 45px 20px; }
          .announce { font-size: 10px; padding: 8px 12px; }
          nav { padding: 0 20px; }
          .nav-links-wrap { display: none; }
          .logo-name { font-size: 24px; letter-spacing: 4px; }
          .logo-sub { font-size: 7px; letter-spacing: 2.5px; }
          .products-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .prod-img { margin-bottom: 12px; }
          .prod-name { font-size: 14px; margin-bottom: 4px; line-height: 1.3; }
          .prod-club { font-size: 10px; margin-bottom: 4px; }
          .price-new { font-size: 13px; }
          .price-old { font-size: 11px; }
          .sizes-preview { display: none; }
          .features { padding: 30px 0 35px 0; overflow: hidden; }
          .features-inner {
            display: flex;
            flex-wrap: nowrap;
            overflow-x: auto;
            gap: 24px;
            padding: 0 20px;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
          }
          .features-inner::-webkit-scrollbar { display: none; }
          .feat {
            flex: 0 0 260px;
            scroll-snap-align: center;
            background: rgba(255,255,255, 0.02);
            padding: 24px 16px;
            border-radius: 4px;
            border: 1px solid rgba(196,168,130, 0.08);
            gap: 12px;
          }
          .feat-title { font-size: 14px; }
          .feat-text { font-size: 12px; line-height: 1.5; }
          .footer-links { flex-direction: column; gap: 12px; }
          .btn-footer { width: 100%; justify-content: center; }
        }
      `}} />

      {/* ANNOUNCEMENT */}
      <div className="announce">
        🚚 LIVRAISON PARTOUT AU MAROC
      </div>

      {/* NAVBAR */}
      <nav id="navbar">
        <div className="nav-links-wrap">
          <ul className="nav-links">
            <li><Link href="/products">CATALOGUE</Link></li>
          </ul>
        </div>

        <Link href="/" className="logo-wrap">
          <span className="logo-name">AYVER</span>
          <span className="logo-sub">STREETWEAR & JERSEY</span>
        </Link>

        <div className="nav-actions-wrap">
          <div className="nav-actions">
            <Link href="/cart" className="nav-icon">
              PANIER 🛍 <span className="badge">{cartCount}</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero" id="home">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <h1 className="hero-h1">
            Bienvenue chez <br /><em>AYVER.</em>
          </h1>
          <p className="hero-p">
            Streetwear, Sneakers, et Jerseys Premium. Découvrez notre univers.
          </p>
          <Link href="/products" className="btn-primary">Voir la Collection</Link>
        </div>
      </section>

      {/* NOUVELLES ARRIVÉES */}
      <section className="products" id="nouveautes">
        <div className="section-header">
          <span className="section-eyebrow">Fraîchement arrivés</span>
          <h2 className="section-title">Nouvelles <em>Arrivées</em></h2>
        </div>
        <div className="products-grid">
          {products.length > 0 ? (
            products.map((p) => {
              const isOut = p.stock === 0 || p.isOutOfStock;
              const hasDiscount = p.oldPrice && p.oldPrice > p.price;
              const discount = hasDiscount ? Math.round(((p.oldPrice! - p.price) / p.oldPrice!) * 100) : null;
              const initialLetter = p.name ? p.name.charAt(0) : "A";

              const availableSizes = p.sizes ? Object.keys(p.sizes).filter((s) => p.sizes[s] === true) : [];

              return (
                <div
                  className={`prod-card ${isOut ? 'is-sold-out' : ''}`}
                  key={p.id}
                  onClick={() => router.push(`/products/${p.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      router.push(`/products/${p.id}`);
                    }
                  }}
                >
                  <div className="prod-img">
                    {p.images?.[0] ? (
                      <Image
                        src={p.images[0]}
                        alt={p.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1100px) 33vw, 25vw"
                        className="product-image"
                        loading="lazy"
                      />
                    ) : (
                      <div className="prod-img-inner">{initialLetter}</div>
                    )}

                    {isOut ? (
                      <div className="prod-badge out">Épuisé</div>
                    ) : discount ? (
                      <div className="prod-badge sale">-{discount}%</div>
                    ) : (
                      <div className="prod-badge">Nouveau</div>
                    )}

                    {!isOut && (
                      <div className="prod-actions">
                        <div className="prod-view">Découvrir l'article</div>
                      </div>
                    )}
                  </div>
                  <div className="prod-club">{p.club || p.category}</div>
                  <div className="prod-name">{p.name}</div>
                  <div className="prod-price">
                    <span className="price-new">{p.price} DH</span>
                    {hasDiscount && <span className="price-old">{p.oldPrice} DH</span>}
                  </div>

                  <div className="sizes-preview">
                    {availableSizes.length > 0 ? (
                      availableSizes.map(s => <span key={s} className="size-dot">{s}</span>)
                    ) : (
                      <span className="size-dot">TU</span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "var(--text-muted)", fontFamily: "Playfair Display", fontStyle: "italic" }}>
              Chargement des dernières arrivées...
            </p>
          )}
        </div>
      </section>

      {/* SECTION INFORMATIONS */}
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