import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import { API_CONFIG } from "../../config/api_orders";
import "./orders.css";

// Fonction utilitaire pour obtenir la classe de statut
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

// Le composant reçoit l'email de l'utilisateur connecté via props
const Orders = ({ userEmail }) => {
  const { customerId } = useParams(); // Récupère le 'customerId' de l'URL

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);

      // VÉRIFICATION : L'email doit être présent pour le filtre
      if (!userEmail) {
        setLoading(false);
        setError(
          "Erreur de session: L'e-mail de l'utilisateur est manquant. Veuillez vous reconnecter.",
        );
        return;
      }

      // Génération de l'URL via le helper ORDERS_API_CONFIG
      const ordersApiUrl = ORDERS_API_CONFIG.getOrdersUrl(customerId ?? 0);

      try {
        const response = await fetch(ordersApiUrl);

        if (!response.ok) {
          const errorBody = await response.json();
          throw new Error(
            `Erreur HTTP! Statut: ${response.status}. Message: ${
              errorBody.message || "Non spécifié"
            }`,
          );
        }

        const data = await response.json();

        // --- FILTRE CÔTÉ CLIENT (PAR EMAIL) ---
        const filteredOrders = data.filter((order) => {
          const orderEmail = order.billing?.email?.toLowerCase();
          const connectedEmail = userEmail.toLowerCase();

          // Masque la commande si les emails ne correspondent pas
          return orderEmail === connectedEmail;
        });

        setOrders(filteredOrders);
      } catch (e) {
        console.error("Erreur lors de la récupération des commandes:", e);
        setError(
          `Échec du chargement des commandes : ${e.message}. Vérifiez les clés API ou si l'utilisateur ${userEmail} a des commandes.`,
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userEmail, customerId]);

  // --- Rendu des états de chargement/erreur/vide ---
  if (loading) {
    return (
      <div className="orders-page">
        <div>Chargement des commandes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-page">
        <div style={{ color: "red" }}> Erreur: {error}</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders-page">
        <div>Aucune commande trouvée pour l'e-mail : {userEmail}.</div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <h1>Vos commandes</h1>

      {orders.map((order) => (
        <div className="order-box" key={order.id}>
          <h2>
            Commande #{order.id} -{" "}
            <span className={`status-tag ${getStatusClass(order.status)}`}>
              {order.status}
            </span>
          </h2>

          <p>
            Client :{" "}
            <strong>
              {order.billing.first_name} {order.billing.last_name} (
              {order.billing.email})
            </strong>
          </p>

          <div className="order-details">
            <p>
              <span>Date:</span>{" "}
              <span>{new Date(order.date_created).toLocaleDateString()}</span>
            </p>
            <p>
              <span>Total:</span>{" "}
              <strong>
                {order.total} {order.currency}
              </strong>
            </p>
          </div>

          <h3>Articles:</h3>
          <ul className="item-list">
            {order.line_items.map((item) => (
              <li key={item.id}>
                &bull; <strong>{item.name}</strong> &mdash; Quantité:{" "}
                {item.quantity} &mdash; Prix unitaire: {item.subtotal}{" "}
                {order.currency}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default Orders;
