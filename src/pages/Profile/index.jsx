import React, { useState, useEffect } from "react";
// Assurez-vous que le chemin vers Api et AuthContext est correct
import { validateStoredToken } from "../../components/Api";
import { useAuth } from "../../components/AuthContext";
// 🎯 Importez useMatch pour détecter la sous-route
import { useMatch } from "react-router-dom";
// 🎯 Importez le composant Orders
import Orders from "./orders";

function Profile() {
  // Récupération des données d'authentification
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [form, setForm] = useState({
    user_display_name: "",
    user_email: "",
  });

  const [message, setMessage] = useState(null);
  const [localLoading, setLocalLoading] = useState(true);

  // 🔑 Détection de la route /profile/orders/:customerId
  const isOrdersRoute = useMatch("/profile/orders/:customerId");
  const userEmail = user ? user.email : null;

  // ----------------------------------------------------------
  // 🔥 Chargement des données utilisateur (readonly)
  // ----------------------------------------------------------
  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated && user && user.id) {
        // Remplir formulaire READ ONLY
        setForm({
          user_display_name: user.username || "",
          user_email: user.email || "",
        });

        // Vérifier le token
        validateStoredToken()
          .then(() => setMessage(null))
          .catch(() => {
            setMessage({
              type: "error",
              text: "Session expirée. Veuillez vous reconnecter.",
            });
          });
      } else {
        setMessage({
          type: "error",
          text: "Vous devez être connecté pour accéder à cette page.",
        });
      }

      setLocalLoading(false);
    }
  }, [authLoading, isAuthenticated, user]);

  // ----------------------------------------------------------
  // CHARGEMENT
  // ----------------------------------------------------------
  if (authLoading || localLoading) {
    return <div className="page-wrapper">Chargement du profil...</div>;
  }

  // ----------------------------------------------------------
  // ERREUR NON CONNECTÉ
  // ----------------------------------------------------------
  if (message && message.type === "error" && !isAuthenticated) {
    return (
      <div className="page-wrapper">
        <div className="alert alert-error">{message.text}</div>
      </div>
    );
  }

  // ----------------------------------------------------------
  // ROUTE COMMANDES
  // ----------------------------------------------------------
  if (isOrdersRoute) {
    const isEmailReady =
      isAuthenticated && userEmail && userEmail.trim() !== "";

    if (!isEmailReady) {
      return (
        <div className="page-wrapper">
          <div className="alert alert-error">
            Accès refusé. L'e-mail de session est introuvable. Veuillez vous
            reconnecter.
          </div>
        </div>
      );
    }

    return <Orders userEmail={userEmail} />;
  }

  // ----------------------------------------------------------
  // PAGE PROFIL (READ ONLY)
  // ----------------------------------------------------------
  return (
    <div className="page-wrapper">
      {/* MENU LATÉRAL */}
      <div className="side-menu">
        <h2>Menu</h2>
        <ul>
          <li>
            <a href="/profile/update">Modification du profil</a>
          </li>
          <li>
            {user && user.id ? (
              <a href={`/profile/orders/0`}>
                Commandes (ID Client: {user.id})
              </a>
            ) : (
              <span className="disabled-link">Commandes</span>
            )}
          </li>
        </ul>
      </div>

      {/* 📝 FORMULAIRE READ ONLY */}
      <div className="form">
        <h1>Mon Profil</h1>

        {message && message.type !== "error" && (
          <div className={`alert alert-${message.type}`}>{message.text}</div>
        )}

        {user && (
          <form>
            <div className="form-group">
              <label>Nom d'utilisateur</label>
              <input
                name="user_display_name"
                value={form.user_display_name}
                readOnly
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                name="user_email"
                type="email"
                value={form.user_email}
                readOnly
              />
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Profile;

