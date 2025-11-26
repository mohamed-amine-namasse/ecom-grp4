import React, { useState } from "react";
import { registerUserPublic } from "../../components/Api";
import "./style.css";

function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    if (
      !form.username ||
      !form.email ||
      !form.password ||
      !form.confirm_password
    ) {
      return "Tous les champs sont requis.";
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      return "Email invalide.";
    }
    if (form.password.length < 8) {
      return "Le mot de passe doit contenir au moins 8 caractères.";
    }
    if (form.password !== form.confirm_password) {
      return "Les mots de passe ne correspondent pas.";
    }
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
      const res = await registerUserPublic({
        username: form.username,
        email: form.email,
        password: form.password,
      });

      const successText = res?.message || "Inscription réussie !";
      setMessage({ type: "success", text: successText });
      setForm({ username: "", email: "", password: "", confirm_password: "" });
    } catch (err) {
      console.error(err);
      let text = "Erreur d'inscription";
      if (err.response) {
        const data = err.response.data;
        text =
          data?.message ||
          (typeof data === "string" ? data : JSON.stringify(data));
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
      <h1>Inscription</h1>
      {message && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <input
            name="username"
            placeholder="Nom d'utilisateur"
            value={form.username}
            onChange={onChange}
            required
          />
        </div>
        <div className="form-group">
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={onChange}
            required
          />
        </div>
        <div className="form-group">
          <input
            name="password"
            type="password"
            placeholder="Mot de passe (min 8 caractères)"
            value={form.password}
            onChange={onChange}
            required
          />
        </div>
        <div className="form-group">
          <input
            name="confirm_password"
            type="password"
            placeholder="Confirmer le mot de passe"
            value={form.confirm_password}
            onChange={onChange}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Envoi..." : "S'inscrire"}
        </button>
      </form>
    </div>
  );
}

export default Register;
