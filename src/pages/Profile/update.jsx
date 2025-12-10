import React, { useState, useEffect } from "react";
import {
  validateStoredToken,
  fetchWordPressUserId,
} from "../../components/Api";
import "./style.css";
const WP_BASE =
  "https://mohamed-amine-namasse.students-laplateforme.io/wordpress-eco/wordpress/wp-json";

function Update() {
  const [form, setForm] = useState({ nom: "", prenom: "", email: "" });
  const [status, setStatus] = useState("");
  const [editingPassword, setEditingPassword] = useState(false);
  const [pw, setPw] = useState({ newPassword: "", confirmPassword: "" });
  const [token, setToken] = useState("");
  const [userId, setUserId] = useState(null);

  // --------------------------------------------------------
  //  Charger infos utilisateur au chargement de la page
  // --------------------------------------------------------
  useEffect(() => {
    async function loadUser() {
      try {
        const validation = await validateStoredToken();
        const stored = JSON.parse(localStorage.getItem("JWT Token:"));
        const t = stored.token;

        setToken(t);

        const id = await fetchWordPressUserId(t);
        setUserId(id);

        const res = await fetch(`${WP_BASE}/wp/v2/users/${id}`, {
          headers: { Authorization: `Bearer ${t}` },
        });
        const data = await res.json();

        setForm({
          nom: data.last_name || "",
          prenom: data.first_name || "",
          email: data.email || "",
        });
      } catch (err) {
        setStatus("Erreur chargement du profil");
        console.error(err);
      }
    }

    loadUser();
  }, []);

  // --------------------------------------------------------
  // Update champs texte
  // --------------------------------------------------------
  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handlePwChange(e) {
    setPw((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  function validEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
  }

  // --------------------------------------------------------
  //  Sauvegarde des données utilisateur WP
  // --------------------------------------------------------
  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.nom.trim()) return setStatus("Veuillez indiquer votre nom.");
    if (!form.prenom.trim())
      return setStatus("Veuillez indiquer votre prénom.");
    if (!validEmail(form.email)) return setStatus("Email invalide.");

    setStatus("Mise à jour…");

    try {
      const res = await fetch(`${WP_BASE}/wp/v2/users/${userId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: form.prenom,
          last_name: form.nom,
          email: form.email,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setStatus("Profil mis à jour !");
      setTimeout(() => setStatus(""), 2000);
    } catch (err) {
      console.error(err);
      setStatus("Erreur mise à jour du profil");
    }
  }

  // --------------------------------------------------------
  //  Update du mot de passe WP
  // --------------------------------------------------------
  async function handlePasswordSave(e) {
    e.preventDefault();

    if (pw.newPassword.length < 8)
      return setStatus("Le mot de passe doit contenir au moins 8 caractères.");
    if (pw.newPassword !== pw.confirmPassword)
      return setStatus("Les mots de passe ne correspondent pas.");

    setStatus("Mise à jour du mot de passe…");

    try {
      const res = await fetch(`${WP_BASE}/wp/v2/users/${userId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: pw.newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setStatus("Mot de passe mis à jour !");
      setPw({ newPassword: "", confirmPassword: "" });
      setEditingPassword(false);
      setTimeout(() => setStatus(""), 2000);
    } catch (err) {
      console.error(err);
      setStatus("Erreur mise à jour du mot de passe");
    }
  }

  // --------------------------------------------------------
  // Rendu
  // --------------------------------------------------------
  return (
    <main className="contact-page">
      <form className="contact-card" onSubmit={handleSubmit} noValidate>
        <h1>Mon profil</h1>

        <label>
          Nom
          <input name="nom" value={form.nom} onChange={handleChange} />
        </label>

        <label>
          Prénom
          <input name="prenom" value={form.prenom} onChange={handleChange} />
        </label>

        <label>
          Email
          <input name="email" value={form.email} onChange={handleChange} />
        </label>

        {/* PASSWORD */}
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          Mot de passe
          <input
            type="password"
            disabled
            placeholder="••••••••"
            style={{ flex: 1 }}
          />
          <button
            type="button"
            className="btn"
            onClick={() => {
              setEditingPassword((s) => !s);
              setStatus("");
            }}
          >
            {editingPassword ? "Annuler" : "Modifier le mot de passe"}
          </button>
        </label>

        {editingPassword && (
          <div style={{ marginTop: 8 }}>
            <label>
              Nouveau mot de passe
              <input
                type="password"
                name="newPassword"
                value={pw.newPassword}
                onChange={handlePwChange}
              />
            </label>

            <label>
              Confirmer le mot de passe
              <input
                type="password"
                name="confirmPassword"
                value={pw.confirmPassword}
                onChange={handlePwChange}
              />
            </label>

            <div className="actions" style={{ marginTop: 8 }}>
              <button
                type="button"
                className="btn"
                onClick={handlePasswordSave}
              >
                Sauvegarder le mot de passe
              </button>
            </div>
          </div>
        )}

        <div className="actions" style={{ marginTop: 12 }}>
          <button type="submit" className="btn">
            Enregistrer
          </button>
        </div>

        {status && <p className="status">{status}</p>}
      </form>
    </main>
  );
}

export default Update;
