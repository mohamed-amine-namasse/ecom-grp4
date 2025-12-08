import React from "react";
import "./style.css"; // Le CSS avec la rotation flotteur

function MainShoeDisplay({ imageURL, name }) {
  // Utilisez l'imageURL directement
  return (
    <div className="main-shoe-display-area d-flex justify-content-center">
      <img src={imageURL} alt={name} className="main-shoe-image" />
    </div>
  );
}

export default MainShoeDisplay;
