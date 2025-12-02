import React, { useState } from "react";
import "./style.css";

function Shipping() {
  const [orderId, setOrderId] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [orderData, setOrderData] = useState(null); // Pour stocker les données de la commande
  const [loading, setLoading] = useState(false);

  const WOOCOMMERCE_FULL_URL =
    "https://mohamed-amine-namasse.students-laplateforme.io/wordpress-eco/wordpress";
  const CONSUMER_KEY = "ck_aa9a985d1afe4839d747e479a02fb4120116df9b";
  const CONSUMER_SECRET = "cs_aa80e9a2a76467d2dd9b5f49ae0ab17f51b7a407";

  async function handleTrack(e) {
    e.preventDefault();
    setStatusMessage("");
    setOrderData(null); // Réinitialiser les données précédentes

    if (!orderId.trim()) {
      setStatusMessage("Veuillez saisir un numéro de commande.");
      return;
    }

    setLoading(true);

    // 1. Point d'accès corrigé : cibler une commande spécifique par son ID (orderId)
    // 2. Les clés doivent être dans l'URL pour la méthode GET
    const ORDER_API_URL = `${WOOCOMMERCE_FULL_URL}/wp-json/wc/v3/orders/${orderId.trim()}?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`;

    try {
      const res = await fetch(ORDER_API_URL, {
        method: "GET",
      });

      if (!res.ok) {
        // La commande n'a pas été trouvée ou une erreur d'API s'est produite
        const err = await res.json().catch(() => ({}));

        // WooCommerce renvoie un code 404 (Not Found) si la commande n'existe pas
        if (res.status === 404) {
          setStatusMessage(`Commande ${orderId.trim()} introuvable.`);
        } else {
          setStatusMessage(
            err.message ||
              `Erreur serveur (${res.status}) lors de la recherche.`
          );
        }
      } else {
        const data = await res.json();

        // 3. Afficher les informations pertinentes de la commande
        setOrderData(data); // Stocker toutes les données de la commande
        setStatusMessage(
          `Commande trouvée ! Statut : ${data.status} (Total: ${data.total} ${data.currency})`
        );
      }
    } catch (error) {
      console.error("Erreur de fetch:", error);
      setStatusMessage("Impossible de contacter le serveur WooCommerce.");
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
            Numéro de commande (ID)
            <input
              name="orderId"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Ex. 123" // Exemple d'ID de commande
            />
          </label>

          <div className="actions">
            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Recherche…" : "Rechercher"}
            </button>
          </div>
        </form>

        {statusMessage && <p className="status">{statusMessage}</p>}

        {/* Affichage des détails de la commande */}
        {orderData && (
          <div
            style={{ marginTop: 20, border: "1px solid #ccc", padding: "10px" }}
          >
            <h3>Détails de la commande #{orderData.id}</h3>
            <ul>
              <li>**Statut :** {orderData.status}</li>
              <li>
                **Date de la commande :**{" "}
                {new Date(orderData.date_created).toLocaleDateString()}
              </li>
              <li>
                **Total :** {orderData.total} {orderData.currency}
              </li>
              {orderData.billing && (
                <li>
                  **Client :** {orderData.billing.first_name}{" "}
                  {orderData.billing.last_name} ({orderData.billing.email})
                </li>
              )}
              {/* Vous pouvez ajouter plus de détails ici, par exemple la liste des produits */}
              {orderData.line_items && orderData.line_items.length > 0 && (
                <li>
                  **Articles :**
                  <ul>
                    {orderData.line_items.map((item) => (
                      <li key={item.id}>
                        {item.quantity} x {item.name}
                      </li>
                    ))}
                  </ul>
                </li>
              )}
            </ul>
          </div>
        )}

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
