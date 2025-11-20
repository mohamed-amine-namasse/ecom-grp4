import React from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { PiShoppingCartFill } from "react-icons/pi";
import { BiSolidUserCircle } from "react-icons/bi";
import { NavLink } from "react-router-dom";
import { IoSearchOutline } from "react-icons/io5";
import "./style.css";

function NavScrollExample() {
  return (
    <Navbar expand="lg" className="p-3">
      <Container
        fluid
        className="d-flex align-items-center justify-content-between border border-warning "
      >
        <Navbar.Brand href="#" className="fw-bold">
          Foot Market
        </Navbar.Brand>

        {/* collapse contenant uniquement les liens */}
        <Navbar.Collapse id="nav-links-collapse">
          <Nav
            className="my-2 my-lg-0 "
            style={{ maxHeight: "100px" }}
            navbarScroll
          >
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

        <Form
          className="d-flex  mx-3 search-group align-items-center"
          style={{ width: "40%", minWidth: "200px", maxWidth: "500px" }}
        >
          <Button
            variant="outline-dark "
            className="btn-search  d-flex align-items-center justify-content-center"
          >
            <IoSearchOutline size={25} />
          </Button>
          {/* input masqué en mobile */}
          <Form.Control
            className="d-none d-lg-block"
            type="search"
            placeholder="Rechercher un article"
            aria-label="Search"
          />
        </Form>

        <div className="d-flex align-items-center">
          {/* le toggler ouvre uniquement #nav-links-collapse */}
          <Navbar.Toggle aria-controls="nav-links-collapse" />

          {/* icônes hors du collapse pour rester visibles en mobile */}
          <Nav
            className="my-2 my-lg-0 "
            style={{ maxHeight: "100px" }}
            navbarScroll
          >
            <Nav.Link href="#action1">
              <PiShoppingCartFill size={30} />
            </Nav.Link>
            <Nav.Link href="#action2">
              <BiSolidUserCircle size={30} />
            </Nav.Link>
          </Nav>
        </div>
      </Container>
    </Navbar>
  );
}

export default NavScrollExample;
