import React, { useState } from "react";
import "./style.css";

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ⚠️ TRÈS IMPORTANT : Configurez ces variables
  const WORDPRESS_URL =
    "https://mohamed-amine-namasse.students-laplateforme.io/wordpress-eco/wordpress/";
  const FORM_ID = 371;

  // Endpoint de l'API REST de Contact Form 7
  const CF7_ENDPOINT = `${WORDPRESS_URL}/wp-json/contact-form-7/v1/contact-forms/${FORM_ID}/feedback`;

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function validEmail(email) {
    // Regex simple pour la validation d'email
    return /\S+@\S+\.\S+/.test(email);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // 1. Validation de base côté client
    if (isLoading) return;
    if (!form.name.trim()) return setStatus("Veuillez indiquer votre nom.");
    if (!validEmail(form.email)) return setStatus("Email invalide.");
    if (!form.message.trim()) return setStatus("Veuillez écrire un message.");

    // 2. Préparation et envoi
    setIsLoading(true);
    setStatus("Envoi en cours…");

    // CF7 attend une soumission de formulaire classique, pas du JSON, donc on utilise FormData
    const formData = new FormData();

    // Les clés doivent correspondre aux noms des champs de votre formulaire CF7 (par défaut)
    formData.append("your-name", form.name);
    formData.append("your-email", form.email);
    formData.append("your-message", form.message);

    // 🚨 AJOUT DE LA BALISE D'UNITÉ : Nécessaire pour éviter l'erreur "aucune balise d’unité valide"
    // Le format est généralement 'wpcf7-f[ID_du_form]-p0-o1'
    formData.append("_wpcf7_unit_tag", `wpcf7-f${FORM_ID}-p0-o1`);

    // Ajout des autres champs de sécurité requis par CF7
    formData.append("_wpcf7_form_scan_tests", "");
    formData.append("_wpcf7_submit", "1");

    try {
      const response = await fetch(CF7_ENDPOINT, {
        method: "POST",
        // Important: Ne pas définir Content-Type. 'fetch' le gère automatiquement avec FormData.
        body: formData,
      });

      const result = await response.json(); // Réponse de CF7

      if (result.status === "mail_sent") {
        // Succès
        setStatus("✅ Merci, votre message a bien été envoyé !");
        setForm({ name: "", email: "", message: "" }); // Réinitialisation
      } else if (result.status === "validation_failed") {
        // Erreur de validation du serveur CF7
        const errorMessages = result.invalid_fields
          .map((field) => field.message)
          .join(" ; ");
        setStatus(`❌ Erreur de validation du serveur : ${errorMessages}`);
      } else {
        // Échec général (mail_failed, spam, etc.)
        setStatus(
          `❌ Échec de l'envoi : ${
            result.message || "Vérifiez les logs de votre serveur/CF7."
          }`
        );
      }
    } catch (error) {
      console.error("Erreur de connexion:", error);
      setStatus("❌ Erreur réseau. Impossible de contacter le serveur.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="contact-page">
      <form className="contact-card" onSubmit={handleSubmit} noValidate>
        <h1>Contact</h1>

        <label>
          Nom
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            disabled={isLoading}
          />
        </label>

        <label>
          Email
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            disabled={isLoading}
          />
        </label>

        <label>
          Message
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            rows="5"
            disabled={isLoading}
          />
        </label>

        <div className="actions">
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Envoi..." : "Envoyer"}
          </button>
        </div>

        {/* Affichage du statut avec classes CSS pour stylisation */}
        {status && (
          <p
            className={`status ${
              status.startsWith("❌")
                ? "error"
                : status.startsWith("✅")
                ? "success"
                : ""
            }`}
          >
            {status}
          </p>
        )}
      </form>
    </main>
  );
}

export default Contact;
