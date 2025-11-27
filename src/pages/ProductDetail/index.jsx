import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom"; // Assurez-vous d'importer Link de 'react-router-dom'
import { useCart } from "../../components/CartContext";
import "./style.css";

// --- CONFIGURATION WOOCOMMERCE ---
const WOOCOMMERCE_FULL_URL =
  "https://mohamed-amine-namasse.students-laplateforme.io/wordpress-eco/wordpress";
const CONSUMER_KEY = "ck_ae0703c9b00197c41256d3da1618e3e0209c7fc2";
const CONSUMER_SECRET = "cs_a79c66ab51106107de3d3355a0a015909629e3fc";
// ---------------------------------

// Fonction utilitaire pour le formatage du prix
const formatPrice = (p) =>
  p.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

// Nouveau composant : Affiche les étoiles de notation
const RatingStars = ({ rating }) => {
  // Crée un tableau de 5 éléments. Remplit les X premières avec une étoile pleine (★) et le reste avec une étoile vide (☆).
  const fullStars = Math.round(rating);
  const emptyStars = 5 - fullStars;

  return (
    <span className="rating-stars">
      {"★".repeat(fullStars)}
      {"☆".repeat(emptyStars)}
    </span>
  );
};

function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [reviews, setReviews] = useState([]);
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // --- ÉTAT POUR LE MESSAGE FLASH ---
  const [showFlash, setShowFlash] = useState(false);
  // --- NOUVEAUX ÉTATS POUR LE FORMULAIRE D'AVIS ---
  const [reviewForm, setReviewForm] = useState({
    reviewer: "",
    reviewer_email: "",
    review: "",
    rating: 5, // Note par défaut 5 étoiles
  });
  const [reviewSubmitStatus, setReviewSubmitStatus] = useState(null); // 'success', 'error', 'submitting', null
  //  État pour gérer l'onglet actif ('description' ou 'additional_info')
  const [activeTab, setActiveTab] = useState("description");
  // 1. Définition de l'URL pour la récupération des avis (hors useEffect)
  const API_REVIEWS_URL = `${WOOCOMMERCE_FULL_URL}/wp-json/wc/v3/products/reviews?product=${id}&consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`;

  // 2. Définition de la fonction de récupération des avis (hors useEffect)
  const fetchReviews = async () => {
    try {
      const response = await fetch(API_REVIEWS_URL);
      if (!response.ok) {
        console.warn(
          "Impossible de charger les avis. Statut:",
          response.status
        );
        setReviews([]);
        return;
      }
      const data = await response.json(); // Mapper les données d'avis

      const formattedReviews = data.map((review) => ({
        id: review.id,
        reviewerName: review.reviewer,
        rating: review.rating,
        review: review.review,
        date: new Date(review.date_created).toLocaleDateString("fr-FR"),
      }));

      setReviews(formattedReviews);
    } catch (err) {
      console.error("Erreur lors de la récupération des avis:", err);
      setReviews([]);
    }
  };

  // Fonction pour ajouter au panier
  const handleAddToCart = () => {
    if (product) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      });
      // MIS À JOUR : Afficher le message flash, sans timeout
      setShowFlash(true);
    }
  };

  // NOUVEAU : Fonction pour fermer le flash manuellement
  const handleCloseFlash = () => {
    setShowFlash(false);
  };

  // Fonction pour gérer l'envoi du formulaire d'avis
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewSubmitStatus("submitting");
    setError(null); // Vérification des champs obligatoires

    if (!reviewForm.review || !reviewForm.rating) {
      setError("Veuillez remplir tous les champs et donner une note.");
      setReviewSubmitStatus(null);
      return;
    }
    // Générer un nom d'utilisateur anonyme unique si le champ est vide
    const reviewerNameToSend = reviewForm.reviewer
      ? reviewForm.reviewer
      : `Anonyme #${Math.floor(Math.random() * 10000)}`;
    const API_POST_REVIEW_URL = `${WOOCOMMERCE_FULL_URL}/wp-json/wc/v3/products/reviews`;

    try {
      const response = await fetch(
        `${API_POST_REVIEW_URL}?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            product_id: id, // L'ID du produit
            review: reviewForm.review,
            reviewer: reviewerNameToSend,
            reviewer_email: reviewForm.reviewer_email,
            rating: reviewForm.rating,
            status: "approved",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Erreur lors de l'envoi de l'avis: ${response.statusText}`
        );
      } // L'avis a été soumis (il sera probablement en statut "en attente" dans WP)

      setReviewSubmitStatus("success"); // OPTIONNEL : Réinitialiser le formulaire après succès
      await fetchReviews();
      setReviewForm({
        reviewer: "",
        reviewer_email: "",
        review: "",
        rating: 5,
      });
    } catch (err) {
      console.error("Erreur d'envoi d'avis:", err);
      setError("Impossible d'envoyer l'avis. Veuillez réessayer.");
      setReviewSubmitStatus("error");
    }
  };

  // --- APPEL API POUR UN PRODUIT SPÉCIFIQUE ---
  useEffect(() => {
    if (!id) {
      setError("ID de produit manquant.");
      setIsLoading(false);
      return;
    }

    const API_PRODUCT_URL = `${WOOCOMMERCE_FULL_URL}/wp-json/wc/v3/products/${id}?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`;

    // 1. Récupération du Produit
    const fetchProduct = async () => {
      try {
        const response = await fetch(API_PRODUCT_URL);
        if (response.status === 404) throw new Error("Produit non trouvé.");
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        const data = await response.json();

        // ... (Mapping des données produit, inchangé)
        const price = data.sale_price
          ? parseFloat(data.sale_price)
          : parseFloat(data.regular_price);
        const regularPrice = parseFloat(data.regular_price);
        const fullDescription = data.description
          ? data.description
          : "<p>Aucune description détaillée disponible.</p>";
        const shortDescription = data.short_description
          ? data.short_description
          : "";
        // LOGIQUE DE DESCRIPTION AFFICHÉE (à côté du produit)
        let displayDescription = shortDescription;

        // Si la description courte est vide, on utilise un extrait de la description longue
        if (!displayDescription || displayDescription === "<p></p>\n") {
          // Supprimer les balises HTML de la description longue pour obtenir un extrait de texte propre
          const plainTextDescription = fullDescription.replace(
            /<[^>]*>?/gm,
            " "
          );

          if (plainTextDescription.length > 10) {
            // Prendre les 150 premiers caractères et ajouter des points de suspension
            displayDescription =
              plainTextDescription.substring(0, 1000).trim() + "[...]";
            // Remettre le texte dans un paragraphe pour le style
            displayDescription = `<p>${displayDescription}</p>`;
          } else {
            displayDescription = "";
          }
        }
        const imageUrl =
          data.images.length > 0
            ? data.images[0].src
            : "https://via.placeholder.com/600x450?text=Image+Manquante";
        const isOutOfStock = data.stock_status === "outofstock";
        const attributes = data.attributes
          .filter(
            (attr) => attr.visible && attr.options && attr.options.length > 0
          )
          .map((attr) => ({
            name: attr.name,
            options: attr.options.join(", "),
          }));

        setProduct({
          id: data.id,
          name: data.name,
          price: price || 0,
          regularPrice: regularPrice || 0,
          description: fullDescription,
          shortDescription: shortDescription,
          displayDescription: displayDescription,
          image: imageUrl,
          stock_status: data.stock_status,
          isOutOfStock,
          attributes,
        });

        // 2. Récupération des Avis (après avoir récupéré le produit avec succès)
        await fetchReviews();

        setError(null);
      } catch (err) {
        console.error("Erreur de récupération du produit ou des avis:", err);
        setError(
          `Impossible de charger les détails du produit: ${err.message}`
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (isLoading) {
    return (
      <main className="product-detail-container loading-state">
        <p>Chargement des détails du produit...</p>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="product-detail-container error-state">
        <div className="alert alert-danger">
          <h2>Erreur</h2>
          <p>{error || "Détails du produit introuvables."}</p>
          <Link to="/shop">Retour à la boutique</Link>
        </div>
      </main>
    );
  }
  // Calcul de la note moyenne et du nombre d'avis
  const totalReviews = reviews.length;

  let averageRating = 0;
  if (totalReviews > 0) {
    const sumRatings = reviews.reduce((sum, review) => sum + review.rating, 0);
    averageRating = sumRatings / totalReviews;
  }
  // --- RENDU DU CONTENU DE L'ONGLET ACTIF ---
  const renderTabContent = () => {
    if (activeTab === "description") {
      // Description : utilisation de dangerouslySetInnerHTML pour le HTML de WooCommerce
      return (
        <div
          className="tab-content description-content"
          dangerouslySetInnerHTML={{ __html: product.description }}
        />
      );
    }

    // 2. Onglet INFORMATIONS COMPLÉMENTAIRES
    if (activeTab === "additional_info") {
      // Cas où il n'y a pas d'attributs
      if (product.attributes.length === 0) {
        return (
          <div className="tab-content no-additional-info">
            <p>
              Aucune information complémentaire n'est disponible pour ce
              produit.
            </p>
          </div>
        );
      }

      // Cas où il y a des attributs à afficher
      return (
        <div className="tab-content additional-info-content">
          <table className="attributes-table">
            <tbody>
              {product.attributes.map((attr, index) => (
                <tr key={index}>
                  <th>{attr.name}</th>
                  <td>{attr.options}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // 3. Onglet AVIS (DOIT ÊTRE AU NIVEAU RACINE)
    if (activeTab === "reviews") {
      return (
        <div className="tab-content reviews-content">
          <h2>Avis ({reviews.length})</h2>
          <hr />
          {reviews.length === 0 ? (
            // CAS 1 : Aucune revue n'existe
            <div className="no-reviews-prompt">
              <p>
                Il n’y a pas encore d’avis. Soyez le premier à laisser votre
                avis sur
                <strong> {product.name}</strong>.
              </p>
            </div>
          ) : (
            // CAS 2 : Les revues existent, on les affiche
            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review.id} className="review-item">
                  <div className="review-header">
                    <span className="reviewer-name">
                      {review.reviewerName ? review.reviewerName : "Guest"}
                    </span>
                    <span className="review-date">- le {review.date}</span>
                    <RatingStars rating={review.rating} />
                  </div>
                  <div
                    className="review-body"
                    dangerouslySetInnerHTML={{ __html: review.review }}
                  />
                </div>
              ))}
            </div>
          )}
          {/* FORMULAIRE D'AJOUT D'AVIS */}
          <div className="add-review-section">
            <h3>Ajouter votre avis</h3>
            <hr />
            {/* Messages de statut */}
            {reviewSubmitStatus === "success" && (
              <div className="alert-success">
                Merci pour votre avis ! Il a été publié avec succès.
              </div>
            )}
            {reviewSubmitStatus === "error" && (
              <div className="alert-error">
                Erreur lors de l'envoi : {error}
              </div>
            )}
            <form onSubmit={handleSubmitReview} className="review-form">
              {/* 1. NOTATION ÉTOILES */}
              <div className="form-group review-rating">
                <label>
                  Votre note : <span className="required-star">*</span>
                </label>

                {/* Le sélecteur d'étoiles permet de choisir entre 1 et 5 */}

                <select
                  value={reviewForm.rating}
                  onChange={(e) =>
                    setReviewForm({
                      ...reviewForm,
                      rating: parseInt(e.target.value),
                    })
                  }
                  required
                >
                  <option value={5}>★★★★★ (Parfait)</option>
                  <option value={4}>★★★★☆ (Très bon)</option>
                  <option value={3}>★★★☆☆ (Moyen)</option>
                  <option value={2}>★★☆☆☆ (Mauvais)</option>
                  <option value={1}>★☆☆☆☆ (Très mauvais)</option>
                </select>
              </div>
              {/* 2. CHAMP AVIS (COMMENTAIRE) */}
              <div className="form-group">
                <label htmlFor="review_content">
                  Votre avis <span className="required-star">*</span>
                </label>

                <textarea
                  id="review_content"
                  value={reviewForm.review}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, review: e.target.value })
                  }
                  required
                  rows="5"
                  className="w-50"
                  placeholder="Écrivez votre commentaire ici..."
                />
              </div>
              <button
                type="submit"
                disabled={reviewSubmitStatus === "submitting"}
                className="btn-submit-review "
              >
                {reviewSubmitStatus === "submitting"
                  ? "Envoi..."
                  : "Soumettre l'avis"}
              </button>
            </form>
          </div>
        </div>
      );
    }

    return null; // Onglet non reconnu
  };

  // Rendu des détails
  return (
    <main className="product-detail-container">
      <Link to="/shop" className="back-link">
        &larr; Retour à la boutique
      </Link>

      {/* Message Flash d'ajout au panier avec bouton de fermeture */}
      {showFlash && (
        <div className="flash-message-cart">
          <p>✅ Le produit **{product.name}** a été ajouté à votre panier.</p>
          <div className="flash-actions">
            <Link to="/cart" className="btn-view-cart">
              Voir le panier
            </Link>
            <button
              className="btn-close-flash"
              onClick={handleCloseFlash}
              aria-label="Fermer la notification d'ajout au panier"
            >
              &times;
            </button>
          </div>
        </div>
      )}
      {/* FIN MESSAGE FLASH */}

      <div className="product-content">
        <div className="product-image-area">
          <img src={product.image} alt={product.name} />
          {product.isOutOfStock && (
            <div className="product-badge out-of-stock">Rupture de Stock</div>
          )}
        </div>

        <div className="product-info-area">
          <h1 className="product-name">{product.name}</h1>
          {totalReviews > 0 && (
            <div className="product-header-reviews">
              {/* Utilisation du composant RatingStars avec la note moyenne calculée */}
              <RatingStars rating={averageRating} />
              <span className="review-count">({totalReviews} avis)</span>
            </div>
          )}

          <div className="price-section">
            {product.price < product.regularPrice && (
              <span className="old-price">
                {formatPrice(product.regularPrice)}
              </span>
            )}

            <span className="current-price">{formatPrice(product.price)}</span>
          </div>
          {product.displayDescription && (
            <div
              className="product-excerpt-description" // Utilisation d'une nouvelle classe claire
              dangerouslySetInnerHTML={{ __html: product.displayDescription }}
            />
          )}
          <button
            className="btn-add-to-cart"
            type="button"
            disabled={product.isOutOfStock}
            onClick={handleAddToCart}
          >
            {product.isOutOfStock ? "Indisponible" : "Ajouter au panier"}
          </button>
        </div>
      </div>
      {/* Section des onglets (Tabs) */}
      <div className="product-tabs-section">
        {/* En-têtes des onglets */}
        <div className="tab-headers">
          <button
            className={`tab-header ${
              activeTab === "description" ? "active" : ""
            }`}
            onClick={() => setActiveTab("description")}
          >
            Description
          </button>

          <button
            className={`tab-header ${
              activeTab === "additional_info" ? "active" : ""
            }`}
            onClick={() => setActiveTab("additional_info")}
          >
            Informations complémentaires
          </button>

          <button
            className={`tab-header ${activeTab === "reviews" ? "active" : ""}`}
            onClick={() => setActiveTab("reviews")}
          >
            Avis ({reviews.length})
          </button>
        </div>

        <div className="tab-content-wrapper">{renderTabContent()}</div>
      </div>
    </main>
  );
}

export default ProductDetail;
