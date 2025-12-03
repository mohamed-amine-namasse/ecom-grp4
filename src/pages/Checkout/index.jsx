import React, { useState } from "react";
import { useCart } from "../../components/CartContext";
import { Link } from "react-router";
import { loadStripe } from "@stripe/stripe-js";
import "./style.css";

// Fonction utilitaire pour le formatage du prix
const formatPrice = (p) => {
  return p.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
};

const stripePromise = loadStripe("pk_live_...REMPLACEZ_PAR_VOTRE_PUBLISHABLE_KEY"); // ou mettre dans .env

function Checkout() {
  const { cartItems, cartTotal } = useCart(); // Calcul du sous-total (peut-être déjà fait dans cartTotal, mais on s'assure d'avoir la donnée

  const subtotal = formatPrice(cartTotal); // Pour l'affichage Total, qui sera le même au début sans frais de port
  const totalDisplay = formatPrice(cartTotal); // 1. STATE : Pour stocker les données du formulaire d'adresse

  const [shippingAddress, setShippingAddress] = useState({
    firstName: "",
    lastName: "",
    country: "",
    state: "",
    address: "",
    city: "",
    postalCode: "",
  }); // 2. Fonction pour gérer le changement d'un champ

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  }; // 3. Logique pour déterminer si l'étape SHIPPING est "faite"

  const isShippingCompleted = Object.values(shippingAddress).some(
    (val) => val.trim() !== ""
  ); // 4. Logique pour déterminer si on peut passer à l'étape PAYMENT (tous les champs sont remplis)

  const isAllShippingFieldsFilled = Object.values(shippingAddress).every(
    (val) => val.trim() !== ""
  );

  const handlePayWithStripe = async () => {
    // Construire payload minimal (adapter selon ce que vous voulez envoyer)
    const payload = {
      items: cartItems.map((it) => ({
        id: it.id,
        name: it.name,
        unit_amount: Math.round((it.price || 0) * 100), // en cents
        quantity: it.quantity || 1,
        // ajouter options si nécessaire
      })),
      shipping: shippingAddress,
      success_url: window.location.origin + "/checkout/success",
      cancel_url: window.location.origin + "/cart",
    };

    // Appeler votre endpoint WP REST qui crée la Checkout Session
    const res = await fetch("https://votre-site-wp.com/wp-json/stripe/v1/create-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error("Erreur création session Stripe", await res.text());
      return;
    }

    const { sessionId } = await res.json();
    const stripe = await stripePromise;
    const { error } = await stripe.redirectToCheckout({ sessionId });
    if (error) {
      console.error(error);
    }
  };

  return (
    <div className="checkout-container ">
      <div className="checkout-left ">
        <h1>CHECKOUT</h1>
        <div className="steps">
          <span className="active">INFORMATION</span>
          <span className={isShippingCompleted ? "completed" : ""}>
            SHIPPING
          </span>

          <span className={isAllShippingFieldsFilled ? "completed" : ""}>
            PAYMENT
          </span>
        </div>
        <div className="section">
          <h3>CONTACT INFO</h3>
          <div className="row">
            <input type="email" placeholder="Email" />
            <input type="text" placeholder="Phone" />
          </div>
        </div>

        <div className="section">
          <h3>SHIPPING ADDRESS</h3>
          <div className="row">
            <input
              type="text"
              placeholder="First Name"
              name="firstName"
              value={shippingAddress.firstName}
              onChange={handleShippingChange}
            />
            <input
              type="text"
              placeholder="Last Name"
              name="lastName"
              value={shippingAddress.lastName}
              onChange={handleShippingChange}
            />
          </div>
          <div className="row ">
            <input
              type="text"
              placeholder="Country"
              name="country"
              value={shippingAddress.country}
              onChange={handleShippingChange}
            />
          </div>
          <div className="row ">
            <input
              type="text"
              placeholder="State / Region"
              name="state"
              value={shippingAddress.state}
              onChange={handleShippingChange}
            />
          </div>
          <div className="row ">
            <input
              type="text"
              placeholder="Address"
              name="address"
              value={shippingAddress.address}
              onChange={handleShippingChange}
            />
          </div>
          <div className="row">
            <input
              type="text"
              placeholder="City"
              name="city"
              value={shippingAddress.city}
              onChange={handleShippingChange}
            />
          </div>
          <div className="row">
            <input
              type="text"
              placeholder="Postal Code"
              name="postalCode"
              value={shippingAddress.postalCode}
              onChange={handleShippingChange}
            />
          </div>
          <button
            className="next-btn"
            disabled={!isAllShippingFieldsFilled}
            onClick={handlePayWithStripe}
          >
            Proceed to Stripe Payment →
          </button>
        </div>
      </div>

      <div className="checkout-right">
        <h3>YOUR ORDER</h3>
        {cartItems.length === 0 ? (
          <p>Votre panier est vide.</p>
        ) : (
          // Mapping des articles du panier
          cartItems.map((item) => {
            // 🚨 LOGIQUE POUR RÉCUPÉRER ET AFFICHER LES OPTIONS
            const optionsArray = [];

            if (item.selectedColor) {
              optionsArray.push(`Couleur: ${item.selectedColor}`);
            }
            if (item.selectedSize) {
              optionsArray.push(`Pointure: ${item.selectedSize}`);
            }

            const optionsDisplay = optionsArray.join(" | "); // Ex: "Couleur: Rouge | Pointure: 42"

            return (
              <div key={item.id} className="product">
                <img src={item.image || "/img/default.jpg"} alt={item.name} />
                <div>
                  <p className="title">{item.name}</p>

                  {/* Affichage des options seulement si elles existent */}
                  {optionsDisplay && (
                    <p className="product-options">{optionsDisplay}</p>
                  )}
                  <Link to="/cart" className="change-link">
                    Change
                  </Link>
                  <p>({item.quantity})</p>
                </div>
                <p className="price">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            );
          })
        )}
        <div className="summary">
          <div className="line">
            <span>Subtotal</span>
            <span>{subtotal}</span>
          </div>
          <div className="line">
            <span>Shipping</span>
            <span>Calculated at next step</span>
          </div>
          <div className="total">
            <span>Total</span>
            <span>{totalDisplay}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
