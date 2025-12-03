import React, { useState } from "react";
import { useCart } from "../../components/CartContext";
import { Link } from "react-router";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import "./style.css";

// Fonction utilitaire pour le formatage du prix
const formatPrice = (p) => {
  return p.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
};

// Utiliser variable d'environnement, fallback optionnel 
const stripePromise = loadStripe(
  process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || "pk_test_51SaCaURpucHWGHGFLujFQb5NuwDLONlNeyaLq6Gj74vHNxJJhom8NbTZdEE6yZIrxCR3heI92DnJDphekVTJjxTz00pYKhG5M2"
);

// Base URL WordPress (mettre dans .env.local REACT_APP_WP_API_BASE)
const WP_API_BASE = process.env.REACT_APP_WP_API_BASE || "https://mohamed-amine-namasse.students-laplateforme.io/wordpress-eco/wordpress";

function Checkout() {
  const { cartItems, cartTotal } = useCart();

  const subtotal = formatPrice(cartTotal || 0);
  const totalDisplay = formatPrice(cartTotal || 0);

  const [shippingAddress, setShippingAddress] = useState({
    firstName: "",
    lastName: "",
    country: "",
    state: "",
    address: "",
    city: "",
    postalCode: "",
  });

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const isShippingCompleted = Object.values(shippingAddress).some((val) => val.trim() !== "");
  const isAllShippingFieldsFilled = Object.values(shippingAddress).every((val) => val.trim() !== "");

  const handleProceedToPayment = () => {
    if (!isAllShippingFieldsFilled) return;
    setShowPaymentForm(true);
  };

  // PaymentForm (fusion du PaymentPage.jsx)
  function PaymentForm({ amountCents, defaultBilling, onSuccess, onError }) {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [status, setStatus] = useState("");

    const [billing, setBilling] = useState({
      firstName: defaultBilling.firstName || "",
      lastName: defaultBilling.lastName || "",
      email: defaultBilling.email || "",
      address: defaultBilling.address || "",
      city: defaultBilling.city || "",
      postalCode: defaultBilling.postalCode || "",
      country: defaultBilling.country || "FR",
    });

    const handleChange = (e) => {
      const { name, value } = e.target;
      setBilling((b) => ({ ...b, [name]: value }));
    };

    async function handleSubmit(e) {
      e.preventDefault();
      if (!stripe || !elements) {
        setStatus("Stripe non initialisé");
        return;
      }

      if (!billing.firstName || !billing.lastName || !billing.email) {
        setStatus("Veuillez renseigner nom, prénom et email.");
        return;
      }

      setProcessing(true);
      setStatus("");

      const endpoint = `${WP_API_BASE}/wp-json/stripe/v1/create-payment-intent`;

      try {
        const resp = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: amountCents,
            currency: "eur",
            billing: billing,
            // vous pouvez ajouter cart/items si besoin
          }),
        });

        if (!resp.ok) {
          const text = await resp.text();
          setStatus("Erreur serveur: " + text);
          setProcessing(false);
          onError && onError(text);
          return;
        }

        const data = await resp.json();
        const clientSecret = data.clientSecret;
        if (!clientSecret) {
          setStatus("Réponse serveur invalide");
          setProcessing(false);
          onError && onError("clientSecret missing");
          return;
        }

        const cardElement = elements.getElement(CardElement);
        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: `${billing.firstName} ${billing.lastName}`,
              email: billing.email,
              address: {
                line1: billing.address || "",
                city: billing.city || "",
                postal_code: billing.postalCode || "",
                country: billing.country || "FR",
              },
            },
          },
        });

        if (result.error) {
          setStatus(result.error.message || "Erreur paiement");
          onError && onError(result.error.message);
        } else if (result.paymentIntent && result.paymentIntent.status === "succeeded") {
          setStatus("Paiement réussi — merci !");
          onSuccess && onSuccess(result.paymentIntent);
        } else {
          setStatus("Échec du paiement");
          onError && onError("payment_failed");
        }
      } catch (err) {
        setStatus("Erreur: " + (err.message || err));
        onError && onError(err.message || err);
      } finally {
        setProcessing(false);
      }
    }

    return (
      <form className="payment-form" onSubmit={handleSubmit}>
        <h3>Informations de facturation & paiement</h3>

        <div className="row">
          <input name="firstName" value={billing.firstName} onChange={handleChange} placeholder="Prénom" />
          <input name="lastName" value={billing.lastName} onChange={handleChange} placeholder="Nom" />
        </div>

        <div className="row">
          <input name="email" value={billing.email} onChange={handleChange} placeholder="Email" type="email" />
        </div>

        <div className="row">
          <input name="address" value={billing.address} onChange={handleChange} placeholder="Adresse" />
        </div>

        <div className="row">
          <input name="city" value={billing.city} onChange={handleChange} placeholder="Ville" />
          <input name="postalCode" value={billing.postalCode} onChange={handleChange} placeholder="Code postal" />
          <input name="country" value={billing.country} onChange={handleChange} placeholder="Pays (ISO)" />
        </div>

        <div className="row card-row">
          <label>Carte bancaire</label>
          <div className="card-element">
            <CardElement options={{ hidePostalCode: true }} />
          </div>
        </div>

        <div className="actions">
          <button type="submit" disabled={!stripe || processing}>
            {processing ? "Paiement…" : `Payer (${(amountCents / 100).toFixed(2)} €)`}
          </button>
          <button type="button" className="cancel" onClick={() => setShowPaymentForm(false)} disabled={processing}>
            Annuler
          </button>
        </div>

        {status && <p className="status">{status}</p>}
      </form>
    );
  }

  return (
    <div className="checkout-container ">
      <div className="checkout-left ">
        <h1>CHECKOUT</h1>
        <div className="steps">
          <span className="active">INFORMATION</span>
          <span className={isShippingCompleted ? "completed" : ""}>SHIPPING</span>
          <span className={isAllShippingFieldsFilled ? "completed" : ""}>PAYMENT</span>
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
          <button className="next-btn" disabled={!isAllShippingFieldsFilled} onClick={handleProceedToPayment}>
            Proceed to Stripe Payment →
          </button>

          {showPaymentForm && (
            <div className="payment-section">
              <Elements stripe={stripePromise}>
                <PaymentForm
                  amountCents={Math.round((cartTotal || 0) * 100)}
                  defaultBilling={{ ...shippingAddress, email: "" }}
                  onSuccess={(intent) => {
                    setPaymentSuccess(true);
                    setPaymentMessage("Paiement réussi — merci !");
                    // TODO: appeler backend pour marquer commande payée, sauvegarder order id, etc.
                  }}
                  onError={(err) => {
                    setPaymentSuccess(false);
                    setPaymentMessage(err || "Erreur paiement");
                  }}
                />
              </Elements>
            </div>
          )}
        </div>
      </div>

      <div className="checkout-right">
        <h3>YOUR ORDER</h3>
        {cartItems.length === 0 ? (
          <p>Votre panier est vide.</p>
        ) : (
          cartItems.map((item) => {
            const optionsArray = [];
            if (item.selectedColor) optionsArray.push(`Couleur: ${item.selectedColor}`);
            if (item.selectedSize) optionsArray.push(`Pointure: ${item.selectedSize}`);
            const optionsDisplay = optionsArray.join(" | ");
            return (
              <div key={item.id} className="product">
                <img src={item.image || "/img/default.jpg"} alt={item.name} />
                <div>
                  <p className="title">{item.name}</p>
                  {optionsDisplay && <p className="product-options">{optionsDisplay}</p>}
                  <Link to="/cart" className="change-link">Change</Link>
                  <p>({item.quantity})</p>
                </div>
                <p className="price">{formatPrice(item.price * item.quantity)}</p>
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
        {paymentMessage && <p className="payment-message">{paymentMessage}</p>}
      </div>
    </div>
  );
}

export default Checkout;
