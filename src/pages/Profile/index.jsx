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
  // L'email peut être null si user est null
  const userEmail = user ? user.email : null;

  useEffect(() => {
    // 1. Attendre que le contexte d'authentification ait fini sa vérification initiale
    if (!authLoading) {
      // 2. Vérifier si l'utilisateur est connecté ET si l'ID Client WooCommerce est disponible
      if (isAuthenticated && user && user.id) {
        setForm({
          user_display_name: user.username || "",
          user_email: user.email || "",
        }); // Validation du token (Optionnel)

        validateStoredToken()
          // ... (reste du useEffect inchangé)
          .catch((err) => {
            console.error("Token invalide:", err);
            setMessage({
              type: "error",
              text: "Session expirée. Veuillez vous reconnecter.",
            });
          });
      } else {
        // CAS ÉCHEC : Utilisateur non connecté après vérification
        setMessage({
          type: "error",
          text: "Vous devez être connecté pour accéder à cette page.",
        });
      } // Mettre fin au chargement local une fois que le contexte est stable

      setLocalLoading(false);
    }
  }, [authLoading, isAuthenticated, user]); // Afficher un message de chargement tant que le contexte ou le chargement local est actif

  if (authLoading || localLoading) {
    return <div className="page-wrapper">Chargement du profil...</div>;
  } // Afficher un message d'erreur si non connecté

  if (message && message.type === "error" && !isAuthenticated) {
    return (
      <div className="page-wrapper">
        <div className={`alert alert-error`}>{message.text}</div>
      </div>
    );
  }

  // 🔑 LOGIQUE CRITIQUE DE RENDU DE LA PAGE COMMANDES
  if (isOrdersRoute) {
    // 1. Vérifie si l'utilisateur est authentifié ET si l'e-mail est une chaîne non vide
    const isEmailReady =
      isAuthenticated && userEmail && userEmail.trim() !== "";

    if (!isEmailReady) {
      // 2. Si l'e-mail n'est pas prêt, on affiche un message d'erreur strict
      return (
        <div className="page-wrapper">
          <div className={`alert alert-error`}>
            Accès refusé. L'e-mail de session est introuvable. Veuillez vous
            reconnecter.
          </div>
        </div>
      );
    }

    // 3. Si tout est OK, on rend Orders en passant l'email VALIDE
    return <Orders userEmail={userEmail} />;
  }

  return (
    <div className="page-wrapper">
      <div className="side-menu">
        <h2>Menu</h2>
        <ul>
          <li>
            <a href="/profile/update">Modification du profil</a>
          </li>
          <li>
            {user && user.id ? (
              <a href={`/profile/orders/0`}>Commandes (ID Client: {user.id})</a>
            ) : (
              <span className="disabled-link" title="ID client non disponible">
                Commandes
              </span>
            )}
          </li>
        </ul>
      </div>

      <h1>Page de Profil</h1>
    </div>
  );
}

export default Profile;
