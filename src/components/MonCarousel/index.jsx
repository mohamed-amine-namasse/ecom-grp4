import React, { useEffect, useState } from "react";
import Carousel from "react-bootstrap/Carousel";

const API_URL =
  "https://mohamed-amine-namasse.students-laplateforme.io/wordpress-eco/wordpress/wp-json/wc/v3/products";

const CONSUMER_KEY = "ck_89f4f1f6552d002670c02d923f080ae18083fc61";
const CONSUMER_SECRET = "cs_075f8a5e20aed7a6a802834eab69795a5ac8da07";

function MonCarousel() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(
      `${API_URL}?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`
    )
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Erreur API WooCommerce:", err));
  }, []);

  return (
    <Carousel data-bs-theme="dark">
      {/* ------------------------- */}
      {/* TES SLIDES ACTUELLES     */}
      {/* ------------------------- */}

      {/* ------------------------- */}
      {/* SLIDES PRODUITS WOOCOMMERCE */}
      {/* ------------------------- */}

      {products.map((product) => (
        <Carousel.Item key={product.id}>
          <img
            src={product.images[0]?.src}
            alt={product.name}
            style={{ width: "80%", height: "650px", objectFit: "cover" }}
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
