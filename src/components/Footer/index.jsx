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
            <h3>A propos</h3>
            <nav className="links">
              <a href="#">Web design</a>
              <a href="#">Development</a>
              <a href="#">Hosting</a>
            </nav>
          </div>
          <div>
            <h3>La boutique</h3>
            <nav className="links">
              <a href="#">Company</a>
              <a href="#">Team</a>
              <a href="#">Careers</a>
            </nav>
          </div>
          <div>
            <h3>Besoin d'aide </h3>
            <nav className="links">
              <a href="#">Awards</a>
              <a href="#">Method</a>
              <a href="#">Contact</a>
            </nav>
          </div>
        </div>
        <hr className="hr_milieu"></hr>
        <p>
          &copy; {currentYear} Mon Blog WordPress / React. Tous droits
          réservées.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
