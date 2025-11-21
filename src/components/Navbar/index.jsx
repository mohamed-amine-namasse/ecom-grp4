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

// ----------------------------------------------------------------------
// --- CONFIGURATION WOOCOMMERCE ---
// ----------------------------------------------------------------------

// URL de base de votre site WordPress/WooCommerce.
// NOTE : L'erreur 401 indique que l'accès anonyme est refusé.
// NOUS DEVONS UTILISER LES CLÉS DE CONSOMMATEUR POUR L'AUTHENTIFICATION.
const WOOCOMMERCE_BASE_URL =
  "https://mohamed-amine-namasse.students-laplateforme.io/wordpress-eco/wordpress/";

// !!! ATTENTION SECURITÉ !!!
// REMPLACEZ CES CHAÎNES DITES QUE CELA EST LA VERSION AVEC VOS VRAIES CLÉS.
// L'UTILISATION DE CES CLÉS EN CLAIR CÔTÉ CLIENT (FRONT-END) EST DANGEREUSE EN PRODUCTION.
// EN PRODUCTION, VOUS DEVEZ UTILISER UN SERVEUR PROXY.
const CONSUMER_KEY = "ck_ae0703c9b00197c41256d3da1618e3e0209c7fc2"; // <--- CLÉ UTILISÉE POUR L'AUTH
const CONSUMER_SECRET = "cs_a79c66ab51106107de3d3355a0a015909629e3fc"; // <--- SECRET UTILISÉ POUR L'AUTH

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
      link: product.permalink || `/shop/${product.slug}`,
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

  // ÉTATS POUR L'AUTOCOMPLÉTION
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // Utilisé uniquement pour les erreurs d'API/réseau

  // Fonction pour appeler l'API (débounced)
  const handleFetchSuggestions = useCallback(async (query) => {
    // N'appelle l'API que si le terme de recherche a au moins 2 caractères
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
      // Afficher l'erreur d'API/réseau dans l'interface utilisateur
      setError(
        e.message || "Une erreur inconnue s'est produite lors de la recherche."
      );
      setSuggestions([]);
      console.error("Erreur gérée lors de la recherche:", e);
    }

    setLoading(false); // S'assurer que le loading est désactivé APRÈS la fin de l'appel
  }, []);

  // Logique de Debounce: déclenche la recherche seulement après 500ms d'inactivité
  useEffect(() => {
    // Annuler la recherche si l'utilisateur efface le terme
    if (searchTerm.length < 2) {
      return;
    }

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
    // Dans une vraie app, vous utiliseriez 'navigate(link)' de react-router-dom

    setSearchTerm("");
    setSuggestions([]);
    setShowSearchModal(false); // Ferme la modale mobile
  };

  const handleSearchClick = (e) => {
    // Si mobile (< 992px), ouvre la modale
    if (window.innerWidth < 992) {
      setShowSearchModal(true);
    } else {
      // Sur desktop, focus l'input
      inputRef.current?.focus();
    }
  };

  const handleModalClose = () => {
    setShowSearchModal(false);
    setSearchTerm(""); // Réinitialise la recherche en fermant
    setSuggestions([]);
    setError(null);
    setLoading(false); // S'assurer que tout est bien réinitialisé
  };

  // ----------------------------------------------------------------------
  // --- RENDU DES SUGGESTIONS (LOGIQUE CENTRALISÉE) ---
  // ----------------------------------------------------------------------

  // Variable pour déterminer s'il faut afficher le conteneur de suggestions.
  const shouldShowSuggestionsContainer =
    searchTerm.length >= 2 &&
    (loading ||
      error ||
      suggestions.length > 0 ||
      (!loading && !error && suggestions.length === 0));

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
    } else if (suggestions.length === 0) {
      // Cas où l'API est contactée avec succès mais retourne 0 résultat
      content = (
        <ListGroup.Item className="text-muted text-center">
          Aucun produit trouvé pour "{searchTerm}".
        </ListGroup.Item>
      );
    } else {
      // Affichage des résultats
      content = suggestions.map((product) => (
        <ListGroup.Item
          key={product.id}
          action
          onClick={() => handleSuggestionClick(product.link)}
        >
          {product.name}
        </ListGroup.Item>
      ));
    }

    // Le style de ListGroup diffère légèrement (pas de 'mt-3' sur desktop par exemple)
    const listGroupClass = isMobile ? "mt-3" : "";

    return <ListGroup className={listGroupClass}>{content}</ListGroup>;
  };

  return (
    <Navbar expand="lg" className="p-3">
      <Container fluid className="d-flex align-items-center">
        {" "}
        <Navbar.Toggle aria-controls="nav-links-collapse" className="me-4" />
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
        <div className="search-container me-0 ms-auto">
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
              <ListGroup className="suggestions-list">
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
          <Nav.Link as={NavLink} to="/login" className="p-1">
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
