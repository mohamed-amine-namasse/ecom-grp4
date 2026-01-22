import React, { useState, useEffect } from "react";
import { Card, Button } from "react-bootstrap";
import ReactPaginate from "react-paginate";
import { Link } from "react-router";
import { API_CONFIG } from "../../config/api_cards";
import "./style.css";

function Cards() {
  const itemsPerPage = 4;
  const [products, setProducts] = useState([]);
  const [hoverId, setHoverId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [itemOffset, setItemOffset] = useState(0);

  useEffect(() => {
    fetch(API_CONFIG.allProductsUrl)
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
      <div className="cards-container2">
        {currentItems.map((p) => {
          const isHover = hoverId === p.id;
          const detailPath = `/product/${p.id}`;

          return (
            <Card
              key={p.id}
              className={`product-card2 ${isHover ? "hover" : ""}`}
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

      <div className="pagination-container">
        <ReactPaginate
          breakLabel="..."
          nextLabel="Suivant >"
          previousLabel="< Précédent"
          onPageChange={handlePageClick}
          pageRangeDisplayed={3}
          pageCount={pageCount}
          containerClassName="pagination2"
          activeClassName="active-page"
        />
      </div>
    </>
  );
}

export default Cards;
