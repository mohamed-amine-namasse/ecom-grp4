import { Card, Button } from "react-bootstrap";
import { useState } from "react";



function Cards() {
  const [hoverId, setHoverId] = useState(null);


  const products = [
    {
      id: 1,
      title: "Sac à dos vintage",
      price: "29,99 €",
      img: "/images/morgan--landstrom-y-asllani.jpg",
    },
    {
      id: 2,
      title: "Casquette streetwear",
      price: "19,50 €",
      img: "/images/sample-2.jpg",
    },
    {
      id: 3,
      title: "T-shirt imprimé",
      price: "24,00 €",
      img: "/images/sample-3.jpg",
    },
    {
      id: 4,
      title: "Baskets running",
      price: "59,99 €",
      img: "/images/sample-4.jpg",
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "20px",
        justifyContent: "center",
      }}
    >
      {products.map((p) => {
        const hover = hoverId === p.id;
        return (
          <Card
            key={p.id}
            style={{
              width: "18rem",
              border: "none",
              position: "relative",
              cursor: "pointer",
              overflow: "hidden",
              borderRadius: 12,
              boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
            }}
            onMouseEnter={() => setHoverId(p.id)}
            onMouseLeave={() => setHoverId(null)}
          >
            <Card.Img
              src={p.img}
              alt={p.title}
              style={{
                width: "100%",
                height: "300px",
                objectFit: "cover",
                borderRadius: "12px",
                transition: "0.3s ease",
                filter: hover ? "brightness(60%)" : "brightness(100%)",
              }}
            />

            <div
              style={{
                position: "absolute",
                top: "15px",
                left: "15px",
                background: "rgba(0,0,0,0.7)",
                color: "white",
                padding: "8px 12px",
                borderRadius: "6px",
                fontSize: "16px",
                fontWeight: "700",
                zIndex: 10,
              }}
            >
              {p.price}
            </div>

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
                transition: "opacity 0.25s ease",
                zIndex: 10,
              }}
            >
              Voir le produit
            </Button>

            <Card.Body>
              <Card.Title style={{ fontSize: 16, fontWeight: 700 }}>
                {p.title}
              </Card.Title>
            </Card.Body>
          </Card>
        );
      })}
    </div>
  );
}

export default Cards;
// ...existing code...