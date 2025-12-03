import React, { useState, useEffect } from "react";
import { updateUserPublic, validateStoredToken } from "../../components/Api";
import "./style.css";

function Profile() {
  const [form, setForm] = useState({
    user_display_name: "",
    user_email: "",
  });

  const [message, setMessage] = useState(null);

  useEffect(() => {
    // Récupérer les données stockées
    const storedData = localStorage.getItem("JWT Token:");

    if (!storedData) {
      setMessage({ type: "error", text: "Vous devez être connecté." });
      return;
    }
    if (storedData) {
      validateStoredToken()
        .then(() => {
          console.log("Token valide");
        })
        .catch((err) => {
          console.error("Token invalide:", err);
          setMessage({ type: "error", text: "Token invalide. Veuillez vous reconnecter." });
        });
    }

    try {
      const user = JSON.parse(storedData); // Contient tout ton data

      setForm({
        user_display_name: user.user_display_name || "",
        user_email: user.user_email || "",
      });
    } catch (err) {
      console.error("Erreur parsing JSON:", err);
      setMessage({ type: "error", text: "Erreur lors du chargement du profil." });
    }
  }, []);

  return (
    <div className="form">
      <h1>Page de Profil</h1>

      {message && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

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
    </div>
  );
}

export default Profile;
