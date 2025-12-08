import React from "react";
import "./style.css"; // Le fichier CSS associé

// Le composant gère la transition de chargement à la fin
function ShoppingLoader({ isLoading }) {
  // Détermine la classe : 'is-loading' (opaque) ou 'fade-out' (début de la disparation)
  const loaderClass = `shopping-loader-container ${
    isLoading ? "is-loading" : "fade-out"
  }`;

  // Si le chargement est terminé et que l'animation est passée, on ne rend plus rien
  // Note : On pourrait utiliser un state local pour gérer le délai de démontage,
  // mais pour la simplicité, on compte sur le parent (Home) pour cacher/afficher.
  if (!isLoading) {
    // Pour s'assurer que le composant est bien démonté après le fondu (0.5s)
    return null;
  }

  // Afficher le loader tant que le composant parent (Home) ne l'a pas désactivé
  return (
    <div className={loaderClass}>
      <img
        src="/images/shoe.gif"
        alt="gif du loader"
        style={{ width: "30%", height: "30%", objectFit: "cover" }}
      />
      <p className="loading-message">
        Préparation de votre expérience shopping...
      </p>
    </div>
  );
}

export default ShoppingLoader;
