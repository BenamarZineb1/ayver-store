"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminDashboardRoot() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);

  const fetchProducts = () => {
    fetch("/api/products", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch((err) => console.error("Erreur chargement admin:", err));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/admin/logout", { method: "POST" });
      if (res.ok) {
        router.push("/admin/login");
        router.refresh();
      } else {
        alert("Erreur lors de la déconnexion.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Êtes-vous certain de vouloir retirer définitivement "${name}" du vestiaire ?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert("Une erreur est survenue lors de la tentative de suppression.");
      }
    } catch (err) {
      console.error(err);
      alert("Impossible de joindre l'API.");
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Jost:wght@300;400;500;600&display=swap');

        body { background: #F0EDE6; color: #131C14; font-family: 'Jost', sans-serif; margin: 0; padding: 0; }
        header { background: #131C14; color: #FAFAF8; padding: 20px 40px; display: flex; justify-content: space-between; align-items: center; }
        .brand { font-family: 'Playfair Display', serif; font-size: 24px; letter-spacing: 4px; color: #C4A882; }
        .btn-logout { background: transparent; border: 1px solid rgba(196,168,130,0.4); color: #F0EDE6; padding: 8px 16px; cursor: pointer; font-family: 'Jost', sans-serif; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; }
        .btn-logout:hover { background: #8B2020; border-color: #8B2020; }

        .main-container { max-width: 1200px; margin: 40px auto; padding: 0 20px; }
        .panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        .panel-title { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 700; }
        .btn-add { background: #131C14; color: #FAFAF8; padding: 14px 28px; text-decoration: none; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; font-weight: 500; display: inline-block; transition: background 0.2s; }
        .btn-add:hover { background: #1A2F1C; }

        table { width: 100%; border-collapse: collapse; background: #FAFAF8; border: 1px solid #D4CFC8; }
        th { background: #131C14; color: #FAFAF8; text-transform: uppercase; font-size: 11px; letter-spacing: 2px; padding: 16px; text-align: left; font-weight: 500; }
        td { padding: 16px; border-bottom: 1px solid #D4CFC8; font-size: 14px; vertical-align: middle; }
        tr:hover td { background: #F5F2EC; }

        .img-preview { width: 45px; height: 55px; background: #131C14; object-fit: cover; border-radius: 1px; display: block; border: 1px solid #D4CFC8; }

        .badge-status { display: inline-block; padding: 4px 8px; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; font-weight: 600; }
        .badge-status.in { background: rgba(45,74,47,0.1); color: #1A2F1C; }
        .badge-status.out { background: rgba(139,32,32,0.1); color: #8B2020; }

        .actions-cell { display: flex; gap: 12px; align-items: center; }
        .action-link { font-size: 12px; color: #131C14; text-decoration: underline; background: none; border: none; cursor: pointer; padding: 0; font-family: 'Jost', sans-serif; }
        .action-link:hover { color: #C4A882; }
        .action-link.danger { color: #8B2020; }
        .action-link.danger:hover { color: #131C14; }
      `}} />

      <header>
        <div className="brand">AYVER PANEL</div>
        <button className="btn-logout" onClick={handleLogout}>Déconnexion ✕</button>
      </header>

      <div className="main-container">
        <div className="panel-header">
          <h1 className="panel-title">Espace Vestiaire Confidentiel</h1>
          <Link href="/admin/products" className="btn-add">
            + Ajouter un Article
          </Link>
        </div>

        <table>
          <thead>
            <tr>
              <th>Visuel</th>
              <th>Modèle / Article</th>
              <th>Catégorie</th>
              <th>Prix</th>
              <th>Statut Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const isOut = p.stock === 0 || p.isOutOfStock;
              const mainImg = p.image || p.images?.[0] || p.variants?.[0]?.images?.[0] || null;

              return (
                <tr key={p.id}>
                  <td>
                    {mainImg ? (
                      <img src={mainImg} alt={p.name} className="img-preview" />
                    ) : (
                      <div style={{
                        width: '45px',
                        height: '55px',
                        background: '#1A2F1C',
                        color: '#C4A882',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '13px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        borderRadius: '1px'
                      }}>
                        {p.name ? p.name.charAt(0) : 'A'}
                      </div>
                    )}
                  </td>
                  <td>
                    <strong style={{ fontWeight: 500 }}>{p.name}</strong>
                    <div style={{ fontSize: '11px', color: '#7A8A7B', marginTop: '2px' }}>ID: {p.id}</div>
                  </td>
                  <td style={{ textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px' }}>
                    {p.category}
                  </td>
                  <td>{p.price} DH</td>
                  <td>
                    {isOut ? (
                      <span className="badge-status out">Épuisé</span>
                    ) : (
                      <span className="badge-status in">En Stock ({p.stock || "✓"})</span>
                    )}
                  </td>
                  <td className="actions-cell">
                    <Link href={`/admin/products/${p.id}`} className="action-link">
                      Éditer
                    </Link>
                    <span style={{ color: '#D4CFC8' }}>|</span>
                    <button
                      onClick={() => handleDelete(p.id, p.name)}
                      className="action-link danger"
                    >
                      Supprimer
                    </button>
                    <span style={{ color: '#D4CFC8' }}>|</span>
                    <Link href={`/products/${p.id}`} target="_blank" className="action-link">
                      Client ↗
                    </Link>
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "#7A8A7B" }}>
                  Aucun produit disponible actuellement dans l'atelier.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}