import { Card, Button } from "react-bootstrap";
import { useState } from "react";

function Cards() {
  const [hover, setHover] = useState(false);

  return (
    <Card
      style={{
        width: "18rem",
        border: "none",
        position: "relative",
        cursor: "pointer",
        overflow: "hidden",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Image en pleine carte */}
      <Card.Img
        src="/images/morgan--landstrom-y-asllani.jpg"
        alt="Produit"
        style={{
          width: "100%",
          height: "300px",
          objectFit: "cover",
          borderRadius: "12px",
          transition: "0.3s ease",
          filter: hover ? "brightness(60%)" : "brightness(100%)",
        }}
      />

      {/* Prix (toujours visible) */}
      <div
        style={{
          position: "absolute",
          top: "15px",
          left: "15px",
          background: "rgba(0,0,0,0.7)",
          color: "white",
          padding: "8px 12px",
          borderRadius: "6px",
          fontSize: "18px",
          fontWeight: "bold",
          zIndex: 10,
        }}
      >
        29,99 €
      </div>

      {/* Bouton — visible seulement au survol */}
      <Button
        variant="primary"
        style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          padding: "10px 25px",
          fontSize: "16px",
          borderRadius: "8px",
          opacity: hover ? 1 : 0,
          transition: "opacity 0.3s ease",
          zIndex: 10,
        }}
      >
        Voir le produit
      </Button>
    </Card>
  );
}

export default Cards;
