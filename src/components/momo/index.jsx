import React from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

function ProductCards() {
  const products = [
    {
      title: "Nike Mercurial",
      description: "Crampons légers et rapides pour dominer le terrain.",
      image: "images/images.jpg",
    },
    {
      title: "Adidas Predator",
      description: "Contrôle et puissance, le choix des champions.",
      image: "images/crampons-unitedpack-2023-nike-800x800-c-center.jpeg",
    },
    {
      title: "Puma Future",
      description: "Agilité et confort pour vos mouvements les plus rapides.",
      image: "images/puma.jpg",
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
        <Col xs={12} md={6} lg={3} key={index}>
          <Card className="h-100 text-center">
            <Card.Img
              variant="top"
              src={product.image}
              style={{ height: "200px", objectFit: "cover" }}
            />
            <Card.Body>
             
              
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
}

export default ProductCards;
