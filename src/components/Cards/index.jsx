import React, { useState, useEffect } from "react";
import { Card, Button } from "react-bootstrap";
import ReactPaginate from "react-paginate";

const API_URL =
  "https://mohamed-amine-namasse.students-laplateforme.io/wordpress-eco/wordpress/wp-json/wc/v3/products";

const CONSUMER_KEY = "ck_89f4f1f6552d002670c02d923f080ae18083fc61";
const CONSUMER_SECRET = "cs_075f8a5e20aed7a6a802834eab69795a5ac8da07";

function Cards() {
  const itemsPerPage = 4;
  const [products, setProducts] = useState([]);
  const [hoverId, setHoverId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [itemOffset, setItemOffset] = useState(0);

  useEffect(() => {
    fetch(`${API_URL}?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`)
      .then((res) => {
        if (!res.ok) throw new Error("Erreur réseau");
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Chargement des produits...</p>;
  if (error) return <p>Erreur: {error}</p>;

  // Pagination
  const endOffset = itemOffset + itemsPerPage;
  const currentItems = products.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(products.length / itemsPerPage);

  const handlePageClick = (event) => {
    const newOffset = (event.selected * itemsPerPage) % products.length;
    setItemOffset(newOffset);
  };

  return (
    <>
      {/* AFFICHAGE DES PRODUITS */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          justifyContent: "center",
        }}
      >
        {currentItems.map((p) => {
          const hover = hoverId === p.id;
          return (
            <Card
              key={p.id}
              style={{
                width: "18rem",
                borderRadius: 12,
                boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                position: "relative",
                cursor: "pointer",
                overflow: "hidden",
              }}
              onMouseEnter={() => setHoverId(p.id)}
              onMouseLeave={() => setHoverId(null)}
            >
              <Card.Img
                src={p.images[0]?.src || "https://via.placeholder.com/300x300"}
                alt={p.name}
                style={{
                  width: "100%",
                  height: "300px",
                  objectFit: "cover",
                  borderRadius: "12px",
                  transition: "0.3s ease",
                  filter: hover ? "brightness(60%)" : "brightness(100%)",
                }}
              />

              <Button
                variant="primary"
                style={{
                  position: "absolute",
                  bottom: "20px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  opacity: hover ? 1 : 0,
                  transition: "0.25s ease",
                }}
              >
                Voir le produit
              </Button>

              <Card.Body>
                <Card.Title>{p.name}</Card.Title>
              </Card.Body>
            </Card>
          );
        })}
      </div>

      {/* PAGINATION */}
      <div style={{ marginTop: "30px", display: "flex", justifyContent: "center" }}>
        <ReactPaginate
          breakLabel="..."
          nextLabel="Suivant >"
          previousLabel="< Précédent"
          onPageChange={handlePageClick}
          pageRangeDisplayed={3}
          pageCount={pageCount}
          containerClassName="pagination"
          activeClassName="active-page"   // 👈 classe appliquée au numéro actif
        />
      </div>

      {/* STYLE DE LA PAGINATION */}
      <style>{`
        .pagination {
          display: flex;
          gap: 10px;
          list-style: none;
          font-size: 18px;
          padding: 0;
        }

        .pagination li {
          cursor: pointer;
          padding: 8px 12px;
          border-radius: 8px;
          transition: 0.2s ease;
          border: 1px solid #ccc;
        }

        .pagination li:hover {
          background-color: #eaeaea;
        }

        /* Style du numéro de page actif */
        .active-page {
          background-color: #007bff !important;
          color: white !important;
          border-color: #007bff !important;
        }
      `}</style>
    </>
  );
}

export default Cards;
