// src/components/Pagination.jsx
import React from "react";
import "./style.css";
const Pagination = ({ totalPages, paginate, currentPage }) => {
  const pageNumbers = [];

  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className="pagination-container">
      <ul className="pagination-list">
        {/* Bouton Précédent */}
        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <button
            onClick={() => paginate(currentPage - 1)}
            className="page-link"
            disabled={currentPage === 1}
          >
            &laquo; Précédent
          </button>
        </li>

        {/* Boutons de pages (version simple pour affichage) */}
        {pageNumbers.map((number) => (
          <li
            key={number}
            className={`page-item ${number === currentPage ? "active" : ""}`}
          >
            <button onClick={() => paginate(number)} className="page-link">
              {number}
            </button>
          </li>
        ))}

        {/* Bouton Suivant */}
        <li
          className={`page-item ${
            currentPage === totalPages ? "disabled" : ""
          }`}
        >
          <button
            onClick={() => paginate(currentPage + 1)}
            className="page-link"
            disabled={currentPage === totalPages}
          >
            Suivant &raquo;
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
