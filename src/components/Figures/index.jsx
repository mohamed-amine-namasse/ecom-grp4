import React, { useEffect, useState } from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";


const API_URL =
  "https://mohamed-amine-namasse.students-laplateforme.io/wordpress-eco/wordpress/wp-json/wc/v3/products";

const CONSUMER_KEY = "ck_89f4f1f6552d002670c02d923f080ae18083fc61";
const CONSUMER_SECRET = "cs_075f8a5e20aed7a6a802834eab69795a5ac8da07";


const FALLBACK_PRODUCTS = {
  nike: {
    name: "Nike Air Zoom Mercurial Superfly 10 Kylian Mbappé",
    images: [
      {
        src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" font-size="18" dominant-baseline="middle" text-anchor="middle" fill="%23666">Image manquante</text></svg>',
      },
    ],
  },
  adidas: {
    name: "adidas Predator Elite FG Advancement - Bleu/Blanc/Rouge",
    images: [
      {
        src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="%23eef2ff"/><text x="50%" y="50%" font-size="18" dominant-baseline="middle" text-anchor="middle" fill="%23477">Image manquante</text></svg>',
      },
    ],
  },
  puma: {
    name: "PUMA Ultra 5 Play IT Lights Out",
    images: [
      {
        src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="%230f172a"/><text x="50%" y="50%" font-size="18" dominant-baseline="middle" text-anchor="middle" fill="%23fff">Image manquante</text></svg>',
      },
    ],
  },
};

function Figures() {
 
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const nike = await getProductByBrand("nike");
        const adidas = await getProductByBrand("adidas");
        const puma = await getProductByBrand("puma");
        
        setProducts([
          nike || FALLBACK_PRODUCTS.nike,
          adidas || FALLBACK_PRODUCTS.adidas,
          puma || FALLBACK_PRODUCTS.puma,
        ]);
      } catch (err) {
        console.error("Erreur lors du chargement des produits :", err);
        setError(err.message || "Erreur réseau");
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  async function getProductByBrand(brand) {
    const url = `${API_URL}?search=${brand}&consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        const text = await response.text();
        console.error(
          `Erreur API pour "${brand}" (status ${response.status}):`,
          text
        );
        return null;
      }
      const products = await response.json();
      console.log(brand, products);
      if (!Array.isArray(products) || products.length === 0) return null;
      return products[0];
    } catch (err) {
      console.error(`Erreur réseau pour "${brand}":`, err);
      return null;
    }
  }

  if (loading) {
    return (
      <Container>
        <Row>
          <Col className="text-center">Chargement...</Col>
        </Row>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Row>
          <Col className="text-center text-danger">Erreur : {error}</Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container>
      <Row>
        {products.map((product, index) => (
          <Col key={index} className="text-center mb-3">
            <img
              src={product?.images?.[0]?.src}
              alt={product?.name || "Produit"}
              style={{
                maxWidth: "100%",
                height: "200px",
                objectFit: "cover",
                marginBottom: 8,
              }}
            />
            <h5>{product?.name || "Aucun produit trouvé"}</h5>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
export default Figures;
