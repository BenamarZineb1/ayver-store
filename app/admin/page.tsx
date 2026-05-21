"use client";

import Link from "next/link";

export default function AdminDashboard() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=Jost:wght=200;300;400;500&display=swap');

        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --cream:#F0EDE6; --dark:#131C14; --forest:#1A2F1C; --mid:#2D4A2F;
          --accent:#3A6B3D; --gold:#C4A882; --text-muted:#7A8A7B; --border:#D4CFC8; --white:#FAFAF8;
        }
        body { background:var(--cream); color:var(--dark); font-family:'Jost',sans-serif; font-weight:300; overflow-x:hidden; }

        /* HEADER DE GESTION ADMIN */
        .admin-container { max-width:1000px; margin:0 auto; padding:80px 40px 120px 40px; min-height:100vh; display:flex; flex-direction:column; justify-content:space-between; }
        .admin-header { margin-bottom:60px; position:relative; padding-bottom:24px; border-bottom:1px solid var(--border); }
        .admin-header h1 { font-family:'Playfair Display',serif; font-size:42px; font-weight:700; color:var(--dark); letter-spacing:-0.5px; }
        .admin-header h1 em { font-style:italic; font-weight:400; color:var(--forest); }
        .admin-header p { font-size:13px; color:var(--text-muted); letter-spacing:1px; text-transform:uppercase; margin-top:10px; }

        /* PANNEAUX DE CONTRÔLE GRILLE */
        .admin-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:30px; }
        .admin-card { display:flex; gap:24px; align-items:center; background:var(--white); border:1px solid var(--border); padding:40px 32px; text-decoration:none; color:var(--dark); transition:all 0.4s cubic-bezier(0.16, 1, 0.3, 1); border-radius:2px; position:relative; overflow:hidden; }
        .admin-card::before { content:''; position:absolute; inset:0; border:1px solid transparent; transition:all 0.4s ease; pointer-events:none; }

        .admin-card:hover { transform:translateY(-2px); background:var(--white); }
        .admin-card:hover::before { border-color:var(--gold); }

        /* GRAPHICS SIGNATURES */
        .admin-graphic-box { width:48px; height:48px; position:relative; display:flex; align-items:center; justify-content:center; flex-shrink:0; background:var(--cream); border:1px solid var(--border); border-radius:1px; }
        .g-line-h { width:60%; height:1px; background:var(--forest); opacity:0.5; position:absolute; }
        .g-line-v { width:1px; height:60%; background:var(--forest); opacity:0.5; position:absolute; }
        .g-diamond { width:6px; height:6px; background:var(--cream); border:1px solid var(--gold); transform:rotate(45deg); z-index:2; }
        .g-circle { width:20px; height:20px; border:1px solid var(--gold); border-radius:50%; position:absolute; opacity:0.4; }

        .admin-card-info h2 { font-family:'Playfair Display',serif; font-size:22px; font-weight:600; color:var(--dark); margin-bottom:4px; }
        .admin-card-info p { font-size:13px; color:var(--text-muted); line-height:1.4; }

        /* PIED DE PAGE */
        .admin-footer { margin-top:80px; display:flex; justify-content:space-between; align-items:center; font-size:11px; letter-spacing:2px; text-transform:uppercase; color:var(--text-muted); border-top:1px solid var(--border); padding-top:24px; }
        .footer-brand-mark { font-family:'Playfair Display',serif; font-weight:700; color:var(--forest); letter-spacing:1px; }

        @media(max-width:640px){
          .admin-container { padding:40px 20px; }
          .admin-header h1 { font-size:32px; }
          .admin-grid { grid-template-columns:1fr; gap:20px; }
          .admin-footer { flex-direction:column; gap:12px; text-align:center; }
        }
      `}} />

      <div className="admin-container">

        {/* EN-TÊTE DU PANNEAU DE CONFIGURATION */}
        <header className="admin-header">
          <h1>AYVER <em>Dashboard</em></h1>
          <p>Espace d'administration • Gestion du catalogue et du stock</p>
        </header>

        {/* GRILLE DES PANNEAUX INTERHARRMONISÉE */}
        <main className="admin-grid">

          <Link href="/admin/products" className="admin-card">
            <div className="admin-graphic-box">
              <div className="g-line-h"></div>
              <div className="g-line-v"></div>
              <div className="g-diamond"></div>
            </div>
            <div className="admin-card-info">
              <h2>Gestion des Produits</h2>
              <p>Consulter le catalogue global, modifier les prix, actualiser les déclinaisons de couleurs et ajuster l'état des stocks.</p>
            </div>
          </Link>

          <Link href="/admin/products/new" className="admin-card">
            <div className="admin-graphic-box">
              <div className="g-circle"></div>
              <div className="g-diamond" style={{ background: 'var(--forest)' }}></div>
            </div>
            <div className="admin-card-info">
              <h2>Ajouter un Produit</h2>
              <p>Créer un nouvel article multi-variantes, lier des galeries photos par couleur et définir la grille de tailles ou pointures (36-44).</p>
            </div>
          </Link>

        </main>

        {/* PIED DE PAGE SÉCURISÉ */}
        <footer className="admin-footer">
          <div>Panneau d'Administration Sécurisé</div>
          <div className="footer-brand-mark">AYVER 2026</div>
        </footer>

      </div>
    </>
  );
}