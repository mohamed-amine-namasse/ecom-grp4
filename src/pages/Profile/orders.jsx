import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import "./orders.css";

const WOOCOMMERCE_FULL_URL =
  "https://mohamed-amine-namasse.students-laplateforme.io/wordpress-eco/wordpress";
const CONSUMER_KEY = "ck_ae0703c9b00197c41256d3da1618e3e0209c7fc2";
const CONSUMER_SECRET = "cs_a79c66ab51106107de3d3355a0a015909629e3fc";

const Orders = () => {
  const { customerId } = useParams();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);

      if (!customerId) {
        setLoading(false); // Utilisez un message plus clair pour l'absence d'ID au montage
        setError(
          "L'ID du client est manquant dans l'URL. Veuillez vous connecter."
        );
        return;
      }

      const ordersApiUrl = `${WOOCOMMERCE_FULL_URL}/wp-json/wc/v3/orders?customer=${customerId}&consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`;

      try {
        const response = await fetch(ordersApiUrl);

        if (!response.ok) {
          // Tentative de lire le corps de la réponse pour plus de détails en cas d'erreur
          const errorBody = await response.json();
          throw new Error(
            `Erreur HTTP! Statut: ${response.status}. Message: ${
              errorBody.message || "Non spécifié"
            }`
          );
        }

        const data = await response.json();
        setOrders(data);
      } catch (e) {
        console.error("Erreur lors de la récupération des commandes:", e);
        setError(
          `Échec du chargement des commandes : ${e.message}. Veuillez vérifier les clés API ou l'ID du client.`
        );
      } finally {
        setLoading(false);
      }
    }; // 🔑 C'est le changement crucial : inclure 'customerId' dans le tableau de dépendances

    fetchOrders();
  }, [customerId]); // 👈 Le useEffect se réexécutera si 'customerId' change. // --- Rendu du composant (inchangé) ---

  if (loading) {
    return <div>Chargement des commandes...</div>;
  }

  if (error) {
    return <div> Erreur: {error}</div>;
  }

  if (orders.length === 0) {
    return <div>Aucune commande trouvée pour le client ID: {customerId}.</div>;
  }

  return (
    <div className="orders-page">
      <h1>Vos commandes (Client ID: {customerId})</h1>
      {orders.map((order) => (
        <div className="border border-dark mb-4" key={order.id}>
          <h2>
            Commande #{order.id} - Statut:
            <span> {order.status}</span>
          </h2>

          <p>Date: {new Date(order.date_created).toLocaleDateString()}</p>
          <p>
            Total:
            <strong>
              {order.total} {order.currency}
            </strong>
          </p>
          <h3>Articles:</h3>
          <ul>
            {order.line_items.map((item) => (
              <li key={item.id}>
                &bull; {item.name} &mdash; Quantité: {item.quantity} &mdash;
                Prix unitaire: {item.subtotal}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default Orders;
