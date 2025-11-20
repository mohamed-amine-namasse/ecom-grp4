// ...existing code...
import React, { useState } from "react";
import "./style.css";

const initialProducts = [
  {
    id: 1,
    name: "Sneaker Classic",
    price: 79.99,
    image: "https://via.placeholder.com/400x300?text=Sneaker+Classic",
    badge: "Nouveau",
    desc: "Confort quotidien, semelle légère.",
  },
  {
    id: 2,
    name: "Run Pro",
    price: 129.99,
    image: "https://via.placeholder.com/400x300?text=Run+Pro",
    badge: "Promo",
    desc: "Performance et maintien pour la course.",
  },
  {
    id: 3,
    name: "Court Trainer",
    price: 59.99,
    image: "https://via.placeholder.com/400x300?text=Court+Trainer",
    badge: null,
    desc: "Polyvalent pour la salle et la rue.",
  },
  {
    id: 4,
    name: "High Top Retro",
    price: 99.99,
    image: "https://via.placeholder.com/400x300?text=High+Top+Retro",
    badge: "Édition",
    desc: "Style rétro, confort moderne.",
  },
  {
    id: 5,
    name: "Trail Pro",
    price: 139.99,
    image: "https://via.placeholder.com/400x300?text=Trail+Pro",
    badge: null,
    desc: "Adhérence et protection pour sentiers.",
  },
  {
    id: 6,
    name: "Everyday Slip-On",
    price: 49.99,
    image: "https://via.placeholder.com/400x300?text=Slip+On",
    badge: "Best-seller",
    desc: "Facile à enfiler, idéale pour tous les jours.",
  },
];

function Shop() {
  const [products] = useState(initialProducts);
  const formatPrice = (p) =>
    p.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

  return (
    <main className="shop-container">
      <header className="shop-header">
        <h1>Boutique</h1>
        <p className="shop-sub">Découvrez nos produits sélectionnés</p>
      </header>

      <section className="products-grid" aria-live="polite">
        {products.map((prod) => (
          <article key={prod.id} className="product-card">
            {prod.badge && <span className="product-badge">{prod.badge}</span>}
            <div className="product-media">
              <img src={prod.image} alt={prod.name} />
            </div>
            <div className="product-body">
              <h3 className="product-title">{prod.name}</h3>
              <p className="product-desc">{prod.desc}</p>
              <div className="product-footer">
                <span className="product-price">{formatPrice(prod.price)}</span>
                <button
                  className="btn-add"
                  type="button"
                  aria-label={`Ajouter ${prod.name} au panier`}
                >
                  Ajouter
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

export default Shop;
