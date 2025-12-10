import React, { useState, useEffect } from "react";
import { Card, Button } from "react-bootstrap";
import ReactPaginate from "react-paginate";
import { Link } from "react-router";
import "./style.css";

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
    fetch(
      `${API_URL}?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`
    )
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

  const endOffset = itemOffset + itemsPerPage;
  const currentItems = products.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(products.length / itemsPerPage);

  const handlePageClick = (event) => {
    const newOffset = (event.selected * itemsPerPage) % products.length;
    setItemOffset(newOffset);
  };

  return (
    <>
      <div className="cards-container">
        {currentItems.map((p) => {
          const isHover = hoverId === p.id;
          const detailPath = `/product/${p.id}`;

          return (
            <Card
              key={p.id}
              className={`product-card ${isHover ? "hover" : ""}`}
              onMouseEnter={() => setHoverId(p.id)}
              onMouseLeave={() => setHoverId(null)}
            >
              <Card.Img
                src={p.images[0]?.src || "https://via.placeholder.com/300x300"}
                alt={p.name}
              />

              <Button
                as={Link}
                to={detailPath}
                variant="primary"
                className="view-button"
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

      <div className="pagination-wrapper">
        <ReactPaginate
          breakLabel="..."
          nextLabel="Suivant >"
          previousLabel="< Précédent"
          onPageChange={handlePageClick}
          pageRangeDisplayed={3}
          pageCount={pageCount}
          containerClassName="pagination"
          activeClassName="active-page"
        />
      </div>
    </>
  );
}

export default Cards;
