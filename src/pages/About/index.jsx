import React from "react";
import "../Contact/style.css";

function About() {
  return (
    <main className="contact-page">
      <section className="contact-card">
        <h1>À propos · Football Market</h1>

        <p className="lead">
          Football Market est une boutique dédiée aux crampons de football pour
          les joueuses. Notre objectif : proposer des modèles performants,
          confortables et pensés pour le jeu féminin.
        </p>

        <div className="content">
          <h2>Notre mission</h2>
          <p>
            Offrir un choix expert de crampons adaptés aux besoins des
            footballeuses — du loisir à la compétition — avec des conseils
            simples et un service attentionné.
          </p>

          <h2>Ce que nous proposons</h2>
          <ul>
            <li>Crampons sélectionnés pour performance et confort</li>
            <li>Tailles et coupes étudiées pour morphologies féminines</li>
            <li>Conseils d'entretien et guides de choix clairs</li>
            <li>Livraison rapide et retours faciles</li>
          </ul>

          <h2>Contact</h2>
          <p className="muted">
            Une question ? <a href="/contact">Contactez-nous</a>.
          </p>

          <div className="actions">
            <a href="/products" className="btn">
              Découvrir les crampons
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

export default About;
