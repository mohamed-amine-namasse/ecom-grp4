import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { PiShoppingCartFill } from "react-icons/pi";
import { BiSolidUserCircle } from "react-icons/bi";
import { NavLink } from "react-router";
import { IoSearchOutline } from "react-icons/io5";
import "./style.css";
function NavScrollExample() {
  return (
    <Navbar expand="lg" className="p-3">
      <Container
        fluid
        className="d-flex align-items-center justify-content-between "
      >
        <Navbar.Brand href="#" className="fw-bold">
          Foot Market
        </Navbar.Brand>
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
        <Form
          className="d-flex  mx-3 search-group align-items-center"
          style={{ width: "40%", minWidth: "200px", maxWidth: "500px" }}
        >
          <Button
            variant="outline-dark"
            className="btn-search  d-flex align-items-center justify-content-center"
          >
            <IoSearchOutline size={25} />
          </Button>
          <Form.Control
            type="search"
            placeholder="Rechercher un article"
            aria-label="Search"
          />
        </Form>

        <div className="d-flex align-items-center">
          <Navbar.Toggle aria-controls="navbarScroll" />
          <Navbar.Collapse id="navbarScroll">
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
          </Navbar.Collapse>
        </div>
      </Container>
    </Navbar>
  );
}

export default NavScrollExample;
