import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useNavigate } from "react-router";

// ⚠️ ASSUREZ-VOUS QUE LES CHEMINS CI-DESSOUS SONT CORRECTS
import { loginUser } from "../../components/Api";
import { useAuth } from "../../components/AuthContext";
import { setAuthDataState } from "../../components/NavScrollExample";

import "./style.css";

// ----------------------------------------------------------------------
// --- DONNÉES DE SIMULATION (GARDER POUR DEBUG SEULEMENT) ---
// ----------------------------------------------------------------------
const mockLoginData = {
  token:
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL21vaGFtZWQtYW1pbmUtbmFtYXNzZS5zdHVkZW50cy1sYXBsYXRlZm9ybWUuaW8vd29yZHByZXNzLWVjby93b3JkcHJlc3MiLCJpYXQiOjE3NjQ5MjQ0MTQsIm5iZiI6MTc2NDkyNDQxNCwiZXhwIjoxNzY1NTI5MjE0LCJkYXRhIjp7InVzZXIiOnsiaWQiOiIzMyJ9fX0.yEVa9owL6rvC7brNqv7guENi0YZAIgdIpvlk6mgygYc",
  user_email: "mock.user@yahoo.com",
  user_nicename: "mockuser",
  user_display_name: "Mock User",
  customerId: 33,
};

/**
 * Composant de la page de connexion, gérant la soumission du formulaire et la mise à jour de l'état.
 */
const Login = () => {
  // Hooks React
  const navigate = useNavigate();
  const { login } = useAuth();

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
      setMessage({ type: "danger", text: validationError });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // 1. Appel de l'API avec les données du formulaire
      const apiData = await loginUser(form.username, form.password);

      // ⚠️ Pour utiliser l'API réelle, la ligne ci-dessous DOIT ÊTRE COMMENTÉE OU SUPPRIMÉE.
      // const apiData = mockLoginData;

      // 2. Normalisation des données pour le Contexte
      // Cette étape adapte la structure de l'objet API aux besoins de votre application (Profile.jsx).
      const normalizedUser = {
        token: apiData.token,
        // Ces clés doivent être celles que Profile.jsx attend (username, email, id)
        username: apiData.user_display_name || apiData.user_nicename,
        email: apiData.user_email,
        id: apiData.customerId,
      };

      // 3. Mise à jour du Contexte Global
      login(normalizedUser);

      // 4. Mise à jour de la Navbar (mécanisme custom)
      setAuthDataState(normalizedUser); // Mise à jour explicite du Local Storage pour la navbar
      window.dispatchEvent(new Event("storageUpdate"));

      setMessage({
        type: "success",
        text: "Connexion réussie. Redirection en cours...",
      });

      // 5. Redirection
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err) {
      console.error("Erreur de connexion:", err);
      let text = "Erreur de connexion inconnue.";
      if (err.response) {
        text = err.response.data?.message || JSON.stringify(err.response.data);
      } else if (err.request) {
        text = "Impossible de contacter le serveur. Vérifiez la connexion.";
      } else if (err.message) {
        text = err.message;
      }
      setMessage({ type: "danger", text });
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------------------------
  // --- RENDU ---
  // ----------------------------------------------------------------------

  return (
    <div className="form">
      <h1>Connexion</h1>
      {/* Affichage des messages d'erreur ou de succès */}
      {message && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      <Form onSubmit={onSubmit}>
        <Form.Group className="form-group">
          <Form.Control
            name="username"
            placeholder="Nom d'utilisateur ou email"
            value={form.username}
            onChange={onChange}
            required
          />
        </Form.Group>
        <Form.Group className="form-group">
          <Form.Control
            name="password"
            type="password"
            placeholder="Mot de passe"
            value={form.password}
            onChange={onChange}
            required
          />
        </Form.Group>
        <Button
          type="submit"
          disabled={loading}
          variant="primary"
          className="w-100 mt-3"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </Button>
      </Form>
    </div>
  );
};

export default Login;
