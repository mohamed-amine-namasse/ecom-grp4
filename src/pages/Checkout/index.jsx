import React, { useState, useEffect } from "react";
import { useCart } from "../../components/CartContext";
import { Link, useNavigate } from "react-router-dom";
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

// Base URL WordPress
const WP_API_BASE =
  process.env.REACT_APP_WP_API_BASE ||
  "https://mohamed-amine-namasse.students-laplateforme.io/wordpress-eco/wordpress";

// ******************************************************
//  FONCTIONS DE VALIDATION
// ******************************************************

const validatePostalCode = (code) => {
  // 5 chiffres numériques exacts
  const regex = /^\d{5}$/;
  return regex.test(code);
};

const validatePhone = (phone) => {
  // 10 chiffres numériques exacts (nettoyés des espaces)
  const cleaned = phone.replace(/[\s\-\.]/g, "");
  return cleaned.length === 10 && /^\d+$/.test(cleaned);
};

const validateEmail = (email) => {
  // Regex standard simple pour vérifier le format email
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};
// ******************************************************

function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const totalDisplay = formatPrice(cartTotal || 0);

  const [shippingAddress, setShippingAddress] = useState({
    firstName: "",
    lastName: "",
    country: "",
    state: "",
    address: "",
    city: "",
    postalCode: "",
    email: "",
    phone: "",
  });

  const [validationErrors, setValidationErrors] = useState({
    postalCode: null, // null (non vérifié), true (valide), 'Error message' (invalide)
    phone: null,
    email: null, //
  }); // useEffect pour pré-remplir l'email et initier la validation

  useEffect(() => {
    if (user && user.email) {
      setShippingAddress((prev) => {
        // Pré-remplir uniquement si l'email n'est pas déjà saisi
        const newEmail = prev.email || user.email;
        // Valider l'email pré-rempli
        const isValid = validateEmail(newEmail);

        // Mettre à jour l'adresse et l'état de validation
        setValidationErrors((prevErrors) => ({
          ...prevErrors,
          email: isValid ? true : "Veuillez entrer une adresse email valide.",
        }));

        return {
          ...prev,
          email: newEmail,
        };
      });
    }
  }, [user]);

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [orderId, setOrderId] = useState(null);

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));

    let error = null;

    if (name === "postalCode") {
      const isValid = validatePostalCode(value);
      error =
        value.trim() === ""
          ? null
          : isValid
          ? true
          : "Le code postal doit contenir exactement 5 chiffres.";
      setValidationErrors((prev) => ({ ...prev, postalCode: error }));
    } else if (name === "phone") {
      const isValid = validatePhone(value);
      error =
        value.trim() === ""
          ? null
          : isValid
          ? true
          : "Le téléphone doit contenir 10 chiffres (ex: 0123456789).";

      setValidationErrors((prev) => ({ ...prev, phone: error }));
    }
    //  VALIDATION EMAIL
    else if (name === "email") {
      const isValid = validateEmail(value);
      error =
        value.trim() === ""
          ? null
          : isValid
          ? true
          : "Veuillez entrer une adresse email valide.";

      setValidationErrors((prev) => ({ ...prev, email: error }));
    }
  };

  //  L'étape SHIPPING s'active si au moins un champ d'adresse est rempli.
  const isShippingDataEntered = [
    shippingAddress.firstName,
    shippingAddress.lastName,
    shippingAddress.country,
    shippingAddress.state,
    shippingAddress.address,
    shippingAddress.city,
    shippingAddress.postalCode,
  ].some((val) => val.trim() !== "");

  // Vérifie si TOUS les champs d'adresse (sauf email/phone) sont remplis
  const isAllShippingFieldsFilled = Object.entries(shippingAddress).every(
    ([key, val]) =>
      key !== "email" && key !== "phone" ? val.trim() !== "" : true
  );

  // Vérifie si les champs de Contact sont remplis
  const isContactFilled =
    shippingAddress.email.trim() !== "" && shippingAddress.phone.trim() !== "";

  // Vérifie si toutes les validations (email, phone, postalCode) sont réussies
  const isValidationOk =
    validationErrors.postalCode === true &&
    validationErrors.phone === true &&
    validationErrors.email === true;

  // Vérification complète pour activer les boutons
  const canProceedToPayment =
    isAllShippingFieldsFilled && isContactFilled && isValidationOk;

  //Paiement à la livraison
  const handlePlaceOrderWithCOD = async () => {
    if (!canProceedToPayment || cartItems.length === 0) {
      setPaymentMessage(
        "Veuillez remplir toutes les informations correctement (y compris email, téléphone et code postal valides) et avoir des articles dans le panier."
      );
      return;
    }

    setPaymentMessage("Passage de la commande...");
    setShowPaymentForm(false);
    setPaymentSuccess(false);

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
      customer_email: shippingAddress.email,
      customer_phone: shippingAddress.phone,
      payment_method: "cash_on_delivery",
      status: "processing",
    };

    const endpoint = `${WP_API_BASE}/wp-json/your-custom/v1/create-cod-order`;

    try {
      const resp = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await resp.json();

      if (resp.ok && data.order_id) {
        setPaymentSuccess(true);
        setOrderId(data.order_id);
        setPaymentMessage(
          `🎉 Commande (Paiement à la livraison) passée avec succès ! Votre numéro de commande est : **${data.order_id}**`
        );
        await clearCart();
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
  // Finaliser paiement
  const handleFinalizeOrder = () => {
    navigate("/");
  };

  const handleProceedToPayment = () => {
    if (!canProceedToPayment) return;
    setShowPaymentForm(true);
  }; // PaymentForm (Composant de Paiement Stripe)

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
      } //  VÉRIFICATION DU CODE POSTAL ET EMAIL DE FACTURATION

      if (!validatePostalCode(billing.postalCode)) {
        setStatus(
          "Le code postal de facturation doit être valide (5 chiffres)."
        );
        return;
      }
      if (!validateEmail(billing.email)) {
        setStatus("L'adresse email de facturation doit être valide.");
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

          await clearCart();
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
  } // RENDU PRINCIPAL DU CHECKOUT
  return (
    <div className="checkout-container ">
      <div className="checkout-left ">
        <h1>CHECKOUT</h1>
        <div className="steps">
          <span className="active">INFORMATION</span>

          <span className={isShippingDataEntered ? "completed" : ""}>
            SHIPPING
          </span>

          <span className={canProceedToPayment ? "completed" : ""}>
            PAYMENT
          </span>
        </div>

        <div className="section">
          <h3>CONTACT INFO</h3>
          <div className="row">
            <input
              type="email"
              placeholder="Email"
              name="email"
              value={shippingAddress.email}
              onChange={handleShippingChange}
              required
              className={
                validationErrors.email && validationErrors.email !== true
                  ? "error-input"
                  : ""
              }
            />
            <input
              type="text"
              placeholder="Phone"
              name="phone"
              value={shippingAddress.phone}
              onChange={handleShippingChange}
              required
              className={
                validationErrors.phone && validationErrors.phone !== true
                  ? "error-input"
                  : ""
              }
            />
          </div>

          {validationErrors.email && validationErrors.email !== true && (
            <p className="validation-error">❌ {validationErrors.email}</p>
          )}

          {validationErrors.phone && validationErrors.phone !== true && (
            <p className="validation-error">❌ {validationErrors.phone}</p>
          )}
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
              placeholder="Code postal"
              name="postalCode"
              value={shippingAddress.postalCode}
              onChange={handleShippingChange}
              className={
                validationErrors.postalCode &&
                validationErrors.postalCode !== true
                  ? "error-input"
                  : ""
              }
            />
          </div>
          {/* Message d'erreur pour le code postal */}
          {validationErrors.postalCode &&
            validationErrors.postalCode !== true && (
              <p className="validation-error">
                ❌ {validationErrors.postalCode}
              </p>
            )}
          <div className="payment-options">
            {/* Boutons désactivés tant que la validation n'est pas OK */}
            <button
              className="cod-btn"
              disabled={!canProceedToPayment}
              onClick={handlePlaceOrderWithCOD}
            >
              Payer à la Livraison
            </button>
            <button
              className="next-btn"
              disabled={!canProceedToPayment}
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
                  defaultBilling={{ ...shippingAddress }}
                  onSuccess={(intent) => {
                    setPaymentSuccess(true);
                    setOrderId(intent.id);
                    setPaymentMessage("Paiement Stripe réussi — merci !");
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
        {!orderId ? (
          <>
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
                    <img
                      src={item.image || "/img/default.jpg"}
                      alt={item.name}
                    />
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
              <div className="total">
                <span>Total</span>
                <span>{totalDisplay}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="order-submitted-message">
            <p>Merci ! Votre commande a bien été enregistrée.</p>
          </div>
        )}
        {paymentMessage && (
          <p
            className={`payment-message ${
              paymentSuccess ? "success" : "error"
            }`}
          >
            {paymentMessage}
          </p>
        )}
        {paymentSuccess && orderId && (
          <button className="finalize-btn" onClick={handleFinalizeOrder}>
            Finaliser l'achat
          </button>
        )}
      </div>
    </div>
  );
}

export default Checkout;
