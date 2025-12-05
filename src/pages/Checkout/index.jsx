import React, { useState, useEffect } from "react";
import { useCart } from "../../components/CartContext";
import { Link } from "react-router";
import { loadStripe } from "@stripe/stripe-js";
import { useAuth } from "../../components/AuthContext";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import "./style.css";

// Fonction utilitaire pour le formatage du prix
const formatPrice = (p) => {
  return p.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
};

// Utiliser variable d'environnement, fallback optionnel
const stripePromise = loadStripe(
  process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY ||
    "pk_test_51SaCaURpucHWGHGFLujFQb5NuwDLONlNeyaLq6Gj74vHNxJJhom8NbTZdEE6yZIrxCR3heI92DnJDphekVTJjxTz00pYKhG5M2"
);

// Base URL WordPress (mettre dans .env.local REACT_APP_WP_API_BASE)
const WP_API_BASE =
  process.env.REACT_APP_WP_API_BASE ||
  "https://mohamed-amine-namasse.students-laplateforme.io/wordpress-eco/wordpress";

function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart(); // MODIFICATION: Assurez-vous d'avoir clearCart si vous voulez vider le panier après commande.
  const { user } = useAuth();
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
    email: "", // MODIFICATION: Ajoutez l'email ici (ou récupérez-le des inputs CONTACT INFO)
    phone: "", // MODIFICATION: Ajoutez le téléphone ici
  });
  // ⭐️ NOUVEAU useEffect pour pré-remplir l'email ⭐️
  useEffect(() => {
    // Si l'utilisateur est connecté ET son email est disponible,
    // ET si le champ email n'est pas déjà rempli par l'utilisateur,
    // on met à jour l'état.
    if (user && user.email && !shippingAddress.email) {
      setShippingAddress((prev) => ({
        ...prev,
        email: user.email,
      }));
    }
  }, [user, shippingAddress.email]); // Dépend de l'objet user et de l'état actuel de l'email
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const isShippingCompleted = Object.values(shippingAddress).some(
    (val) => val.trim() !== ""
  );
  // MODIFICATION: Exclure explicitement email/phone du contrôle isAllShippingFieldsFilled si les champs de Contact sont gérés séparément
  const isAllShippingFieldsFilled = Object.entries(shippingAddress).every(
    ([key, val]) =>
      key !== "email" && key !== "phone" ? val.trim() !== "" : true
  );

  // MODIFICATION: Nouvelle fonction pour gérer la soumission de la commande sans paiement (PAL)
  const handlePlaceOrderWithCOD = async () => {
    // MODIFICATION: Inclure email/phone dans la vérification si les inputs CONTACT INFO sont liés à `shippingAddress`
    const isContactFilled =
      shippingAddress.email.trim() !== "" &&
      shippingAddress.phone.trim() !== "";

    if (
      !isAllShippingFieldsFilled ||
      !isContactFilled ||
      cartItems.length === 0
    ) {
      setPaymentMessage(
        "Veuillez remplir toutes les informations de contact et de livraison, et avoir des articles dans le panier."
      );
      return;
    }

    setPaymentMessage("Passage de la commande...");
    setShowPaymentForm(false);
    setPaymentSuccess(false);

    // Préparation des données de commande pour le backend
    const orderData = {
      shipping: shippingAddress,
      items: cartItems.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        meta: {
          color: item.selectedColor,
          size: item.selectedSize,
        },
      })),
      total: cartTotal,
      customer_email: shippingAddress.email, // Ajout de l'email
      customer_phone: shippingAddress.phone, // Ajout du téléphone
      payment_method: "cash_on_delivery", // Utiliser un slug de méthode de paiement à la livraison
      status: "processing", // Statut initial pour une commande en attente de paiement à la livraison
    };

    // MODIFICATION: Vous devrez implémenter ce endpoint dans votre backend (API WordPress)
    // Ce endpoint doit créer une commande WooCommerce (ou autre) avec la méthode de paiement "cash_on_delivery"
    const endpoint = `${WP_API_BASE}/wp-json/your-custom/v1/create-cod-order`;

    try {
      const resp = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await resp.json();

      if (resp.ok && data.order_id) {
        clearCart();
        setPaymentSuccess(true);
        setPaymentMessage(
          `🎉 Commande (Paiement à la livraison) passée avec succès ! Votre numéro de commande est : **${data.order_id}**`
        );
        // OPTIONNEL : Vider le panier après commande réussie
        // clearCart();
      } else {
        const errorMsg =
          data.message || "Erreur lors de la création de la commande.";
        setPaymentSuccess(false);
        setPaymentMessage(`❌ Échec de la commande : ${errorMsg}`);
      }
    } catch (err) {
      setPaymentSuccess(false);
      setPaymentMessage(`Erreur réseau : ${err.message}`);
    }
  };
  // FIN MODIFICATION: Nouvelle fonction pour gérer la soumission de la commande sans paiement (PAL)

  const handleProceedToPayment = () => {
    if (
      !isAllShippingFieldsFilled ||
      shippingAddress.email.trim() === "" ||
      shippingAddress.phone.trim() === ""
    )
      return; // MODIFICATION: Vérification des champs de contact
    setShowPaymentForm(true);
  };

  // PaymentForm (fusion du PaymentPage.jsx)
  function PaymentForm({ amountCents, defaultBilling, onSuccess, onError }) {
    // ... code PaymentForm existant (inchangé ou utilisez la version fournie par l'utilisateur) ...

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
      // ... logique Stripe existante ...
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
        } else if (
          result.paymentIntent &&
          result.paymentIntent.status === "succeeded"
        ) {
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

    // MODIFICATION: Suppression de l'ancienne fonction handlePlaceOrderWithoutPayment pour la centraliser dans Checkout

    return (
      <form className="payment-form" onSubmit={handleSubmit}>
        <h3>Informations de facturation & paiement (Carte Bancaire)</h3>

        <div className="row">
          <input
            name="firstName"
            value={billing.firstName}
            onChange={handleChange}
            placeholder="Prénom"
          />
          <input
            name="lastName"
            value={billing.lastName}
            onChange={handleChange}
            placeholder="Nom"
          />
        </div>

        <div className="row">
          <input
            name="email"
            value={billing.email}
            onChange={handleChange}
            placeholder="Email"
            type="email"
          />
        </div>

        <div className="row">
          <input
            name="address"
            value={billing.address}
            onChange={handleChange}
            placeholder="Adresse"
          />
        </div>

        <div className="row">
          <input
            name="city"
            value={billing.city}
            onChange={handleChange}
            placeholder="Ville"
          />
          <input
            name="postalCode"
            value={billing.postalCode}
            onChange={handleChange}
            placeholder="Code postal"
          />
          <input
            name="country"
            value={billing.country}
            onChange={handleChange}
            placeholder="Pays (ISO)"
          />
        </div>

        <div className="row card-row">
          <label>Carte bancaire</label>
          <div className="card-element">
            <CardElement options={{ hidePostalCode: true }} />
          </div>
        </div>

        <div className="actions">
          <button type="submit" disabled={!stripe || processing}>
            {processing
              ? "Paiement…"
              : `Payer (${(amountCents / 100).toFixed(2)} €)`}
          </button>
          <button
            type="button"
            className="cancel"
            onClick={() => setShowPaymentForm(false)}
            disabled={processing}
          >
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
            {/* MODIFICATION: Lier les inputs Email et Phone au state shippingAddress */}
            <input
              type="email"
              placeholder="Email"
              name="email"
              value={shippingAddress.email}
              onChange={handleShippingChange}
              required
            />
            <input
              type="text"
              placeholder="Phone"
              name="phone"
              value={shippingAddress.phone}
              onChange={handleShippingChange}
              required
            />
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

          <div className="payment-options">
            {/* MODIFICATION: Bouton pour le paiement à la livraison (PAL) */}
            <button
              className="cod-btn"
              disabled={
                !isAllShippingFieldsFilled ||
                shippingAddress.email.trim() === "" ||
                shippingAddress.phone.trim() === ""
              }
              onClick={handlePlaceOrderWithCOD}
            >
              Payer à la Livraison
            </button>

            {/* MODIFICATION: Bouton pour passer à Stripe (s'affiche si les champs sont remplis) */}
            <button
              className="next-btn"
              disabled={
                !isAllShippingFieldsFilled ||
                shippingAddress.email.trim() === "" ||
                shippingAddress.phone.trim() === ""
              }
              onClick={handleProceedToPayment}
            >
              Procéder au Paiement par Carte (Stripe) →
            </button>
          </div>

          {showPaymentForm && (
            <div className="payment-section">
              <Elements stripe={stripePromise}>
                <PaymentForm
                  amountCents={Math.round((cartTotal || 0) * 100)}
                  defaultBilling={{ ...shippingAddress }} // MODIFICATION: Passer toutes les infos, y compris email/phone
                  onSuccess={(intent) => {
                    setPaymentSuccess(true);
                    setPaymentMessage("Paiement Stripe réussi — merci !");
                    // TODO: appeler backend pour marquer commande payée, sauvegarder order id, etc.
                  }}
                  onError={(err) => {
                    setPaymentSuccess(false);
                    setPaymentMessage(err || "Erreur paiement Stripe");
                  }}
                />
              </Elements>
            </div>
          )}
        </div>
      </div>

      <div className="checkout-right">
        <h3>YOUR ORDER</h3>
        {/* ... Reste de la section Order (inchangée) ... */}
        {cartItems.length === 0 ? (
          <p>Votre panier est vide.</p>
        ) : (
          cartItems.map((item) => {
            const optionsArray = [];
            if (item.selectedColor)
              optionsArray.push(`Couleur: ${item.selectedColor}`);
            if (item.selectedSize)
              optionsArray.push(`Pointure: ${item.selectedSize}`);
            const optionsDisplay = optionsArray.join(" | ");
            return (
              <div key={item.id} className="product">
                <img src={item.image || "/img/default.jpg"} alt={item.name} />
                <div>
                  <p className="title">{item.name}</p>
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
        {paymentMessage && (
          <p
            className={`payment-message ${
              paymentSuccess ? "success" : "error"
            }`}
          >
            {paymentMessage}
          </p>
        )}{" "}
        {/* MODIFICATION: Ajout de classes pour le style */}
      </div>
    </div>
  );
}

export default Checkout;
