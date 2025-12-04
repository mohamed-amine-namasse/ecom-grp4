import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../components/AuthContext";
import "./orders.css"; // L'import est déjà présent, assurez-vous du nom du fichier !

const WOOCOMMERCE_FULL_URL =
  "https://mohamed-amine-namasse.students-laplateforme.io/wordpress-eco/wordpress";

// Helper pour déterminer la classe de statut
const getStatusClass = (status) => {
  switch (status) {
    case "completed":
      return "status-completed";
    case "processing":
      return "status-processing";
    case "pending":
    case "on-hold":
      return "status-pending";
    default:
      return "";
  }
};

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { customerId } = useParams();
  const { token, user } = useAuth();

  useEffect(() => {
    // ... (Logique de fetch inchangée, elle est correcte)
    if (!token || !user || !user.email) {
      setError("Token ou email manquant pour charger les commandes.");
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      setError(null);

      const customerFilter = customerId || 0;
      const userEmail = user.email;

      const ENDPOINT = `${WOOCOMMERCE_FULL_URL}/wp-json/wc/v3/orders?customer=${customerFilter}&billing_email=${userEmail}`;

      try {
        const res = await fetch(ENDPOINT, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.message ||
              "Erreur lors de la récupération des commandes. Vérifiez les permissions de l'API."
          );
        }

        // Triez par ID décroissant pour voir les commandes les plus récentes en premier
        const sortedOrders = data.sort((a, b) => b.id - a.id);
        setOrders(sortedOrders);
        setError(null);
      } catch (err) {
        console.error("Erreur de récupération des commandes:", err.message);
        setError(
          `Impossible de charger les commandes: ${err.message}. L'ID utilisé est ${customerFilter}`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [customerId, token, user]);

  // --- RENDU AVEC LES CLASSES CSS ---

  return (
    <div className="orders-page">
      {" "}
      {/* Conteneur principal */}
      <h1>Historique des Commandes</h1>
      {loading && <p>Chargement des commandes...</p>}
      {error && <div style={{ color: "red" }}>Erreur: {error}</div>}
      {!loading && !error && orders.length === 0 && (
        <div>
          <p>
            Aucune commande trouvée pour le client ID: {customerId || "N/A"}
          </p>
        </div>
      )}
      {/* Affichage de la liste des commandes */}
      {!loading && !error && orders.length > 0 && (
        <div>
          {orders.map((order) => (
            <div key={order.id} className="order-box">
              <h2>
                <span>Commande #{order.number || order.id}</span>
                <span className={`status-tag ${getStatusClass(order.status)}`}>
                  {order.status.replace("-", " ")}
                </span>
              </h2>

              <div className="order-details">
                <p>
                  <strong>Date:</strong>
                  <span>
                    {new Date(order.date_created).toLocaleDateString()}
                  </span>
                </p>
                <p>
                  <strong>Total:</strong>
                  <strong>
                    {order.total} {order.currency_symbol}
                  </strong>
                </p>
              </div>

              <h3>Articles Commandés ({order.line_items.length})</h3>
              <ul className="item-list">
                {order.line_items.map((item) => (
                  <li key={item.id}>
                    {item.quantity} x {item.name}
                    (Prix: {item.total} {order.currency_symbol})
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;
