import React from "react";
import "./style.css";

function ShoppingLoader({ isLoading }) {
  const loaderClass = `shopping-loader-container ${
    isLoading ? "is-loading" : "fade-out"
  }`;

  if (!isLoading) {
    return null;
  }

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
