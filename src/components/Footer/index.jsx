<<<<<<< HEAD
// src/components/Footer.jsx

import React from "react";
=======
import React from "react";
import { NavLink } from "react-router-dom";
>>>>>>> mohamed-amine
import "./style.css";

function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="container">
          <div>
<<<<<<< HEAD
            <h3>Services</h3>
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
=======
            <h5>Entreprise</h5>
            <nav className="links">
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  isActive ? "footer-link active" : "footer-link"
                }
              >
                A propos
              </NavLink>
              <NavLink
                to="/terms"
                className={({ isActive }) =>
                  isActive ? "footer-link active" : "footer-link"
                }
              >
                CGV/CGU
              </NavLink>
            </nav>
          </div>

          <div>
            <h5>La boutique</h5>
            <nav className="links">
              <NavLink
                to="/shop"
                className={({ isActive }) =>
                  isActive ? "footer-link active" : "footer-link"
                }
              >
                La boutique
              </NavLink>
            </nav>
          </div>

          <div>
            <h5>Besoin d'aide</h5>
            <nav className="links">
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  isActive ? "footer-link active" : "footer-link"
                }
              >
                Contact
              </NavLink>
            </nav>
          </div>
        </div>

        <hr className="hr-milieu" />

        <p>&copy; {currentYear} Foot Market. Tous droits réservés.</p>
>>>>>>> mohamed-amine
      </div>
    </footer>
  );
}

export default Footer;
