import React, { useState } from "react";
import { Link } from "react-router";
import "./style.css";
import { API_CONFIG } from "../../config/api_shipping";

function Shipping() {
  const [orderId, setOrderId] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [orderData, setOrderData] = useState(null); // Pour stocker les données de la commande
  const [loading, setLoading] = useState(false);

  async function handleTrack(e) {
    e.preventDefault();
    setStatusMessage("");
    setOrderData(null); // Réinitialiser les données précédentes
    const trimmedId = orderId.trim();
    if (!trimmedId) {
      setStatusMessage("Veuillez saisir un numéro de commande.");
      return;
    }

    setLoading(true);
    // Utilisation de l'URL propre venant de la config
    const ORDER_API_URL = API_CONFIG.getOrderUrl(trimmedId);

    try {
      const res = await fetch(ORDER_API_URL, {
        method: "GET",
      });

      if (!res.ok) {
        // La commande n'a pas été trouvée ou une erreur d'API s'est produite
        const err = await res.json().catch(() => ({}));

        // WooCommerce renvoie un code 404 (Not Found) si la commande n'existe pas
        if (res.status === 404) {
          setStatusMessage(`Commande ${trimmedId}introuvable.`);
        } else {
          setStatusMessage(
            err.message ||
              `Erreur serveur (${res.status}) lors de la recherche.`,
          );
        }
      } else {
        const data = await res.json();

        // 3. Afficher les informations pertinentes de la commande
        setOrderData(data); // Stocker toutes les données de la commande
        setStatusMessage(
          `Commande trouvée ! Statut : ${data.status} (Total: ${data.total} ${data.currency})`,
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
        <h1>Livraison · Foot Market</h1>

        <p>
          Nous expédions des crampons pour joueuses partout. Retrouvez
          ci‑dessous les informations principales sur les délais, les frais et
          le suivi.
        </p>

        <h2>Suivi de commande</h2>
        <form onSubmit={handleTrack}>
          <label>
            Numéro de commande (ID)
            <input
              name="orderId"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Ex. 123"
            />
          </label>

          <div className="actions">
            <button type="submit" className=" btn " disabled={loading}>
              {loading ? "Recherche…" : "Rechercher"}
            </button>
          </div>
        </form>

        {statusMessage && <p className="status">{statusMessage}</p>}

        {/* Affichage des détails de la commande */}
        {orderData && (
          <div className="contain-order">
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

        <h2>Délais & retours</h2>
        <p>France: 2–5 jours. Retours possibles sous 14 jours.</p>

        <div className="actions">
          <Link to="/contact" className="btn">
            Contactez le support
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Shipping;
