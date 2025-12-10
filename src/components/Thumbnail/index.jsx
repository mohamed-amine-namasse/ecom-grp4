import React from "react";
import "./style.css";

function Thumbnail({ shoe, imageURL, isSelected, onSelect }) {
  const handleClick = () => {
    onSelect(shoe);
  };

  return (
    <div
      className={`thumbnail-card ${isSelected ? "selected" : ""}`}
      onClick={handleClick}
      role="button"
      tabIndex="0"
    >
      <img
        src={imageURL}
        alt={`Vignette ${shoe.name}`}
        className="thumbnail-image"
      />
    </div>
  );
}

export default Thumbnail;
