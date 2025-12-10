import React from "react";
import "./style.css";

function MainShoeDisplay({ imageURL, name }) {
  return (
    <div className="main-shoe-display-area d-flex justify-content-center">
      <img src={imageURL} alt={name} className="main-shoe-image" />
    </div>
  );
}

export default MainShoeDisplay;
