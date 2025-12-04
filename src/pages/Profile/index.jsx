import React, { useState, useEffect } from "react";
// Assurez-vous que le chemin vers Api et AuthContext est correct
import { validateStoredToken } from "../../components/Api";
import { useAuth } from "../../components/AuthContext";

function Profile() {
  // Récupération des données d'authentification, de l'état du contexte et de l'état de chargement
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [form, setForm] = useState({
    user_display_name: "",
    user_email: "",
  });

  const [message, setMessage] = useState(null);
  const [localLoading, setLocalLoading] = useState(true);

  useEffect(() => {
    // 1. Attendre que le contexte d'authentification ait fini sa vérification initiale
    if (!authLoading) {
      // 2. Vérifier si l'utilisateur est connecté ET si l'ID Client WooCommerce est disponible (grâce à Api.js)
      if (isAuthenticated && user && user.id) {
        setForm({
          user_display_name: user.username || "",
          user_email: user.email || "",
        });

        // Validation du token (Optionnel)
        validateStoredToken()
          .then(() => {
            setMessage(null);
          })
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
      }

      // Mettre fin au chargement local une fois que le contexte est stable
      setLocalLoading(false);
    }
  }, [authLoading, isAuthenticated, user]);

  // Afficher un message de chargement tant que le contexte ou le chargement local est actif
  if (authLoading || localLoading) {
    return <div className="page-wrapper">Chargement du profil...</div>;
  }

  // Afficher un message d'erreur si non connecté
  if (message && message.type === "error" && !isAuthenticated) {
    return (
      <div className="page-wrapper">
        <div className={`alert alert-error`}>{message.text}</div>
      </div>
    );
  }

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
            {/* 🎯 CHEMIN CORRECT : user.id contient maintenant l'ID Client WooCommerce réel */}
            {user && user.id ? (
              <a href={`/profile/orders/${user.id}`}>
                Commandes (ID Client: {user.id})
              </a>
            ) : (
              // Afficher un lien désactivé si l'ID n'est pas prêt
              <span className="disabled-link" title="ID client non disponible">
                Commandes
              </span>
            )}
          </li>
        </ul>
      </div>

      <div className="form">
        <h1>Page de Profil</h1>

        {message && message.type !== "error" && (
          <div className={`alert alert-${message.type}`}>{message.text}</div>
        )}

        {/* Afficher le formulaire uniquement si l'utilisateur est chargé */}
        {user && (
          <form>
            <div className="form-group">
              <input
                name="user_display_name"
                placeholder="Nom d'utilisateur"
                value={form.user_display_name}
                readOnly
              />
            </div>

            <div className="form-group">
              <input
                name="user_email"
                type="email"
                placeholder="Email"
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
