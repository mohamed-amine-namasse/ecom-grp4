import React, { useState, useEffect } from "react";
import { updateUserPublic, validateStoredToken } from "../../components/Api";
import "./style.css";

function Update() {
  const [form, setForm] = useState({
    user_display_name: "",
    user_email: "",
  });

  const [message, setMessage] = useState(null);

  useEffect(() => {
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
          setMessage({
            type: "error",
            text: "Token invalide. Veuillez vous reconnecter.",
          });
        });
    }

    try {
      const user = JSON.parse(storedData);

      setForm({
        user_display_name: user.user_display_name || "",
        user_email: user.user_email || "",
      });
    } catch (err) {
      console.error("Erreur parsing JSON:", err);
      setMessage({
        type: "error",
        text: "Erreur lors du chargement du profil.",
      });
    }
  }, []);

  return (
    <div className="page-wrapper">

      {/* MENU LATÉRAL */}
      <div className="side-menu">
        <h2>Menu</h2>
        <ul>
          <li><a href="/update">Modification du profil</a></li>
          <li><a href="/orders">Commandes</a></li>
          <li><a href="/support">Support</a></li>
          <li><a href="/logout">Déconnexion</a></li>
        </ul>
      </div>
      
      <div className="form">
        <h1>Modification du Profile</h1>

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
    </div>
  );
}

export default Update;