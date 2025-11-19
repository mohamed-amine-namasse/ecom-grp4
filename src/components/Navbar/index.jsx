// src/components/Navbar.jsx

import React from "react";
import "./style.css";

function Navbar({ onBackToList }) {
  // Fonction pour gérer le clic sur le logo/titre
  const handleLogoClick = (e) => {
    e.preventDefault(); // Empêche le rechargement standard de la page
    if (onBackToList) {
      onBackToList(); // Utilise la fonction passée par App.js pour revenir à la liste
    } else {
      // Option de secours si onBackToList n'est pas passé
      console.log("Navigation vers l'accueil (Blog List)");
    }
  };

  return (
    <header className="navbar-container">
      <nav className="navbar">
        {/* Logo ou Titre du Blog */}
        <a href="/" onClick={handleLogoClick} className="navbar-brand">
          Mon Blog WP
        </a>

        {/* Liens de Navigation */}
        <ul className="navbar-links">
          <li>
            {/* Ce lien utilise la même fonction de retour pour s'assurer que vous êtes sur la liste */}
            <a href="/" onClick={handleLogoClick}>
              Accueil
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Navbar;
