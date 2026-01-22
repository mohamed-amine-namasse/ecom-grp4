import React, { useEffect, useState } from "react";
import Carousel from "react-bootstrap/Carousel";
import { API_CONFIG } from "../../config/api_cards";
import "./style.css";

function MonCarousel() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(API_CONFIG.allProductsUrl)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Erreur API WooCommerce:", err));
  }, []);

  return (
    <Carousel data-bs-theme="dark">
      {products.map((product) => (
        <Carousel.Item key={product.id}>
          <img
            className="carousel-image"
            src={product.images[0]?.src}
            alt={product.name}
          />

          <Carousel.Caption>
            <h5 dangerouslySetInnerHTML={{ __html: product.name }} />
            <p dangerouslySetInnerHTML={{ __html: product.price_html }} />
          </Carousel.Caption>
        </Carousel.Item>
      ))}
    </Carousel>
  );
}

export default MonCarousel;
