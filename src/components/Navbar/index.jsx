import React, { useState, useRef, useCallback, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { PiShoppingCartFill } from "react-icons/pi";
import { BiSolidUserCircle } from "react-icons/bi";
import { NavLink } from "react-router";
import { IoSearchOutline } from "react-icons/io5";
import Modal from "react-bootstrap/Modal";
import ListGroup from "react-bootstrap/ListGroup";
import Spinner from "react-bootstrap/Spinner";
import "./style.css";

// URL DE BASE DE VOTRE SITE WOOCOMMERCE
const WOOCOMMERCE_BASE_URL =
  "https://mohamed-amine-namasse.students-laplateforme.io/wordpress-eco/wordpress/";

// --- FONCTION DE RÉCUPÉRATION DES PRODUITS WOOCOMMERCE ---
/**
 * Récupère les suggestions de produits de l'API WooCommerce.
 *
 * ATTENTION: Dans un environnement de production, l'authentification API
 * (clés Consumer Key et Secret) NE DOIT PAS être exposée dans le code front-end.
 * Idéalement, cet appel devrait passer par un proxy ou une fonction serveur
 * pour masquer les clés.
 *
 * @param {string} query Terme de recherche de l'utilisateur.
 * @returns {Promise<Array<{id: number, name: string, link: string}>>} Liste des produits.
 */
const fetchWooCommerceProducts = async (query) => {
  if (!query || query.length < 2) {
    return [];
  }

  // Endpoint standard de recherche de produits WooCommerce
  // Nous demandons au maximum 5 produits correspondant au terme de recherche.
  const apiUrl = `${WOOCOMMERCE_BASE_URL}wp-json/wc/v3/products?search=${query}&per_page=5`;

  try {
    // --------------------------------------------------------------------------------
    // !!! INSTRUCTION IMPORTANTE CONCERNANT L'AUTHENTIFICATION !!!
    // L'API WooCommerce nécessite une authentification (via Basic Auth ou OAuth).
    // Si votre API n'est pas accessible publiquement, vous DEVEZ ajouter ici
    // l'authentification (e.g., dans les headers), mais faites-le de manière sécurisée
    // en utilisant un backend pour masquer vos clés secrètes.
    // Pour les besoins de ce démo/test, nous faisons une requête sans authentification,
    // qui pourrait échouer si les permissions ne sont pas correctement configurées
    // pour l'accès non authentifié aux produits.
    // --------------------------------------------------------------------------------

    const response = await fetch(apiUrl);

    if (!response.ok) {
      // Log l'erreur pour le débogage
      console.error(
        "Erreur API WooCommerce:",
        response.status,
        response.statusText
      );
      // Tente de lire le corps de l'erreur pour plus de détails
      const errorBody = await response.json();
      console.error("Détails de l'erreur:", errorBody);

      // Lance une erreur pour le bloc catch
      throw new Error(
        `Erreur lors de la récupération des produits: ${response.statusText}`
      );
    }

    const data = await response.json();

    return data.map((product) => ({
      id: product.id,
      name: product.name,
      // Utilisation du permalink retourné par l'API pour la redirection
      link: product.permalink || `/shop/${product.slug}`,
    }));
  } catch (error) {
    console.error("Échec de la recherche de produits:", error);
    // Retourne un tableau vide en cas d'erreur
    return [];
  }
};

// --- COMPONENT PRINCIPAL ---

function NavScrollExample() {
  const [showSearchModal, setShowSearchModal] = useState(false);
  const inputRef = useRef(null);

  // ÉTATS POUR L'AUTOCOMPLÉTION
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // Nouvel état pour gérer les erreurs API

  // Fonction pour appeler l'API (débounced)
  const handleFetchSuggestions = useCallback(async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fetchedSuggestions = await fetchWooCommerceProducts(query);
      setSuggestions(fetchedSuggestions);
    } catch (e) {
      setError("Erreur de connexion à la boutique.");
      setSuggestions([]);
      console.error("Erreur gérée lors de la recherche:", e);
    }

    setLoading(false);
  }, []);

  // Logique de Debounce: déclenche la recherche seulement après 500ms d'inactivité
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleFetchSuggestions(searchTerm);
    }, 500);

    // Nettoyage: annule l'appel précédent si l'utilisateur continue de taper
    return () => clearTimeout(timeoutId);
  }, [searchTerm, handleFetchSuggestions]);

  // Gestionnaire de changement pour l'input de recherche
  const handleSearchTermChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Gestionnaire de clic sur une suggestion (simule la navigation)
  const handleSuggestionClick = (link) => {
    console.log("Naviguer vers:", link);
    // REMPLACEZ PAR VOTRE LOGIQUE DE NAVIGATION REACT ROUTER DOM

    setSearchTerm("");
    setSuggestions([]);
    setShowSearchModal(false); // Ferme la modale mobile
  };

  const handleSearchClick = (e) => {
    // si mobile (breakpoint lg = 992px)
    if (window.innerWidth < 992) {
      setShowSearchModal(true);
    } else {
      // sur desktop on focus l'input
      inputRef.current?.focus();
    }
  };

  const handleModalClose = () => {
    setShowSearchModal(false);
    setSearchTerm(""); // Réinitialise la recherche en fermant
    setSuggestions([]);
    setError(null);
  };

  // Conteneur flexible pour la recherche desktop et les suggestions
  const searchContainerStyle = {
    position: "relative",
    // Le minWidth a été retiré pour corriger le problème de layout sur mobile
  };

  const suggestionsListStyle = {
    position: "absolute",
    top: "100%",
    left: "0",
    right: "0",
    zIndex: 1050, // Au-dessus de tout sauf la modale
    backgroundColor: "white",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    borderRadius: "0.25rem",
    marginTop: "2px",
    maxHeight: "300px",
    overflowY: "auto",
  };

  return (
    <Navbar expand="lg" className="p-3">
      <Container fluid className="d-flex align-items-center">
        {" "}
        {/* toggler is direct child so we can reorder it with CSS on mobile */}
        <Navbar.Toggle aria-controls="nav-links-collapse" />
        <Navbar.Brand href="#" className="fw-bold ">
          Foot Market
        </Navbar.Brand>
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
        <div style={searchContainerStyle} className="me-0 ms-auto">
          {" "}
          {/* Conteneur pour positionner la liste de suggestions */}
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
              value={searchTerm} // Liaison de la valeur
              onChange={handleSearchTermChange} // Gestionnaire de changement
            />
          </Form>
          {/* SUGGESTIONS DESKTOP */}
          {searchTerm.length >= 2 &&
            window.innerWidth >= 992 &&
            (suggestions.length > 0 || loading || error) && (
              <ListGroup style={suggestionsListStyle}>
                {loading && (
                  <ListGroup.Item className="d-flex align-items-center justify-content-center py-2">
                    <Spinner animation="border" size="sm" className="me-2" />
                    Chargement...
                  </ListGroup.Item>
                )}
                {error && (
                  <ListGroup.Item className="text-danger">
                    {error}
                  </ListGroup.Item>
                )}
                {!loading &&
                  !error &&
                  suggestions.length > 0 &&
                  suggestions.map((product) => (
                    <ListGroup.Item
                      key={product.id}
                      action
                      onClick={() => handleSuggestionClick(product.link)}
                      style={{ cursor: "pointer" }}
                    >
                      {product.name}
                    </ListGroup.Item>
                  ))}
                {!loading && !error && suggestions.length === 0 && (
                  <ListGroup.Item className="text-muted">
                    Aucun produit trouvé.
                  </ListGroup.Item>
                )}
              </ListGroup>
            )}
        </div>
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
              // Optionnel: ajouter logique recherche/redirection
              if (suggestions.length > 0) {
                handleSuggestionClick(suggestions[0].link);
              }
            }}
          >
            <Form.Control
              autoFocus
              type="search"
              placeholder="Rechercher un article"
              aria-label="Search"
              value={searchTerm} // Liaison de la valeur
              onChange={handleSearchTermChange} // Gestionnaire de changement
            />
          </Form>

          {/* SUGGESTIONS MOBILE (dans la modale) */}
          {searchTerm.length >= 2 &&
            (suggestions.length > 0 || loading || error) && (
              <div className="mt-3">
                {loading && (
                  <div className="d-flex align-items-center justify-content-center py-3">
                    <Spinner animation="border" className="me-2" />
                    <span className="text-muted">
                      Chargement des produits...
                    </span>
                  </div>
                )}
                {error && (
                  <p className="text-danger text-center mt-3">{error}</p>
                )}
                {!loading && !error && suggestions.length > 0 && (
                  <ListGroup>
                    {suggestions.map((product) => (
                      <ListGroup.Item
                        key={product.id}
                        action
                        onClick={() => handleSuggestionClick(product.link)}
                        style={{ cursor: "pointer" }}
                      >
                        {product.name}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
                {!loading && !error && suggestions.length === 0 && (
                  <p className="text-muted text-center mt-3">
                    Aucun produit trouvé pour "{searchTerm}".
                  </p>
                )}
              </div>
            )}
        </Modal.Body>
      </Modal>
    </Navbar>
  );
}

export default NavScrollExample;
