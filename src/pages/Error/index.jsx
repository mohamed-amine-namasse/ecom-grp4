import React from "react";
import { Link } from "react-router";
import "../Contact/style.css";

function Error() {
  return (
    <main className="contact-page">
      <section className="contact-card" style={{ textAlign: "center" }}>
        <h1>404 — Page introuvable</h1>
        <p className="lead">
          Oops — la page demandée n'existe pas ou a été déplacée.
        </p>

        <div className="actions" style={{ justifyContent: "center", gap: 10 }}>
          <Link to="/about" className="btn">
            À propos
          </Link>
          <Link to="/contact" className="btn">
            Contact
          </Link>
        </div>

        <p className="status" style={{ marginTop: 14 }}>
          Retournez à{" "}
          <Link
            to="/"
            style={{ color: "inherit", textDecoration: "underline" }}
          >
            l'accueil
          </Link>
          .
        </p>
      </section>
    </main>
  );
}

export default Error;
