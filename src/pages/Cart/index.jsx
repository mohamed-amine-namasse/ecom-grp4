import React from "react";
import { useCart } from "../../components/CartContext"; // Assurez-vous que le chemin est correct
import "./style.css";

// Fonction pour formater le prix en Euro (réutilisée de votre composant Shop)
const formatPrice = (p) =>
  p.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

function Cart() {
  // Récupération des données et fonctions du contexte
  const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();

  // Fonction pour gérer l'augmentation de la quantité
  const handleIncrease = (item) => {
    updateQuantity(item.id, item.quantity + 1);
  };

  // Fonction pour gérer la diminution de la quantité (avec suppression si elle atteint zéro)
  const handleDecrease = (item) => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.quantity - 1);
    } else {
      // Si la quantité est 1 et qu'on diminue, on retire l'article
      removeFromCart(item.id);
    }
  };

  // ----------------------------------------------------------------------
  // --- RENDU
  // ----------------------------------------------------------------------

  return (
    <main className="cart-container">
      <h1>Votre Panier</h1>

      {cartItems.length === 0 ? (
        <div className="cart-empty-state">
          <p>
            Votre panier est vide. Commencez vos achats dans la{" "}
            <a href="/shop">Boutique</a> !
          </p>
        </div>
      ) : (
        <div className="cart-content">
          <section className="cart-items-list">
            {cartItems.map((item) => (
              <article key={item.id} className="cart-item-card">
                <div className="item-info">
                  <h2 className="item-name">{item.name}</h2>
                  <p className="item-price">
                    Prix unitaire : {formatPrice(item.price)}
                  </p>
                </div>

                <div className="item-quantity-controls">
                  <button
                    className="btn-quantity decrease"
                    onClick={() => handleDecrease(item)}
                    aria-label="Diminuer la quantité"
                  >
                    -
                  </button>
                  <span className="item-quantity">{item.quantity}</span>
                  <button
                    className="btn-quantity increase"
                    onClick={() => handleIncrease(item)}
                    aria-label="Augmenter la quantité"
                  >
                    +
                  </button>
                </div>

                <div className="item-subtotal">
                  <p>
                    Sous-total : **{formatPrice(item.price * item.quantity)}**
                  </p>
                </div>

                <button
                  className="btn-remove"
                  onClick={() => removeFromCart(item.id)}
                  aria-label="Retirer l'article du panier"
                >
                  &times; Retirer
                </button>
              </article>
            ))}
          </section>

          <aside className="cart-summary">
            <h2>Récapitulatif de la commande</h2>
            <hr />
            <div className="summary-line">
              <span>Articles ({cartItems.length}) :</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            {/* Vous pouvez ajouter ici les frais de port, taxes, etc. */}
            <div className="summary-line total">
              <strong>Total à payer :</strong>
              <strong>{formatPrice(cartTotal)}</strong>
            </div>

            <button className="btn-checkout" type="button">
              Passer la commande
            </button>
          </aside>
        </div>
      )}
    </main>
  );
}

export default Cart;
