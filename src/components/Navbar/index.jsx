// ...existing code...
import React, { useState, useRef } from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { PiShoppingCartFill } from "react-icons/pi";
import { BiSolidUserCircle } from "react-icons/bi";
import { NavLink } from "react-router";
import { IoSearchOutline } from "react-icons/io5";
import Modal from "react-bootstrap/Modal"; // changed to react-bootstrap Modal
import "./style.css";

function NavScrollExample() {
  const [showSearchModal, setShowSearchModal] = useState(false);
  const inputRef = useRef(null);

  const handleSearchClick = (e) => {
    // si mobile (breakpoint lg = 992px)
    if (window.innerWidth < 992) {
      setShowSearchModal(true);
    } else {
      // sur desktop on focus l'input
      inputRef.current?.focus();
    }
  };

  const handleModalClose = () => setShowSearchModal(false);

  return (
    <Navbar expand="lg" className="p-3">
      <Container
        fluid
        className="d-flex align-items-center justify-content-between "
      >
        <Navbar.Brand href="#" className="fw-bold ">
          Foot Market
        </Navbar.Brand>

        {/* toggler is direct child so we can reorder it with CSS on mobile */}
        <Navbar.Toggle aria-controls="nav-links-collapse" />

        {/* links inside collapse (toggler opens only these) */}
        <Navbar.Collapse id="nav-links-collapse">
          <Nav className="my-2 my-lg-0 nav-links" navbarScroll>
            <Nav.Link as={NavLink} to="/" end>
              Accueil
            </Nav.Link>
            <Nav.Link as={NavLink} to="/shop">
              Boutique
            </Nav.Link>
            <Nav.Link as={NavLink} to="/register">
              Inscription
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>

        {/* search group: input hidden on < lg, only icon visible */}
        <Form className="d-flex search-group align-items-center ">
          <Button
            variant="outline-dark"
            className="btn-search d-flex align-items-center justify-content-center"
            aria-label="Recherche"
            onClick={
              handleSearchClick
            } /* ouvre modal en mobile, focus en desktop */
          >
            <IoSearchOutline size={25} />
          </Button>
          <Form.Control
            ref={inputRef}
            className="d-none d-lg-block"
            type="search"
            placeholder="Rechercher un article"
            aria-label="Search"
          />
        </Form>

        {/* icons remain outside collapse and visible in mobile */}

        <Nav className="nav-icons d-flex align-items-center ">
          <Nav.Link href="#cart" className="p-1">
            <PiShoppingCartFill size={30} />
          </Nav.Link>
          <Nav.Link href="#user" className="p-1">
            <BiSolidUserCircle size={30} />
          </Nav.Link>
        </Nav>
      </Container>

      {/* Modal de recherche pour mobile */}
      <Modal show={showSearchModal} onHide={handleModalClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Rechercher</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              // ajouter logique recherche si besoin
              handleModalClose();
            }}
          >
            <Form.Control
              autoFocus
              type="search"
              placeholder="Rechercher un article"
              aria-label="Search"
            />
          </Form>
        </Modal.Body>
      </Modal>
    </Navbar>
  );
}

export default NavScrollExample;
