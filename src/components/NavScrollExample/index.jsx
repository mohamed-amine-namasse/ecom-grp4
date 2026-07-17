import React, { useState, useRef, useCallback, useEffect } from "react";
import logo from "./LOGO.jpg";
import { useCart } from "../CartContext";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { PiShoppingCartFill } from "react-icons/pi";
import { BiSolidUserCircle } from "react-icons/bi";
import { NavLink } from "react-router-dom";
import { IoSearchOutline } from "react-icons/io5";
import { PiUserCircleGearFill } from "react-icons/pi";
import { RiLogoutBoxRLine } from "react-icons/ri";
import { FaShippingFast } from "react-icons/fa";
import Modal from "react-bootstrap/Modal";
import ListGroup from "react-bootstrap/ListGroup";
import Spinner from "react-bootstrap/Spinner";
import Badge from "react-bootstrap/Badge";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router"; // Pour la redirection
import { API_CONFIG } from "../../config/api_shop";
import "./style.css";

// ----------------------------------------------------------------------
// --- FONCTIONS GLOBALEMENT EXPORTÉES (Utilisées par le composant de connexion/login) ---
// ----------------------------------------------------------------------

/**
 * Récupère l'objet d'authentification utilisateur depuis le Local Storage.
 * @returns {object|null} L'objet utilisateur si trouvé et valide, sinon null.
 */
const getAuthDataFromLocalStorage = () => {
  const storedData = localStorage.getItem(API_CONFIG.authStorageKey);
  try {
    const authData = storedData ? JSON.parse(storedData) : null;
    if (authData && authData.token) {
      return authData;
    }
  } catch (e) {
    console.error("Erreur de parsing de userAuth dans Local Storage:", e);
    localStorage.removeItem(API_CONFIG.authStorageKey);
  }
  return null;
};

/**
 * Met à jour les données d'authentification dans le Local Storage.
 * Cette fonction est exportée pour être appelée APRÈS une connexion réussie.
 * @param {object|null} data L'objet JWT/utilisateur ou null pour la déconnexion.
 */
export const setAuthDataState = (data) => {
  if (data) {
    localStorage.setItem(API_CONFIG.authStorageKey, JSON.stringify(data));
  } else {
    localStorage.removeItem(API_CONFIG.authStorageKey);
  }
};

// ----------------------------------------------------------------------
// --- FONCTION DE RÉCUPÉRATION DES PRODUITS WOOCOMMERCE (Non modifiée) ---
// ----------------------------------------------------------------------
const fetchWooCommerceProducts = async (query) => {
  if (!query || query.length < 2) {
    return [];
  }

  // Utilisation de la config pour l'URL et le Header
  const apiUrl = API_CONFIG.getSearchUrl(query);
  const authHeader = API_CONFIG.getBasicAuthHeader();

  try {
    const response = await fetch(apiUrl, {
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
    });

    if (!response.ok) {
      const errorDetails = `Statut: ${response.status} ${response.statusText}`;
      throw new Error(`Erreur lors de l'appel à l'API. ${errorDetails}`);
    }

    const data = await response.json();
    return data.map((product) => ({
      id: product.id,
      name: product.name,
      link: `/product/${product.id}`,
    }));
  } catch (error) {
    console.error(
      "Échec de la recherche de produits (Network/CORS/Fetch):",
      error,
    );
    throw new Error(`Échec de connexion réseau.`);
  }
};

// ----------------------------------------------------------------------
// --- COMPONENT PRINCIPAL AVEC ECOUTEUR DE MISE À JOUR ---
// ----------------------------------------------------------------------

function NavScrollExample() {
  const [showSearchModal, setShowSearchModal] = useState(false);
  const inputRef = useRef(null);

  // Initialisation de l'état en lisant le Local Storage
  const [authData, setAuthData] = useState(getAuthDataFromLocalStorage);
  const isLoggedIn = !!authData;

  // Fonction pour forcer la mise à jour de l'état local à partir du Local Storage
  const updateAuthFromStorage = useCallback(() => {
    setAuthData(getAuthDataFromLocalStorage());
    console.log("Navbar mise à jour à partir du Local Storage.");
  }, []);

  // Écouteur d'événement pour mettre à jour la Navbar après une connexion/déconnexion réussie
  useEffect(() => {
    // Écoute un événement personnalisé 'storageUpdate' (déclenché par le composant de connexion)
    window.addEventListener("storageUpdate", updateAuthFromStorage);

    // Nettoyage de l'écouteur
    return () => {
      window.removeEventListener("storageUpdate", updateAuthFromStorage);
    };
  }, [updateAuthFromStorage]);
  const { logout } = useAuth(); // ⬅️ Récupérer la fonction logout
  const navigate = useNavigate();
  // Fonction de déconnexion
  const handleLogout = () => {
    logout(); // ⬅️ Appel de la fonction de déconnexion
    navigate("/login"); // ⬅️ Rediriger l'utilisateur
  };

  // ----------------------------------------------------------------------
  // --- Logique de recherche (Non modifiée) ---
  // ----------------------------------------------------------------------
  const { getCartCount } = useCart();
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchAttempted, setSearchAttempted] = useState(false);

  const handleFetchSuggestions = useCallback(async (query) => {
    // ... (Logique de fetchWooCommerceProducts) ...
    if (query.length < 2) {
      setSuggestions([]);
      setError(null);
      setSearchAttempted(false);
      return;
    }
    setLoading(true);
    setError(null);
    setSearchAttempted(true);
    try {
      const fetchedSuggestions = await fetchWooCommerceProducts(query);
      setSuggestions(fetchedSuggestions);
      setError(null);
    } catch (e) {
      setError(
        e.message || "Une erreur inconnue s'est produite lors de la recherche.",
      );
      setSuggestions([]);
      console.error("Erreur gérée lors de la recherche:", e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (searchTerm.length < 2) {
      setSuggestions([]);
      setError(null);
      setLoading(false);
      setSearchAttempted(false);
      return;
    }
    const timeoutId = setTimeout(() => {
      handleFetchSuggestions(searchTerm);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, handleFetchSuggestions]);

  const handleSearchTermChange = (e) => {
    setSearchTerm(e.target.value);
  };
  const handleSuggestionClick = (link) => {
    console.log("Naviguer vers:", link);
    setSearchTerm("");
    setSuggestions([]);
    setShowSearchModal(false);
  };
  const handleSearchClick = (e) => {
    if (window.innerWidth < 992) {
      setShowSearchModal(true);
    } else {
      inputRef.current?.focus();
    }
  };
  const handleModalClose = () => {
    setShowSearchModal(false);
    setSearchTerm("");
    setSuggestions([]);
    setError(null);
    setLoading(false);
    setSearchAttempted(false);
  };

  const shouldShowSuggestionsContainer =
    searchTerm.length >= 2 && (loading || error || searchAttempted);

  const renderSuggestionsContent = (isMobile = false) => {
    if (!shouldShowSuggestionsContainer) {
      return null;
    }
    let content;
    if (loading) {
      content = (
        <ListGroup.Item className="d-flex align-items-center justify-content-center py-2 text-muted">
          <Spinner animation="border" size="sm" className="me-2" />
          Chargement des produits...
        </ListGroup.Item>
      );
    } else if (error) {
      content = (
        <ListGroup.Item className="text-danger text-center">
          {error}
        </ListGroup.Item>
      );
    } else if (!loading && !error && suggestions.length === 0) {
      content = (
        <ListGroup.Item className="text-muted text-center">
          Aucun produit trouvé pour "{searchTerm}".
        </ListGroup.Item>
      );
    } else {
      content = suggestions.map((product) => (
        <ListGroup.Item
          key={product.id}
          action
          as={NavLink}
          to={product.link}
          onClick={() => handleSuggestionClick(product.link)}
          className="text-decoration-none text-dark text-start"
        >
          {product.name}
        </ListGroup.Item>
      ));
    }
    const listGroupClass = isMobile ? "mt-3" : "";
    return <ListGroup className={listGroupClass}>{content}</ListGroup>;
  };
  // ----------------------------------------------------------------------
  // --- RENDU PRINCIPAL DU COMPOSANT ---
  // ----------------------------------------------------------------------

  return (
    <>
      <Navbar expand="lg" className="p-3 border-bottom border-dark">
        <Container
          fluid
          className="d-flex align-items-center justify-content-center "
        >
          {" "}
          <Navbar.Toggle aria-controls="nav-links-collapse" />
          <Navbar.Brand
            as={(props) => <NavLink to="/" {...props} />}
            className=" d-flex align-items-center  "
          >
            <img src={logo} alt="Foot Market Logo" className="navbar-logo " />
          </Navbar.Brand>
          <Navbar.Collapse id="nav-links-collapse">
            <Nav className="my-2 my-lg-0 nav-links" navbarScroll>
              <Nav.Link as={NavLink} to="/">
                Accueil
              </Nav.Link>
              <Nav.Link as={NavLink} to="/shop">
                Boutique
              </Nav.Link>
              {!isLoggedIn && (
                <Nav.Link as={NavLink} to="/register">
                  Inscription
                </Nav.Link>
              )}
            </Nav>
          </Navbar.Collapse>
          <div className="d-flex align-items-center">
            {/* Groupe de recherche */}
            <div className="search-container ">
              {" "}
              <Form className="d-flex search-group align-items-center ">
                <Button
                  variant="light"
                  className="btn-search d-flex align-items-center justify-content-center"
                  aria-label="Recherche"
                  onClick={handleSearchClick}
                >
                  <IoSearchOutline size={25} />
                </Button>
                <Form.Control
                  ref={inputRef}
                  className="d-none d-lg-block"
                  type="search"
                  placeholder="Rechercher un article"
                  aria-label="Search"
                  value={searchTerm}
                  onChange={handleSearchTermChange}
                />
              </Form>
              {/* SUGGESTIONS DESKTOP */}
              {window.innerWidth >= 992 && shouldShowSuggestionsContainer && (
                <div className="suggestions-list">
                  {renderSuggestionsContent(false)}
                </div>
              )}
            </div>
            <Nav className="nav-icons  d-flex align-items-center">
              {/* 1. PANIER */}
              <Nav.Link as={NavLink} to="/cart" className="p-1 text-dark rel">
                <PiShoppingCartFill size={30} />
                {getCartCount > 0 && (
                  <Badge
                    bg="danger"
                    pill
                    className="position-absolute top-10 start-80 translate-middle"
                  >
                    {getCartCount}
                  </Badge>
                )}
              </Nav.Link>
              {/* 2. Livraison */}
              <Nav.Link
                as={NavLink}
                to="/shipping"
                className="p-1 text-dark"
                aria-label="Livraison utilisateur"
                title="Livraison"
              >
                <FaShippingFast size={30} />
              </Nav.Link>

              {isLoggedIn ? (
                // --- Utilisateur CONNECTÉ : PROFIL + DÉCONNEXION ---
                <>
                  <Nav.Link
                    as={NavLink}
                    to="/profile"
                    className="p-1 text-dark"
                    aria-label="Profil utilisateur"
                    title={`Profil de ${
                      authData?.user_display_name || "Utilisateur"
                    }`}
                  >
                    <PiUserCircleGearFill size={30} />
                  </Nav.Link>

                  <Button
                    variant="link"
                    onClick={handleLogout}
                    className="p-1 text-dark"
                    aria-label="Déconnexion"
                    title="Déconnexion"
                  >
                    <RiLogoutBoxRLine size={30} />
                  </Button>
                </>
              ) : (
                // --- Utilisateur DÉCONNECTÉ : CONNEXION ---
                <Nav.Link
                  as={NavLink}
                  to="/login"
                  className="p-1 text-dark"
                  aria-label="Connexion ou inscription"
                  title="Connexion"
                >
                  <BiSolidUserCircle size={30} />
                </Nav.Link>
              )}
            </Nav>
          </div>
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
                if (searchTerm.length >= 2 && suggestions.length > 0) {
                  handleSuggestionClick(suggestions[0].link);
                } else if (searchTerm.length >= 2) {
                  console.log("Recherche complète pour :", searchTerm);
                  setShowSearchModal(false);
                }
              }}
            >
              <Form.Control
                autoFocus
                type="search"
                placeholder="Rechercher un article"
                aria-label="Search"
                value={searchTerm}
                onChange={handleSearchTermChange}
              />
            </Form>

            {/* SUGGESTIONS MOBILE (dans la modale) */}
            {renderSuggestionsContent(true)}
          </Modal.Body>
        </Modal>
      </Navbar>
    </>
  );
}

export default NavScrollExample;
