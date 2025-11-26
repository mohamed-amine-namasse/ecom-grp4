import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../components/Api";
import "./style.css";

function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    if (!form.username || !form.password) return "Tous les champs sont requis.";
    return null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) {
      setMessage({ type: "error", text: v });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const data = await loginUser(form.username, form.password);
      setMessage({
        type: "success",
        text: data?.message || "Connexion réussie.",
      });

      // Stocker les données utilisateur
      localStorage.setItem("user_id", data.user_id);
      localStorage.setItem("username", data.username);
      localStorage.setItem("email", data.email);

      // Redirection vers Shop après 1 seconde
      setTimeout(() => {
        navigate("/shop");
      }, 1000);

      setForm({ username: "", password: "" });
    } catch (err) {
      console.error(err);
      let text = "Erreur de connexion";
      if (err.response) {
        const d = err.response.data;
        text = d?.message || (typeof d === "string" ? d : JSON.stringify(d));
      } else if (err.request) {
        text =
          "Impossible de contacter le serveur. Vérifie l'URL de l'API, la configuration CORS et ta connexion.";
      } else {
        text = err.message;
      }
      setMessage({ type: "error", text });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form">
      <h1>Connexion</h1>
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
        <button type="submit" disabled={loading}>
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </div>
  );
}

export default Login;
