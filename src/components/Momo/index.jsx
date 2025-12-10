import React from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

function Momo() {
  const products = [
    {
      title: "Nike Mercurial",
      description: "Crampons légers et rapides pour dominer le terrain.",
      image: "images/images1.jpg",
    },
    {
      title: "Adidas Predator",
      description: "Contrôle et puissance, le choix des champions.",
      image: "images/images2.jpg",
    },
    {
      title: "Puma Future",
      description: "Agilité et confort pour vos mouvements les plus rapides.",
      image: "images/images3.jpg",
    },
    {
      title: "Nike Phantom",
      description: "Précision et performance pour chaque frappe.",
      image: "images/nike2.jpg",
    },
  ];

  return (
    <Row className="g-4">
      {products.map((product, index) => (
        <Col key={index}>
          <Card className="h-100 text-center">
            <Card.Img
              variant="top"
              src={product.image}
              style={{ height: "200px", objectFit: "cover" }}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
}

export default Momo;
