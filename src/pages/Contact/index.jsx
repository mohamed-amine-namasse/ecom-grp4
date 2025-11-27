import React, { useState } from "react";
import "./style.css";

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function validEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return setStatus("Veuillez indiquer votre nom.");
    if (!validEmail(form.email)) return setStatus("Email invalide.");
    if (!form.message.trim()) return setStatus("Veuillez écrire un message.");

    // Simule envoi
    setStatus("Envoi…");
    setTimeout(() => {
      setStatus("Merci, votre message a bien été envoyé !");
      setForm({ name: "", email: "", message: "" });
    }, 800);
  }

  return (
    <main className="contact-page">
      <form className="contact-card" onSubmit={handleSubmit} noValidate>
        <h1>Contact</h1>

        <label>
          Nom
          <input name="name" value={form.name} onChange={handleChange} />
        </label>

        <label>
          Email
          <input name="email" value={form.email} onChange={handleChange} />
        </label>

        <label>
          Message
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            rows="5"
          />
        </label>

        <div className="actions">
          <button type="submit">Envoyer</button>
        </div>

        {status && <p className="status">{status}</p>}
      </form>
    </main>
  );
}

export default Contact;
