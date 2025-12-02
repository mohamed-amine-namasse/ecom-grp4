import React, { useState, useEffect } from "react";
import { updateUserPublic, getUser } from "../../components/Api";
import "./style.css";

function Profile() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // 🔥 Charger les données utilisateur dès l’arrivée sur la page
  useEffect(() => {
    (async () => {
      const user = await getUser();

      if (!user) {
        setMessage({ type: "error", text: "Vous devez être connecté." });
        return;
      }

      setForm((prev) => ({
        ...prev,
        username: user.username || "",
        email: user.email || ""
      }));

    })();
  }, []);

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    if (!form.username || !form.email)
      return "Tous les champs sont requis.";

    if (form.password && form.password !== form.confirm_password)
      return "Les mots de passe ne correspondent pas.";

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
      const res = await ({
        username: form.username,
        email: form.email,
        password: form.password || null
      });

      setMessage({ type: "success", text: "Profil mis à jour avec succès." });


      localStorage.setItem("username", form.username);
      localStorage.setItem("email", form.email);

    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: "Erreur de mise à jour du profil."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form">
      <h1>Page de Profil</h1>

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
            placeholder="Nouveau mot de passe (optionnel)"
            value={form.password}
            onChange={onChange}
          />
        </div>

        <div className="form-group">
          <input
            name="confirm_password"
            type="password"
            placeholder="Confirmer le mot de passe"
            value={form.confirm_password}
            onChange={onChange}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Envoi..." : "Mettre à jour le profil"}
        </button>
      </form>
    </div>
  );
}

export default Profile;

