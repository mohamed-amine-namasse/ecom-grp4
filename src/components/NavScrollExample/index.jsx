import React, { useState, useRef, useCallback, useEffect } from "react";
import { useCart } from "../CartContext"; // Assurez-vous que le chemin est correct
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { PiShoppingCartFill } from "react-icons/pi";
import { BiSolidUserCircle } from "react-icons/bi";
import { NavLink } from "react-router";
import { IoSearchOutline } from "react-icons/io5";
import { PiUserCircleGearFill } from "react-icons/pi";
import { RiLogoutBoxRLine } from "react-icons/ri";
import { FaShippingFast } from "react-icons/fa";
import Modal from "react-bootstrap/Modal";
import ListGroup from "react-bootstrap/ListGroup";
import Spinner from "react-bootstrap/Spinner";
import Badge from "react-bootstrap/Badge";
import "./style.css";

// ----------------------------------------------------------------------
// --- CONFIGURATION WOOCOMMERCE ---
// ----------------------------------------------------------------------

const WOOCOMMERCE_BASE_URL =
  "https://mohamed-amine-namasse.students-laplateforme.io/wordpress-eco/wordpress/";

const CONSUMER_KEY = "ck_ae0703c9b00197c41256d3da1618e3e0209c7fc2";
const CONSUMER_SECRET = "cs_a79c66ab51106107de3d3355a0a015909629e3fc";

// ----------------------------------------------------------------------
// --- FONCTION DE RÉCUPÉRATION DES PRODUITS WOOCOMMERCE (AUTHENTIFIÉE) ---
// ----------------------------------------------------------------------

/**
 * Récupère les suggestions de produits de l'API WooCommerce en utilisant l'authentification Basic Auth.
 *
 * @param {string} query Terme de recherche de l'utilisateur.
 * @returns {Promise<Array<{id: number, name: string, link: string}>>} Liste des produits.
 */
const fetchWooCommerceProducts = async (query) => {
  if (!query || query.length < 2) {
    return [];
  }

  if (
    !CONSUMER_KEY ||
    !CONSUMER_SECRET ||
    CONSUMER_KEY.includes("votre_") ||
    CONSUMER_SECRET.includes("votre_")
  ) {
    // Afficher l'erreur si les clés par défaut sont toujours présentes
    throw new Error(
      "Clés WooCommerce manquantes. Veuillez remplir CONSUMER_KEY et CONSUMER_SECRET."
    );
  }

  // Encodage en Base64 des clés pour Basic Auth
  const authHeader = "Basic " + btoa(`${CONSUMER_KEY}:${CONSUMER_SECRET}`);

  // Construction de l'URL de l'API REST pour les produits.
  const apiUrl = `${WOOCOMMERCE_BASE_URL}wp-json/wc/v3/products?search=${query}&per_page=5&status=publish`;

  try {
    // Appel AVEC en-tête d'autorisation (Basic Auth)
    const response = await fetch(apiUrl, {
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader, // Ajout de l'authentification
      },
    });

    if (!response.ok) {
      // Si l'API retourne un statut d'erreur (4xx ou 5xx)
      let errorDetails = `Statut: ${response.status} ${response.statusText}`;
      try {
        const errorBody = await response.json();
        errorDetails += `. Message API: ${errorBody.message || "Non spécifié"}`;
      } catch (e) {
        errorDetails += ". Corps de réponse non-JSON.";
      }

      console.error("Erreur API WooCommerce:", errorDetails);
      throw new Error(`Erreur lors de l'appel à l'API. ${errorDetails}`);
    }

    const data = await response.json();

    return data.map((product) => ({
      id: product.id,
      name: product.name,
      // Utilisation du permalink retourné par l'API pour la redirection
      link: `/product/${product.id}`,
    }));
  } catch (error) {
    // Si la requête fetch elle-même échoue (erreur réseau, CORS, timeout)
    console.error(
      "Échec de la recherche de produits (Network/CORS/Fetch):",
      error
    );
    // Propager une erreur claire pour l'affichage dans l'interface
    throw new Error(
      `Échec de connexion réseau. Cause probable: Erreur CORS ou URL/Clés incorrectes. Vérifiez la console (F12) pour plus de détails.`
    );
  }
};

// ----------------------------------------------------------------------
// --- COMPONENT PRINCIPAL ---
// ----------------------------------------------------------------------

function NavScrollExample() {
  const [showSearchModal, setShowSearchModal] = useState(false);
  const inputRef = useRef(null);

  // ÉTATS D'AUTHENTIFICATION SIMULÉE
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Mis à 'true' par défaut pour tester les 3 boutons

  // Fonction pour simuler la déconnexion
  const handleLogout = () => {
    setIsLoggedIn(false);
    console.log("Déconnexion simulée.");
  };

  // Fonction pour simuler la navigation (Connexion ou Profil)
  const handleLoginOrProfileNavigation = () => {
    if (isLoggedIn) {
      console.log("Naviguer vers la page de Profil.");
    } else {
      console.log("Naviguer vers la page de Connexion. (Simuler connexion)");
      // Optionnel: Simuler la connexion après un clic si l'utilisateur est déconnecté
      // setIsLoggedIn(true);
    }
  };

  // Fonction pour simuler la navigation vers le panier
  const handleCartNavigation = () => {
    console.log("Naviguer vers la page du Panier.");
    // Dans une vraie app, vous utiliseriez 'navigate("/cart")'
  };

  // HOOKS : useCart non disponible, on simule le compte
  const { getCartCount } = useCart(); // Récupération de la fonction de comptage

  // ÉTATS POUR L'AUTOCOMPLÉTION
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchAttempted, setSearchAttempted] = useState(false);

  // Fonction pour appeler l'API (débounced)
  const handleFetchSuggestions = useCallback(async (query) => {
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
        e.message || "Une erreur inconnue s'est produite lors de la recherche."
      );
      setSuggestions([]);
      console.error("Erreur gérée lors de la recherche:", e);
    }

    setLoading(false);
  }, []);

  // Logique de Debounce
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

  // Gestionnaire de changement pour l'input de recherche
  const handleSearchTermChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Gestionnaire de clic sur une suggestion (simule la navigation)
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

  // ----------------------------------------------------------------------
  // --- RENDU DES SUGGESTIONS (LOGIQUE CENTRALISÉE) ---
  // ----------------------------------------------------------------------

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
          action // Ajout pour le style de survol Bootstrap
          as={NavLink}
          to={product.link} // Utilise le lien local: /produit/id
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
        <Container fluid className="d-flex align-items-center">
          {" "}
          <Navbar.Toggle aria-controls="nav-links-collapse" className="me-4" />
          <Navbar.Brand
            as={(props) => <a href="/" {...props} />}
            to="/"
            className=" d-flex align-items-center"
          >
            {/* ---------------------------------------------------- */}
            {/* L'image de votre logo est ajoutée ici */}
            {/* ---------------------------------------------------- */}
            <img
              src="../images/LOGO.jpg" // REMPLACEZ CETTE URL PAR L'URL DE VOTRE LOGO HEBERGÉ
              alt="Foot Market Logo"
              className="navbar-logo" // Classe pour le style
            />
          </Navbar.Brand>
          {/* liens à l'intérieur du collapse */}
          <Navbar.Collapse id="nav-links-collapse">
            <Nav className="my-2 my-lg-0 nav-links" navbarScroll>
              <Nav.Link as={NavLink} to="/">
                Accueil
              </Nav.Link>
              <Nav.Link as={NavLink} to="/shop">
                Boutique
              </Nav.Link>
              {/* CONDITIONNEL : AFFICHER INSCRIPTION SEULEMENT SI NON CONNECTÉ */}
              {!isLoggedIn && (
                <Nav.Link as={NavLink} to="/register">
                  Inscription
                </Nav.Link>
              )}
            </Nav>
          </Navbar.Collapse>
          {/* groupe de recherche */}
          <div className="search-container">
            {" "}
            <Form className="d-flex search-group align-items-center ">
              <Button
                variant="outline-dark"
                className="btn-search d-flex align-items-center justify-content-center"
                aria-label="Recherche"
                onClick={handleSearchClick}
              >
                {/* Icône de recherche corrigée */}
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
              <div
                className="suggestions-list"
                // Styles ajoutés pour simuler le CSS du fichier externe et positionner la liste
              >
                {renderSuggestionsContent(false)}
              </div>
            )}
          </div>
          {/* icons restent visibles en mobile */}
          <Nav className="nav-icons  d-flex align-items-center">
            {/* 1. PANIER (toujours visible) */}
            <Nav.Link
              as={NavLink}
              to="/cart"
              className="p-1 text-dark"
              style={{ position: "relative" }}
              onClick={handleCartNavigation}
            >
              {/* Icône de panier corrigée */}
              <PiShoppingCartFill size={30} />
              {/* Badge de notification */}
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
                {/* 3. PROFIL (Lien vers /profile) */}
                <Nav.Link
                  as={NavLink}
                  to="/profile"
                  className="p-1 text-dark"
                  aria-label="Profil utilisateur"
                  title="Profil"
                  onClick={handleLoginOrProfileNavigation}
                >
                  {/* Icône de profil corrigée */}
                  <PiUserCircleGearFill size={30} />
                </Nav.Link>

                {/* 4. DÉCONNEXION (Action) */}
                <Button
                  variant="link"
                  onClick={handleLogout}
                  className="p-1 text-dark"
                  aria-label="Déconnexion"
                  title="Déconnexion"
                >
                  {/* Icône de déconnexion corrigée, stylisée en rouge */}
                  <RiLogoutBoxRLine size={30} />
                </Button>
              </>
            ) : (
              // --- Utilisateur DÉCONNECTÉ : CONNEXION ---
              // 2. CONNEXION (Lien vers /login)
              <Nav.Link
                as={NavLink}
                to="/login"
                className="p-1 text-dark"
                aria-label="Connexion ou inscription"
                title="Connexion"
                onClick={handleLoginOrProfileNavigation}
              >
                {/* Icône de connexion corrigée */}
                <BiSolidUserCircle size={30} />
              </Nav.Link>
            )}
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
                // Simuler une recherche si l'utilisateur appuie sur Entrée
                if (searchTerm.length >= 2 && suggestions.length > 0) {
                  handleSuggestionClick(suggestions[0].link);
                } else if (searchTerm.length >= 2) {
                  // Optionnel : rediriger vers une page de résultats de recherche complète
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
