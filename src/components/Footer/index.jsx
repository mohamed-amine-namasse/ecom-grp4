import React from "react";
import { NavLink } from "react-router-dom";
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
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  isActive ? "footer-link active" : "footer-link"
                }
              >
                Qui sommes-nous ?
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

        <p>
          &copy; {currentYear} Mon Blog WordPress / React. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
