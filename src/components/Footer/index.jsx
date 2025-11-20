// src/components/Footer.jsx

import React from "react";
import "./style.css";

function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="container">
          <div>
            <h5>A propos</h5>
            <nav className="links">
              <a href="#">Qui sommes-nous?</a>
              <a href="#">CGV/CGU</a>
            </nav>
          </div>
          <div>
            <h5>La boutique</h5>
            <nav className="links">
              <a href="#">La boutique</a>
            </nav>
          </div>
          <div>
            <h5>Besoin d'aide </h5>
            <nav className="links">
              <a href="#">Contact</a>
            </nav>
          </div>
        </div>
        <hr className="hr-milieu"></hr>
        <p>
          &copy; {currentYear} Mon Blog WordPress / React. Tous droits
          réservées.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
