import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import { useNavigate } from "react-router-dom"; // Correction : Utiliser 'react-router-dom' pour useNavigate
// import { loginUser } from "../../components/Api"; // Décommenter si vous utilisez une API
// import { useAuth } from "../../components/AuthContext"; // Décommenter si vous utilisez un AuthContext
import { setAuthDataState } from "../../components/NavScrollExample";
import "./style.css";

// ----------------------------------------------------------------------
// --- DONNÉES DE SIMULATION ---
// ----------------------------------------------------------------------
const mockLoginData = {
  token:
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL21vaGFtZWQtYW1pbmUtbmFtYXNzZS5zdHVkZW50cy1sYXBsYXRlZm9ybWUuaW8vd29yZHByZXNzLWVjby93b3JkcHJlc3MiLCJpYXQiOjE3NjQ5MjQ0MTQsIm5iZiI6MTc2NDkyNDQxNCwiZXhwIjoxNzY1NTI5MjE0LCJkYXRhIjp7InVzZXIiOnsiaWQiOiIzMyJ9fX0.yEVa9owL6rvC7brNqv7guENi0YZAIgdIpvlk6mgygYc",
  user_email: "compte1@yahoo.com",
  user_nicename: "compte1",
  user_display_name: "compte1",
  customerId: 33,
};

/**
 * Composant de la page de connexion, gérant un formulaire de connexion réel.
 */
const LoginSimulator = () => {
  // Déclarations de Hooks au niveau supérieur du composant (CORRIGÉ)
  const navigate = useNavigate();
  // const { login } = useAuth(); // Décommenter si vous utilisez un AuthContext

  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // ----------------------------------------------------------------------
  // --- LOGIQUE DE GESTION DU FORMULAIRE ---
  // ----------------------------------------------------------------------

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    if (!form.username || !form.password) return "Tous les champs sont requis.";
    return null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setMessage({ type: "danger", text: validationError }); // Utiliser 'danger' pour Bootstrap
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // 1. Appel API réel (Décommenter et configurer si nécessaire)
      // const data = await loginUser(form.username, form.password);

      // *** ⚠️ SIMULATION API SANS VÉRITABLE APPEL ***
      // Utilisez mockLoginData pour simuler le succès
      const data = mockLoginData;
      // ---------------------------------------------

      // 2. Mise à jour du Local Storage pour la NavBar (intégration de notre logique)
      setAuthDataState(data);
      window.dispatchEvent(new Event("storageUpdate"));

      setMessage({
        type: "success",
        text: data?.message || "Connexion réussie.",
      });

      console.log("Connexion réussie. Redirection imminente.");

      // 3. Redirection après un court délai
      setTimeout(() => {
        navigate("/");
      }, 1000);

      setForm({ username: "", password: "" });
    } catch (err) {
      console.error("Erreur de connexion:", err);
      let text = "Erreur de connexion inconnue.";
      // Logique de gestion des erreurs (adaptée pour l'affichage)
      if (err.response) {
        text = err.response.data?.message || JSON.stringify(err.response.data);
      } else if (err.request) {
        text = "Impossible de contacter le serveur. Vérifiez la connexion.";
      } else if (err.message) {
        text = err.message;
      }
      setMessage({ type: "danger", text }); // Utiliser 'danger' pour Bootstrap
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------------------------
  // --- RENDU ---
  // ----------------------------------------------------------------------

  return (
    <div className="form">
      {" "}
      {/* Utiliser la classe container pour le style */}
      <h1>Connexion</h1>
      {/* Affichage des messages d'erreur ou de succès */}
      {message && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <input
            name="username"
            placeholder="Nom d'utilisateur ou email"
            value={form.username}
            onChange={onChange}
            required
          />
        </div>
        <div className="form-group">
          <input
            name="password"
            type="password"
            placeholder="Mot de passe"
            value={form.password}
            onChange={onChange}
            required
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Connexion..." : "Se connecter"}
        </Button>
      </form>
    </div>
  );
};

export default LoginSimulator;
