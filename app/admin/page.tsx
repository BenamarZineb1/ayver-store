"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  isOutOfStock?: boolean;
  category?: string;
  image?: string | null;
  images?: string[];
  variants?: {
    color: string;
    images: string[];
  }[];
}

export default function AdminDashboardRoot() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchProducts() {
    try {
      const res = await fetch("/api/products", {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Erreur chargement");
      }

      const data = await res.json();

      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (err) {
      console.error("Erreur chargement admin:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  async function handleLogout() {
    try {
      const res = await fetch("/api/admin/logout", {
        method: "POST",
      });

      if (res.ok) {
        router.push("/admin/login");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id: string, name: string) {
    const confirmed = confirm(
      `Supprimer définitivement "${name}" ?`
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Erreur suppression");
      }

      setProducts((prev) =>
        prev.filter((p) => p.id !== id)
      );
    } catch (err) {
      console.error(err);
      alert("Impossible de supprimer le produit.");
    }
  }

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Jost:wght@300;400;500&display=swap');

          *{
            margin:0;
            padding:0;
            box-sizing:border-box;
          }

          :root{
            --cream:#F0EDE6;
            --white:#FAFAF8;
            --dark:#131C14;
            --forest:#1A2F1C;
            --gold:#C4A882;
            --border:#D4CFC8;
            --muted:#7A8A7B;
            --danger:#8B2020;
          }

          html,body{
            background:var(--cream);
            color:var(--dark);
            font-family:'Jost',sans-serif;
            overflow-x:hidden;
          }

          .header{
            background:var(--dark);
            padding:18px 24px;
            display:flex;
            justify-content:space-between;
            align-items:center;
          }

          .brand{
            font-family:'Playfair Display',serif;
            color:var(--gold);
            letter-spacing:4px;
            font-size:24px;
            font-weight:700;
          }

          .logout-btn{
            background:transparent;
            border:1px solid rgba(255,255,255,0.2);
            color:var(--white);
            padding:10px 16px;
            cursor:pointer;
            text-transform:uppercase;
            font-size:10px;
            letter-spacing:2px;
          }

          .logout-btn:hover{
            background:var(--danger);
            border-color:var(--danger);
          }

          .container{
            max-width:1400px;
            margin:auto;
            padding:40px 20px 80px;
          }

          .topbar{
            display:flex;
            justify-content:space-between;
            align-items:center;
            gap:20px;
            flex-wrap:wrap;
            margin-bottom:40px;
          }

          .title{
            font-family:'Playfair Display',serif;
            font-size:38px;
            font-weight:700;
          }

          .title em{
            font-style:italic;
            font-weight:400;
            color:var(--forest);
          }

          .btn-add{
            background:var(--dark);
            color:var(--white);
            text-decoration:none;
            padding:14px 22px;
            font-size:11px;
            letter-spacing:2px;
            text-transform:uppercase;
            border:1px solid var(--dark);
            transition:0.3s;
          }

          .btn-add:hover{
            background:var(--forest);
          }

          .grid{
            display:grid;
            grid-template-columns:repeat(auto-fill,minmax(280px,1fr));
            gap:24px;
          }

          .card{
            background:var(--white);
            border:1px solid var(--border);
            overflow:hidden;
          }

          .image-box{
            position:relative;
            width:100%;
            height:340px;
            background:#EAE6DF;
          }

          .content{
            padding:18px;
          }

          .category{
            font-size:10px;
            text-transform:uppercase;
            letter-spacing:2px;
            color:var(--muted);
            margin-bottom:10px;
          }

          .name{
            font-size:18px;
            font-weight:500;
            line-height:1.4;
            margin-bottom:12px;
          }

          .price{
            font-size:22px;
            font-weight:600;
            margin-bottom:10px;
          }

          .stock{
            font-size:12px;
            margin-bottom:20px;
          }

          .out{
            color:var(--danger);
            font-weight:600;
          }

          .in{
            color:var(--forest);
            font-weight:600;
          }

          .actions{
            display:flex;
            gap:10px;
          }

          .btn{
            flex:1;
            text-align:center;
            padding:12px;
            font-size:11px;
            letter-spacing:1px;
            text-transform:uppercase;
            cursor:pointer;
            border:none;
            transition:0.3s;
          }

          .edit{
            background:var(--forest);
            color:white;
            text-decoration:none;
          }

          .delete{
            background:#EFE8E1;
            color:var(--danger);
          }

          .view{
            background:#131C14;
            color:white;
            text-decoration:none;
          }

          .loader,
          .empty{
            text-align:center;
            padding:100px 20px;
            color:var(--muted);
          }

          @media(max-width:768px){

            .brand{
              font-size:18px;
            }

            .title{
              font-size:30px;
            }

            .image-box{
              height:260px;
            }

            .actions{
              flex-direction:column;
            }
          }
        `,
        }}
      />

      <header className="header">
        <div className="brand">
          AYVER PANEL
        </div>

        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          Déconnexion
        </button>
      </header>

      <div className="container">

        <div className="topbar">

          <h1 className="title">
            Gestion du <em>Vestiaire</em>
          </h1>

          <Link
            href="/admin/products/new"
            className="btn-add"
          >
            + Ajouter Produit
          </Link>

        </div>

        {loading ? (
          <div className="loader">
            Chargement des produits...
          </div>
        ) : products.length === 0 ? (
          <div className="empty">
            Aucun produit disponible.
          </div>
        ) : (
          <div className="grid">

            {products.map((p) => {

              const mainImage =
                p.image ||
                p.images?.[0] ||
                p.variants?.[0]?.images?.[0] ||
                null;

              const isOut =
                p.stock === 0 ||
                p.isOutOfStock;

              return (
                <div
                  key={p.id}
                  className="card"
                >

                  <div className="image-box">
                    {mainImage ? (
                      <Image
                        src={mainImage}
                        alt={p.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div />
                    )}
                  </div>

                  <div className="content">

                    <div className="category">
                      {p.category || "Produit"}
                    </div>

                    <div className="name">
                      {p.name}
                    </div>

                    <div className="price">
                      {p.price} DH
                    </div>

                    <div className="stock">
                      {isOut ? (
                        <span className="out">
                          Épuisé
                        </span>
                      ) : (
                        <span className="in">
                          En stock ({p.stock})
                        </span>
                      )}
                    </div>

                    <div className="actions">

                      <Link
                        href={`/admin/products/edit/${p.id}`}
                        className="btn edit"
                      >
                        Modifier
                      </Link>

                      <button
                        className="btn delete"
                        onClick={() =>
                          handleDelete(p.id, p.name)
                        }
                      >
                        Supprimer
                      </button>

                      <Link
                        href={`/products/${p.id}`}
                        target="_blank"
                        className="btn view"
                      >
                        Voir
                      </Link>

                    </div>

                  </div>
                </div>
              );
            })}

          </div>
        )}
      </div>
    </>
  );
}