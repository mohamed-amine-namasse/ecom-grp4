// src/components/Footer.jsx

import React from "react";
import "./style.css";

function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <p>
          &copy; {currentYear} Mon Blog WordPress / React. Tous droits
          réservées.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
