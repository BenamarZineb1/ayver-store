"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  category: string;
  stock: number;
  isOutOfStock: boolean;
  createdAt: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchProducts() {
    try {
      const res = await fetch("/api/products");

      if (!res.ok) {
        throw new Error("Erreur chargement produits");
      }

      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteProduct(id: string) {
    const confirmed = confirm(
      "Supprimer définitivement ce produit ?"
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
    } catch (error) {
      console.error(error);
      alert("Impossible de supprimer ce produit.");
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

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

          body{
            background:var(--cream);
            color:var(--dark);
            font-family:'Jost',sans-serif;
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
            margin-bottom:40px;
            flex-wrap:wrap;
          }

          .title{
            font-family:'Playfair Display',serif;
            font-size:42px;
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
            padding:14px 22px;
            text-decoration:none;
            letter-spacing:2px;
            text-transform:uppercase;
            font-size:11px;
            transition:0.3s;
            border:1px solid var(--dark);
          }

          .btn-add:hover{
            background:var(--forest);
          }

          .grid{
            display:grid;
            grid-template-columns:repeat(auto-fill,minmax(260px,1fr));
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
            height:320px;
            background:#eee;
          }

          .content{
            padding:18px;
          }

          .category{
            font-size:10px;
            letter-spacing:2px;
            text-transform:uppercase;
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
            font-size:20px;
            font-weight:600;
            margin-bottom:12px;
          }

          .stock{
            font-size:12px;
            margin-bottom:18px;
          }

          .out{
            color:var(--danger);
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

          .empty{
            text-align:center;
            padding:80px 20px;
            color:var(--muted);
          }

          .loader{
            text-align:center;
            padding:100px 20px;
          }

          @media(max-width:768px){
            .title{
              font-size:30px;
            }

            .image-box{
              height:260px;
            }
          }
        `,
        }}
      />

      <div className="container">

        <div className="topbar">
          <h1 className="title">
            Gestion des <em>Produits</em>
          </h1>

          <Link
            href="/admin/products/new"
            className="btn-add"
          >
            + Nouveau Produit
          </Link>
        </div>

        {loading ? (
          <div className="loader">
            Chargement du vestiaire...
          </div>
        ) : products.length === 0 ? (
          <div className="empty">
            Aucun produit disponible.
          </div>
        ) : (
          <div className="grid">
            {products.map((product) => (
              <div
                key={product.id}
                className="card"
              >
                <div className="image-box">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
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
                    {product.category}
                  </div>

                  <div className="name">
                    {product.name}
                  </div>

                  <div className="price">
                    {product.price} DH
                  </div>

                  <div className="stock">
                    {product.isOutOfStock ? (
                      <span className="out">
                        Épuisé
                      </span>
                    ) : (
                      <>
                        Stock : {product.stock}
                      </>
                    )}
                  </div>

                  <div className="actions">

                    <Link
                      href={`/admin/products/edit/${product.id}`}
                      className="btn edit"
                    >
                      Modifier
                    </Link>

                    <button
                      className="btn delete"
                      onClick={() =>
                        deleteProduct(product.id)
                      }
                    >
                      Supprimer
                    </button>

                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}