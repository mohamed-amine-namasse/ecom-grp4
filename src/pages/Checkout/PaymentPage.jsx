import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import "./style.css";

const stripePromise = loadStripe("pk_test_51SaCaURpucHWGHGFih1R7WseDqToxNf48AXhfDDceC3Veq7Sj7D88MFQlvyLdg8Touj3Z1xYWd9Fv3s4uTs9Rdap001KVprSOh");

function CheckoutForm({ amountCents = 1000 /* par défaut 10.00 EUR */ }) {
  const stripe = useStripe();
  const elements = useElements();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    country: "FR",
  });
  const [status, setStatus] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return setStatus("Stripe non initialisé");

    // validation minimale
    if (!form.firstName || !form.lastName || !form.email) {
      return setStatus("Veuillez renseigner nom, prénom et email.");
    }

    setProcessing(true);
    setStatus("");

    // Créez un PaymentIntent côté serveur (endpoint WP)
    const resp = await fetch("https://mohamed-amine-namasse.students-laplateforme.io/wordpress-eco/wordpress/wp-json/wc-stripe/v1/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: amountCents,
        currency: "eur",
        billing: form,
        // vous pouvez envoyer les items/cart si besoin
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      setStatus("Erreur serveur: " + text);
      setProcessing(false);
      return;
    }

    const data = await resp.json();
    const clientSecret = data.clientSecret;
    if (!clientSecret) {
      setStatus("Réponse serveur invalide");
      setProcessing(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: `${form.firstName} ${form.lastName}`,
          email: form.email,
          address: {
            line1: form.address,
            city: form.city,
            postal_code: form.postalCode,
            country: form.country,
          },
        },
      },
    });

    if (result.error) {
      setStatus(result.error.message || "Erreur paiement");
    } else if (result.paymentIntent && result.paymentIntent.status === "succeeded") {
      setStatus("Paiement réussi — merci !");
      // TODO: rediriger / marquer commande côté back via webhook ou appel supplémentaire
    } else {
      setStatus("Échec du paiement");
    }

    setProcessing(false);
  };

  return (
    <div className="payment-page">
      <form className="payment-form" onSubmit={handleSubmit}>
        <h2>Paiement</h2>

        <div className="row">
          <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="Prénom" />
          <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Nom" />
        </div>

        <div className="row">
          <input name="email" value={form.email} onChange={handleChange} placeholder="Email" type="email" />
        </div>

        <div className="row">
          <input name="address" value={form.address} onChange={handleChange} placeholder="Adresse" />
        </div>

        <div className="row">
          <input name="city" value={form.city} onChange={handleChange} placeholder="Ville" />
          <input name="postalCode" value={form.postalCode} onChange={handleChange} placeholder="Code postal" />
          <input name="country" value={form.country} onChange={handleChange} placeholder="Pays (ISO)" />
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
        </div>

        {status && <p className="status">{status}</p>}
      </form>
    </div>
  );
}

export default function PaymentPage(props) {
  // récupérez amountCents depuis votre panier (cartTotal *100)
  const amountCents = props.amountCents ??  Math.round((props.amountEuros ?? 10) * 100);
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm amountCents={amountCents} />
    </Elements>
  );
}