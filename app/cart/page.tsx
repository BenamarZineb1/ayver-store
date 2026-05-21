"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCart, removeFromCart, CartItem } from "@/lib/cart";

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);

  const updateCartState = () => {
    const currentCart = getCart();
    setCart(currentCart);
    setCartCount(currentCart.reduce((acc, item) => acc + item.qty, 0));
  };

  useEffect(() => {
    updateCartState();
    const interval = setInterval(updateCartState, 1000);
    return () => clearInterval(interval);
  }, []);

  function handleRemove(id: number) {
    removeFromCart(id);
    updateCartState();
  }

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=Jost:wght@200;300;400;500&display=swap');

        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --cream:#F0EDE6; --dark:#131C14; --forest:#1A2F1C; --mid:#2D4A2F;
          --accent:#3A6B3D; --gold:#C4A882; --text-muted:#7A8A7B; --border:#D4CFC8; --white:#FAFAF8; --danger:#8B2020;
        }
        body { background:var(--cream); color:var(--dark); font-family:'Jost',sans-serif; font-weight:300; overflow-x:hidden; }

        /* NAVBAR AVEC ÉCRITURES HOMOGÈNES EXACTES */
        nav { position:sticky; top:0; z-index:100; background:var(--cream); border-bottom:1px solid var(--border); padding:0 40px; display:flex; align-items:center; justify-content:space-between; height:72px; }
        .nav-links { display:flex; gap:36px; list-style:none; }
        .nav-links a { font-size:11px; letter-spacing:2.5px; text-transform:uppercase; text-decoration:none; color:var(--dark); font-weight:400; }
        .logo-wrap { display:flex; flex-direction:column; align-items:center; text-decoration:none; color:var(--dark); }
        .logo-name { font-family:'Playfair Display',serif; font-size:28px; font-weight:700; letter-spacing:6px; color:var(--forest); line-height:1; }
        .logo-sub { font-size:8px; letter-spacing:4px; color:var(--text-muted); margin-top:2px; text-transform: uppercase; }
        .nav-actions { display:flex; gap:20px; align-items:center; }
        .nav-icon { background:none; border:none; cursor:pointer; font-size:14px; color:var(--dark); text-decoration:none; font-family:'Jost',sans-serif; text-transform:uppercase; font-weight:500; letter-spacing:1px; }
        .nav-icon span.badge { background:var(--dark); color:var(--cream); padding:2px 6px; border-radius:10px; font-size:10px; margin-left:4px; }

        /* STRUCTURE PAGE PANIER */
        .cart-container { max-width:700px; margin: 0 auto; padding: 60px 20px 100px 20px; min-height: 65vh; }
        .cart-header { text-align: center; margin-bottom: 48px; }
        .cart-header h1 { font-family: 'Playfair Display', serif; font-size: 38px; font-weight: 700; color: var(--dark); margin-bottom: 8px; }
        .cart-header h1 em { font-style: italic; color: var(--accent); }
        .cart-header p { color: var(--text-muted); font-size: 13px; letter-spacing: 1px; }

        /* LISTE DES ARTICLES */
        .cart-list { display: flex; flex-direction: column; gap: 16px; }
        .cart-item { display: flex; gap: 20px; padding: 20px; background: var(--white); border: 1px solid var(--border); border-radius: 2px; }

        .item-img-box { width: 75px; height: 100px; background: var(--dark); position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; }
        .item-img-inner { font-family: 'Playfair Display', serif; font-size: 38px; font-weight: 900; color: rgba(255,255,255,0.05); font-style: italic; position: absolute; }
        .item-letter { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 700; color: var(--cream); font-style: italic; z-index: 2; }

        .item-details { flex: 1; display: flex; flex-direction: column; justify-content: center; }
        .item-name { font-family: 'Playfair Display', serif; font-weight: 600; font-size: 18px; color: var(--dark); margin-bottom: 4px; }
        .item-meta { font-size: 13px; color: var(--text-muted); letter-spacing: 0.5px; }
        .item-remove-btn { font-family: 'Jost', sans-serif; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; border: none; background: transparent; color: var(--danger); cursor: pointer; padding: 0; margin-top: 12px; font-weight: 500; text-align: left; width: fit-content; }

        /* RÉCAPITULATIF */
        .cart-summary { margin-top: 40px; padding: 30px; background: var(--white); border: 1px solid var(--border); border-radius: 2px; }
        .summary-row { display: flex; justify-content: space-between; font-size: 14px; color: var(--text-muted); margin-bottom: 12px; }
        .summary-free { color: var(--forest); font-weight: 500; letter-spacing: 1px; text-transform: uppercase; font-size: 12px; }
        .summary-divider { border: none; border-top: 1px solid var(--border); margin: 20px 0; }
        .summary-total { display: flex; justify-content: space-between; font-family: 'Playfair Display', serif; font-weight: 700; font-size: 24px; color: var(--dark); }
        .btn-checkout { width: 100%; margin-top: 30px; padding: 18px; background: var(--dark); color: var(--cream); border: none; cursor: pointer; font-family: 'Jost', sans-serif; letter-spacing: 3px; font-size: 12px; text-transform: uppercase; font-weight: 400; transition: background 0.2s; }
        .btn-checkout:hover { background: var(--forest); }

        /* EMPTY STATE */
        .cart-empty { text-align: center; padding: 60px 0; color: var(--text-muted); font-family: 'Playfair Display', serif; font-style: italic; font-size: 18px; }

        /* FEATURES GRAPHICS */
        .features { background:var(--dark); padding: 80px 60px; }
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

        /* FOOTER */
        footer { background:#0A0F0B; color:var(--cream); padding:60px 40px; border-top:1px solid rgba(196,168,130,0.1); }
        .footer-inner { max-width:1300px; margin:0 auto; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:30px; }
        .footer-brand { flex:1; min-width:280px; }
        .footer-logo { font-family:'Playfair Display',serif; font-size:22px; font-weight:700; letter-spacing:4px; color:var(--cream); }
        .footer-desc { font-size:12px; color:rgba(240,237,230,0.4); margin-top:8px; max-width:400px; line-height:1.6; }
        .footer-links { display:flex; gap:16px; flex-wrap:wrap; }
        .btn-footer { border:1px solid rgba(196,168,130,0.3); background:transparent; color:var(--cream); padding:12px 24px; font-size:11px; font-family:'Jost',sans-serif; letter-spacing:2px; text-transform:uppercase; text-decoration:none; transition:all 0.3s; display:inline-flex; align-items:center; gap:8px; }
        .btn-footer:hover { background:var(--cream); color:var(--dark); border-color:var(--cream); }

        @media(max-width:1024px){
          .features-inner{grid-template-columns:repeat(2,1fr)}
          .footer-inner { flex-direction:column; text-align:center; }
          .footer-links { justify-content:center; }
        }
        @media(max-width:640px){
          .features-inner{grid-template-columns:1fr 1fr}
          .nav-links{display:none;}
        }
      `}} />

      {/* NAVBAR */}
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

      {/* ZONE PRINCIPALE PANIER */}
      <div className="cart-container">
        <div className="cart-header">
          <h1>Votre <em>Panier</em></h1>
          <p>Révisez vos articles AYVER avant la validation finale</p>
        </div>

        {/* ÉTAT VIDE */}
        {cart.length === 0 ? (
          <div className="cart-empty">
            Votre panier est actuellement vide.
          </div>
        ) : (
          <>
            {/* LISTE DES PIÈCES */}
            <div className="cart-list">
              {cart.map((item) => {
                const letter = item.name ? item.name.charAt(0) : "A";
                return (
                  <div key={item.id} className="cart-item">
                    <div className="item-img-box">
                      <div className="item-img-inner">{letter}</div>
                      <span className="item-letter">{letter}</span>
                    </div>

                    <div className="item-details">
                      <div className="item-name">{item.name}</div>
                      <div className="item-meta">
                        {item.price} DH × {item.qty} {item.size && `| Taille: ${item.size}`}
                      </div>
                      <button className="item-remove-btn" onClick={() => handleRemove(item.id)}>
                        Retirer de la ligne
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RÉCAPITULATIF FINANCIER */}
            <div className="cart-summary">
              <div className="summary-row">
                <span>Sous-total</span>
                <span>{total} DH</span>
              </div>
              <div className="summary-row">
                <span>Livraison Maroc</span>
                <span className="summary-free">Gratuite</span>
              </div>
              <hr className="summary-divider" />
              <div className="summary-total">
                <span>Total</span>
                <span>{total} DH</span>
              </div>
              <button className="btn-checkout">
                Passer à la caisse
              </button>
            </div>
          </>
        )}
      </div>

      {/* SECTION INFORMATION SANS ÉMOJIS SÉLECTION BOUTIQUE */}
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
            <div className="feat-text">Notre équipe confirme et planifique chaque envoi avec vous avant l'expédition finale.</div>
          </div>
        </div>
      </div>

      {/* FOOTER EXCLUSIF BOUTIQUE */}
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