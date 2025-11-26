import React, { useEffect, useState } from "react";
import Carousel from "react-bootstrap/Carousel";

const API_URL =
  "https://mohamed-amine-namasse.students-laplateforme.io/wordpress-eco/wordpress/wp-json/custom/v1/products";

function MonCarousel() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        console.log("API RESPONSE:", data);

        // --- SÉCURITÉ MAX : Transforme la réponse en tableau ---
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          console.error("Format inattendu :", data);
          setProducts([]);
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur API WooCommerce:", err);
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <h3>Chargement...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <h3>❌ Erreur : Impossible de charger les produits</h3>
      </div>
    );
  }

  return (
    <Carousel data-bs-theme="dark">

      {/* ------------------------- */}
      {/* SLIDES STATIQUES          */}
      {/* ------------------------- */}

      <Carousel.Item>
        <img
          src="/images/morgan--landstrom-y-asllani.jpg"
          alt="First slide"
          style={{ width: "100%", height: "650px", objectFit: "cover" }}
        />
        <Carousel.Caption>
          <h5>First slide label</h5>
          <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p>
        </Carousel.Caption>
      </Carousel.Item>

      <Carousel.Item>
        <img
          src="/images/NZGQQ65S4RAWZHSC3ZANEREVJM.png"
          alt="Second slide"
          style={{ width: "100%", height: "650px", objectFit: "cover" }}
        />
        <Carousel.Caption>
          <h5>Second slide label</h5>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </Carousel.Caption>
      </Carousel.Item>

      <Carousel.Item>
        <img
          src="/images/edca6.jpg"
          alt="Third slide"
          style={{ width: "100%", height: "650px", objectFit: "cover" }}
        />
        <Carousel.Caption>
          <h5>Third slide label</h5>
          <p>Praesent commodo cursus magna, vel scelerisque nisl consectetur.</p>
        </Carousel.Caption>
      </Carousel.Item>

      {/* ------------------------- */}
      {/* PRODUITS WOOCOMMERCE      */}
      {/* ------------------------- */}

      {products.length > 0 &&
        products.map((product) => (
          <Carousel.Item key={product.id}>
            <img
              src={product.images?.[0]}
              alt={product.name}
              style={{ width: "100%", height: "650px", objectFit: "cover" }}
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
