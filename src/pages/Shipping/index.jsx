import React, { useState } from "react";
import "./style.css";

function Shipping() {
  const [tracking, setTracking] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const WOOCOMMERCE_FULL_URL =
    "https://mohamed-amine-namasse.students-laplateforme.io/wordpress-eco/wordpress";
  const CONSUMER_KEY = "ck_aa9a985d1afe4839d747e479a02fb4120116df9b";
  const CONSUMER_SECRET = "cs_aa80e9a2a76467d2dd9b5f49ae0ab17f51b7a407";

  // Construction de l'URL API
  const API_URL = `${WOOCOMMERCE_FULL_URL}/wp-json/wc/v3/products?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}&per_page=100`;
  async function handleTrack(e) {
    e.preventDefault();
    setStatus("");
    if (!tracking.trim()) {
      setStatus("Veuillez saisir un numéro de suivi.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tracking: tracking.trim() }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setStatus(err.message || "Erreur serveur lors du suivi.");
      } else {
        const data = await res.json();
        // attendre le format renvoyé par WP ; ici on affiche message / details
        if (data && data.found) {
          setStatus(`Statut : ${data.status} — ${data.message || ""}`);
        } else {
          setStatus(data.message || `Aucun résultat pour : ${tracking}`);
        }
      }
    } catch (error) {
      setStatus("Impossible de contacter le serveur de suivi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="contact-page">
      <section className="contact-card">
        <h1>Livraison · Football Market</h1>

        <p className="lead">
          Nous expédions des crampons pour joueuses partout. Retrouvez
          ci‑dessous les informations principales sur les délais, les frais et
          le suivi.
        </p>

        <h2>Suivi de commande</h2>
        <form onSubmit={handleTrack} style={{ marginTop: 8 }}>
          <label>
            Numéro de suivi
            <input
              name="tracking"
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              placeholder="Ex. ABC123456789"
            />
          </label>

          <div className="actions">
            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Recherche…" : "Rechercher"}
            </button>
          </div>
        </form>

        {status && <p className="status">{status}</p>}

        <h2 style={{ marginTop: 18 }}>Délais & retours</h2>
        <p className="lead">
          France: 2–5 jours. Retours possibles sous 14 jours.
        </p>

        <div className="actions" style={{ marginTop: 14 }}>
          <a href="/contact" className="btn">
            Contactez le support
          </a>
        </div>
      </section>
    </main>
  );
}

export default Shipping;
