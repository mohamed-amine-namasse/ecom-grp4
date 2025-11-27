import React, { useState } from "react";
import "./style.css";

function Profil() {
  const [form, setForm] = useState({ nom: "", prenom: "", email: "" });
  const [status, setStatus] = useState("");
  const [editingPassword, setEditingPassword] = useState(false);
  const [pw, setPw] = useState({ newPassword: "", confirmPassword: "" });

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handlePwChange(e) {
    setPw((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  function validEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.nom.trim()) return setStatus("Veuillez indiquer votre nom.");
    if (!form.prenom.trim()) return setStatus("Veuillez indiquer votre prénom.");
    if (!validEmail(form.email)) return setStatus("Email invalide.");
    setStatus("Enregistrement…");
    setTimeout(() => {
      setStatus("Profil enregistré.");
      setTimeout(() => setStatus(""), 2000);
    }, 700);
  }

  function handlePasswordSave(e) {
    e.preventDefault();
    if (pw.newPassword.length < 6)
      return setStatus("Le mot de passe doit contenir au moins 6 caractères.");
    if (pw.newPassword !== pw.confirmPassword)
      return setStatus("Les mots de passe ne correspondent pas.");
    setStatus("Mise à jour du mot de passe…");
    setTimeout(() => {
      setStatus("Mot de passe mis à jour.");
      setPw({ newPassword: "", confirmPassword: "" });
      setEditingPassword(false);
      setTimeout(() => setStatus(""), 2000);
    }, 700);
  }

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

        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          Mot de passe
          <input
            type="password"
            name="password"
            value=""
            placeholder="••••••••"
            disabled
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
              <button type="button" className="btn" onClick={handlePasswordSave}>
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

export default Profil;