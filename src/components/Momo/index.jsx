import React from "react";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import pic1 from "./images1.jpg";
import pic2 from "./images2.jpg";
import pic3 from "./images3.jpg";
import pic4 from "./images4.jpg";
import "./style.css";

function Momo() {
  const products = [
    {
      title: "Nike Mercurial",
      description: "Crampons légers et rapides pour dominer le terrain.",
      image: pic1,
    },
    {
      title: "Adidas Predator",
      description: "Contrôle et puissance, le choix des champions.",
      image: pic2,
    },
    {
      title: "Puma Future",
      description: "Agilité et confort pour vos mouvements les plus rapides.",
      image: pic3,
    },
    {
      title: "Nike Phantom",
      description: "Précision et performance pour chaque frappe.",
      image: pic4,
    },
  ];

  return (
    <Row className="g-4">
      {products.map((product, index) => (
        <Col key={index}>
          <Card className="h-100 text-center momo-card">
            <Card.Img variant="top" src={product.image} className="momo-img" />
          </Card>
        </Col>
      ))}
    </Row>
  );
}

export default Momo;
