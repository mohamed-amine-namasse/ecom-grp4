import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { useCart } from "../../components/CartContext";
import { useAuth } from "../../components/AuthContext";
import "./style.css";
import { API_CONFIG } from "../../config/api_shop";
// Fonction utilitaire pour le formatage du prix
const formatPrice = (p) =>
  p.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

//  Affiche les étoiles de notation
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
  const { addToCart, cartItems } = useCart();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addedQuantity, setAddedQuantity] = useState(0);
  // --- ÉTAT POUR LE MESSAGE FLASH ---
  const [showFlash, setShowFlash] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [productVariations, setProductVariations] = useState([]);
  const [selectedVariation, setSelectedVariation] = useState(null); // Variation complète sélectionnée
  const [flashSize, setFlashSize] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [availableSizes, setAvailableSizes] = useState([]);
  const [flashColor, setFlashColor] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [availableColors, setAvailableColors] = useState([]);

  const [showStockFlash, setShowStockFlash] = useState(false);
  const [stockFlashMessage, setStockFlashMessage] = useState("");

  //  ÉTATS POUR LE PRIX D'AFFICHAGE (DYNAMIQUE)
  const [displayPrice, setDisplayPrice] = useState(null);
  const [displayRegularPrice, setDisplayRegularPrice] = useState(null);

  // FONCTION pour fermer le flash de stock
  const handleCloseStockFlash = () => {
    setShowStockFlash(false);
    setStockFlashMessage("");
  };

  // ---  ÉTATS POUR LE FORMULAIRE D'AVIS ---
  const [reviewForm, setReviewForm] = useState({
    reviewer: "",
    reviewer_email: "",
    review: "",
    rating: 5,
  });
  const [reviewSubmitStatus, setReviewSubmitStatus] = useState(null); // 'success', 'error', 'submitting', null

  //  État pour gérer l'onglet actif ('description' ou 'additional_info')
  const [activeTab, setActiveTab] = useState("description");

  // . Définition de la fonction de récupération des avis (hors useEffect)
  const fetchReviews = async () => {
    try {
      // On utilise baseUrl + le endpoint reviews filtré par ID produit
      // On réutilise la logique de AUTH (ck/cs) via une construction manuelle simple

      const response = await fetch(
        `${API_CONFIG.baseUrl}/wp-json/wc/v3/products/reviews?product=${id}&${API_CONFIG.auth}`,
      );
      if (!response.ok) {
        console.warn(
          "Impossible de charger les avis. Statut:",
          response.status,
        );
        setReviews([]);
        return;
      }
      const data = await response.json();

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

  // 3. Fonction pour obtenir la quantité actuelle dans le panier
  const getProductQuantityInCart = (productId) => {
    const item = cartItems.find((item) => item.id === productId);
    return item ? item.quantity : 0;
  };

  // Fonction pour ajouter au panier
  const handleAddToCart = () => {
    // 1. Fermer les messages flash précédents
    handleCloseFlash();
    handleCloseStockFlash();

    // S'assurer que la quantité est un nombre valide (minimum 1)
    const quantityToAdd = Math.max(1, parseInt(quantity, 10));

    if (product) {
      //  Utiliser la variation sélectionnée pour le stock et l'ID
      const stockSource = selectedVariation || product;

      // Vérification des sélections obligatoires
      if (availableColors.length > 0 && !selectedColor) {
        setStockFlashMessage(
          "Veuillez sélectionner une couleur avant d'ajouter au panier.",
        );
        setShowStockFlash(true);
        return;
      }
      if (availableSizes.length > 0 && !selectedSize) {
        setStockFlashMessage(
          "Veuillez sélectionner une pointure avant d'ajouter au panier.",
        );
        setShowStockFlash(true);
        return;
      }
      // Si le produit est variable et qu'aucune variation n'est sélectionnée, c'est une erreur de logique
      if (
        productVariations.length > 0 &&
        !selectedVariation &&
        (availableColors.length > 0 || availableSizes.length > 0)
      ) {
        setStockFlashMessage(
          "La combinaison Couleur/Pointure sélectionnée n'est pas disponible en stock ou n'existe pas.",
        );
        setShowStockFlash(true);
        return;
      }

      // Récupération des données de stock de la source
      const currentQuantityInCart = getProductQuantityInCart(stockSource.id);
      const quantityAfterAdd = currentQuantityInCart + quantityToAdd;
      const maxStock = stockSource.stock_quantity;
      const manageStock = stockSource.manage_stock;

      //  VÉRIFICATION DE LA QUANTITÉ MAXIMALE
      if (manageStock && maxStock !== null && quantityAfterAdd > maxStock) {
        // Cas d'erreur : stock dépassé
        let message = `Vous ne pouvez pas ajouter cette quantité dans le panier.`;

        if (currentQuantityInCart >= maxStock) {
          message = `Vous avez déjà atteint le maximum ! Nous en avons ${maxStock} en stock et vous en avez déjà ${currentQuantityInCart} dans votre panier.`;
        } else {
          const remainingStock = maxStock - currentQuantityInCart;
          message = `Vous ne pouvez pas ajouter ${quantityToAdd} article(s) dans le panier. Nous avons ${maxStock} en stock et vous en avez déjà ${currentQuantityInCart}. Vous pouvez encore ajouter ${remainingStock} de cet article.`;
        }

        setStockFlashMessage(message);
        setShowStockFlash(true);
        return;
      }

      // Si le stock est suffisant (ou non géré), continuer l'ajout
      const itemToAdd = {
        //  UTILISER L'ID DE LA VARIATION SI DISPONIBLE
        id: stockSource.id,
        // Créer un nom plus précis pour le panier
        name:
          product.name +
          (selectedColor ? ` - ${selectedColor}` : "") +
          (selectedSize ? ` / ${selectedSize}` : ""),
        //  UTILISER LE PRIX D'AFFICHAGE ACTUEL
        price: displayPrice || product.price,
        // Utiliser l'image de la variation si elle existe
        image:
          stockSource.image && stockSource.image.src
            ? stockSource.image.src
            : product.image,
        selectedSize: selectedSize,
        selectedColor: selectedColor,
        manageStock: manageStock,
        stockQuantity: maxStock,
      };

      addToCart(itemToAdd, quantityToAdd);
      setAddedQuantity(quantityToAdd);
      setFlashSize(selectedSize);
      setFlashColor(selectedColor);
      setShowFlash(true);
    }
  };

  // Fonction pour fermer le flash manuellement
  const handleCloseFlash = () => {
    setShowFlash(false);
  };

  // Fonction pour gérer l'envoi du formulaire d'avis
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewSubmitStatus("submitting");
    setError(null);

    // Vérification des champs obligatoires
    if (!reviewForm.review || !reviewForm.rating) {
      setError("Veuillez remplir tous les champs et donner une note.");
      setReviewSubmitStatus(null);
      return;
    }

    //  LOGIQUE CRUCIALE : DÉTERMINATION DU NOM ET DE L'EMAIL À ENVOYER

    // 1. Détermination du Nom (Reviewer)
    const reviewerNameToSend =
      isAuthenticated && user?.username
        ? user.username // Utilisateur connecté : utiliser le nom d'utilisateur
        : `Anonyme #${Math.floor(Math.random() * 10000)}`; // Déconnecté : générer un nom

    // 2. Détermination de l'Email (Reviewer Email)
    const reviewerEmailToSend =
      isAuthenticated && user?.email
        ? user.email // Utilisateur connecté : utiliser l'email
        : "guest@example.com"; // Déconnecté : utiliser un email par défaut (souvent requis par l'API)

    // Si l'utilisateur est déconnecté et n'a pas de champ email, il pourrait y avoir une erreur
    // si l'API n'accepte pas "guest@example.com". C'est la meilleure approximation sans champ d'entrée.

    try {
      const response = await fetch(
        `${API_CONFIG.baseUrl}/wp-json/wc/v3/products/reviews?&${API_CONFIG.auth}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            product_id: id,
            review: reviewForm.review,
            //  UTILISER LES VALEURS DÉTERMINÉES CI-DESSUS
            reviewer: reviewerNameToSend,
            reviewer_email: reviewerEmailToSend,
            rating: reviewForm.rating,
            status: "approved", // Ou 'hold' si vous voulez modérer
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Erreur lors de l'envoi de l'avis: ${
            errorData.message || response.statusText
          }`,
        );
      }

      setReviewSubmitStatus("success");
      await fetchReviews(); // Recharger les avis

      // Réinitialiser uniquement l'avis (garder la note par défaut)
      setReviewForm({
        review: "",
        rating: 5,
      });
    } catch (err) {
      console.error("Erreur d'envoi d'avis:", err);
      setError("Impossible d'envoyer l'avis. Veuillez réessayer.");
      setReviewSubmitStatus("error");
    }
  };

  // --- APPEL API POUR UN PRODUIT SPÉCIFIQUE (CHARGEMENT INITIAL) ---
  useEffect(() => {
    if (!id) {
      setError("ID de produit manquant.");
      setIsLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setIsLoading(true);

        const response = await fetch(
          `${API_CONFIG.baseUrl}/wp-json/wc/v3/products/${id}?${API_CONFIG.auth}`,
        );
        if (response.status === 404) throw new Error("Produit non trouvé.");
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        const data = await response.json();

        // 1. Récupération des Variations
        let variationsData = [];
        let defaultVariation = null;
        const isVariable = data.type === "variable";

        if (isVariable) {
          const variationsResponse = await fetch(
            API_CONFIG.getVariationsUrl(id),
          );
          if (variationsResponse.ok) {
            variationsData = await variationsResponse.json();
            setProductVariations(variationsData);
            //  VÉRIFICATION DE LA LISTE COMPLÈTE
            console.log(
              "Variations complètes chargées:",
              variationsData.map((v) => ({
                id: v.id,
                attributes: v.attributes,
                stock_status: v.stock_status,
              })),
            );
          }
        }

        // 2. Détermination de la variation par défaut (Pour stock/image/PRIX initial)
        if (variationsData.length > 0) {
          // Trouver la première variation qui n'est pas en rupture de stock
          defaultVariation =
            variationsData.find((v) => v.stock_status !== "outofstock") ||
            variationsData[0];

          // Mise à jour immédiate du selectedVariation pour le stock/l'image au premier rendu
          setSelectedVariation(defaultVariation);
        }

        //  DÉTERMINATION DES PRIX INITIAUX
        let initialPrice = 0;
        let initialRegularPrice = 0;

        if (defaultVariation) {
          // CAS VARIABLE: Utiliser les prix de la variation par défaut
          initialPrice =
            parseFloat(defaultVariation.price) ||
            parseFloat(defaultVariation.regular_price) ||
            0;
          initialRegularPrice = parseFloat(defaultVariation.regular_price) || 0;
        } else {
          // CAS SIMPLE: Utiliser les prix du produit parent
          initialPrice = data.sale_price
            ? parseFloat(data.sale_price)
            : parseFloat(data.regular_price) || 0;
          initialRegularPrice = parseFloat(data.regular_price) || 0;
        }

        //  DÉFINIR LE PRIX INITIAL DYNAMIQUE
        setDisplayPrice(initialPrice);
        setDisplayRegularPrice(initialRegularPrice);

        // --- LOGIQUE DE DESCRIPTION/ATTRIBUTS/TAILLES (inchangée) ---
        const fullDescription = data.description
          ? data.description
          : "<p>Aucune description détaillée disponible.</p>";
        const shortDescription = data.short_description
          ? data.short_description
          : "";
        let displayDescription = shortDescription;

        if (!displayDescription || displayDescription === "<p></p>\n") {
          const plainTextDescription = fullDescription.replace(
            /<[^>]*>?/gm,
            " ",
          );

          if (plainTextDescription.length > 10) {
            displayDescription =
              plainTextDescription.substring(0, 1000).trim() + "[...]";
            displayDescription = `<p>${displayDescription}</p>`;
          } else {
            displayDescription = "";
          }
        }

        // Le stock et le statut de stock sont initialement ceux du parent
        const stockQuantity =
          data.stock_quantity !== null
            ? parseInt(data.stock_quantity, 10)
            : null;
        const manageStock = data.manage_stock;

        const imageUrl =
          data.images.length > 0
            ? data.images[0].src
            : "https://via.placeholder.com/600x450?text=Image+Manquante";
        const isOutOfStock = data.stock_status === "outofstock";

        const attributes = data.attributes
          .filter(
            (attr) => attr.visible && attr.options && attr.options.length > 0,
          )
          .map((attr) => ({
            name: attr.name,
            options: attr.options.join(", "),
          }));

        //  LOGIQUE POUR EXTRAIRE LES OPTIONS DE COULEUR/TAILLE
        const colorAttribute = data.attributes.find(
          (attr) =>
            attr.name.toLowerCase().includes("couleur") ||
            attr.name.toLowerCase().includes("color"),
        );

        let colors = [];
        if (colorAttribute && colorAttribute.options) {
          colors = colorAttribute.options;
        }

        setAvailableColors(colors);

        //  Si des variations existent, on sélectionne la première couleur/taille de la variation par défaut
        if (defaultVariation) {
          // Utiliser les ATTRIBUTS de la variation pour initialiser les sélections
          const defaultColorAttr = defaultVariation.attributes.find(
            (attr) =>
              attr.name.toLowerCase().includes("couleur") ||
              attr.name.toLowerCase().includes("color"),
          );
          const defaultSizeAttr = defaultVariation.attributes.find(
            (attr) =>
              attr.name.toLowerCase().includes("pointure") ||
              attr.name.toLowerCase().includes("taille"),
          );

          setSelectedColor(defaultColorAttr ? defaultColorAttr.option : "");
          setSelectedSize(defaultSizeAttr ? defaultSizeAttr.option : "");
        } else if (colors.length > 0) {
          setSelectedColor(colors[0]);
        } else {
          setSelectedColor("");
        }

        const sizeAttribute = data.attributes.find((attr) =>
          attr.name.toLowerCase().includes("pointure"),
        );

        let sizes = [];
        if (sizeAttribute && sizeAttribute.options) {
          sizes = sizeAttribute.options.sort();
        }

        setAvailableSizes(sizes);

        setProduct({
          id: data.id,
          name: data.name,
          price: initialPrice,
          regularPrice: initialRegularPrice,
          description: fullDescription,
          shortDescription: shortDescription,
          displayDescription: displayDescription,
          image: imageUrl,
          stock_status: data.stock_status,
          isOutOfStock,
          attributes,
          stockQuantity: stockQuantity,
          manageStock: manageStock,
          availableSizes: sizes,
          isVariable: isVariable, // Ajout du type de produit
        });

        await fetchReviews();

        setError(null);
      } catch (err) {
        console.error("Erreur de récupération du produit ou des avis:", err);
        setError(
          `Impossible de charger les détails du produit: ${err.message}`,
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Recherche de variation, mise à jour du STOCK et du PRIX
  useEffect(() => {
    // Ne s'exécute que si le produit est chargé et qu'il y a des variations à chercher
    if (!product || !product.isVariable || productVariations.length === 0) {
      // Si ce n'est pas un produit variable, on ne fait rien
      return;
    }

    // Fonction pour trouver une variation spécifique (inchangée)
    // VERS LA LIGNE 366 (Remplacez l'intégralité de la fonction)
    const findVariation = (color, size) => {
      if (availableColors.length > 0 && !color) return null;
      if (availableSizes.length > 0 && !size) return null;

      // FONCTION DE NORMALISATION FORTE
      // Supprime les accents et les caractères spéciaux non essentiels
      const normalizeString = (str) => {
        if (!str) return "";
        return (
          str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Enlève les accents
            .replace(/[\/\\]/g, "") // Enlève les barres obliques/antislash
            //  Accepte les majuscules A-Z.
            // Accepte les lettres minuscules a-z.
            //  Accepte les chiffres 0-9.
            // Nous allons conserver le remplacement initial par sécurité, mais en incluant A-Z.
            .replace(/[^A-Za-z0-9]/g, "") // ENLEVER TOUT CE QUI N'EST PAS UNE LETTRE OU UN CHIFFRE
            .toLowerCase() // Tout en minuscules
            .trim()
        ); // Enlève les espaces résiduels (maintenant vides)
      };

      // Normalisation des sélections
      const selectedColorTrimmed = normalizeString(color);
      const selectedSizeTrimmed = normalizeString(size);

      console.log("--- Recherche de variation ---");
      console.log("Sélection Couleur (norm.) :", selectedColorTrimmed);
      console.log("Sélection Pointure (norm.) :", selectedSizeTrimmed);

      return productVariations.find((variation) => {
        let variationColor = null;
        let variationSize = null;

        // 1. PARCOURIR LES ATTRIBUTS ET RÉCUPÉRER LES VALEURS
        variation.attributes.forEach((attr) => {
          // Utiliser la normalisation sur le nom de l'attribut (pour 'Taille/Pointure')
          const normalizedName = normalizeString(attr.name);
          // Utiliser la normalisation sur l'option (pour '35' ou 'Blanc')
          const normalizedOption = normalizeString(attr.option);
          const normalizedSlug = normalizeString(attr.slug);

          // Récupère la COULEUR de cette variation
          if (
            normalizedName.includes("couleur") ||
            normalizedName.includes("color") ||
            normalizedSlug.includes("couleur") ||
            normalizedSlug.includes("color")
          ) {
            variationColor = normalizedOption;
          }

          // Récupère la TAILLE/POINTURE de cette variation
          if (
            normalizedName.includes("pointure") ||
            normalizedName.includes("taille") ||
            normalizedSlug.includes("taille") ||
            normalizedSlug.includes("pointure")
          ) {
            variationSize = normalizedOption;
          }
        });

        // 2. COMPARAISON FINALE

        // La couleur doit correspondre, SAUF si le produit n'a pas d'attribut couleur
        const colorMatch =
          availableColors.length === 0 ||
          variationColor === selectedColorTrimmed;

        // La taille doit correspondre, SAUF si le produit n'a pas d'attribut taille
        const sizeMatch =
          availableSizes.length === 0 || variationSize === selectedSizeTrimmed;

        if (colorMatch && sizeMatch) {
          console.log(
            `✅ MATCH TROUVÉ : ID ${variation.id} (Couleur: ${variationColor}, Taille: ${variationSize})`,
          );
          return true;
        }
        return false;
      });
    };
    // Cherche une variation basée sur les sélections actuelles
    const foundVariation = findVariation(selectedColor, selectedSize);

    if (foundVariation) {
      setSelectedVariation(foundVariation);
      setQuantity(1); // Réinitialiser la quantité à 1 lors du changement de variation

      // ❌ PRIX RETIRÉS : Le prix est maintenant fixe, nous ne mettons pas à jour displayPrice/displayRegularPrice.
    } else {
      // Si aucune variation correspondante n'est trouvée (combo inexistant ou OOS)
      setSelectedVariation(null);
      // ❌ PRIX RETIRÉS : Le prix est fixe, nous ne le réinitialisons pas.
    }
  }, [
    selectedColor,
    selectedSize,
    product,
    productVariations,
    availableColors,
    availableSizes,
  ]); // Dépendances importantes

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
          <button className="btn-add-to-cart">
            <Link to="/shop">Retour à la boutique</Link>
          </button>
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

  // Détermination du stock à afficher (utilise la variation si elle existe, sinon le parent)
  const stockSource = selectedVariation || product;
  const currentStockQuantity = stockSource.stock_quantity;
  const isVariationOutOfStock =
    stockSource.stock_status === "outofstock" ||
    (stockSource.manage_stock && currentStockQuantity === 0);
  const displayStock = stockSource.manage_stock; // Indique si la gestion de stock est activée pour cette source

  // --- RENDU DU CONTENU DE L'ONGLET ACTIF ---
  const renderTabContent = () => {
    if (activeTab === "description") {
      return (
        <div
          className="tab-content description-content"
          dangerouslySetInnerHTML={{ __html: product.description }}
        />
      );
    }
    if (activeTab === "additional_info") {
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
      return (
        <div className="tab-content additional-info-content">
          <table className="attributes-table">
            <tbody>
              {product.attributes.map((attr, index) => (
                <tr key={index}>
                  <th>{attr.name}</th> <td>{attr.options}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    if (activeTab === "reviews") {
      return (
        <div className="tab-content reviews-content">
          <h2>Avis ({reviews.length})</h2>
          <hr />
          {reviews.length === 0 ? (
            <div className="no-reviews-prompt">
              <p>
                Il n’y a pas encore d’avis. Soyez le premier à laisser votre
                avis sur
                <strong> {product.name}</strong>.
              </p>
            </div>
          ) : (
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
                  Votre note :<span className="required-star">*</span>
                </label>

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
                  Votre avis
                  <span className="required-star">*</span>
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
    return null;
  };

  return (
    <main className="product-detail-container">
      <button className="btn bg-dark my-2">
        <Link className="link-light text-decoration-none" to="/shop">
          Retour à la boutique
        </Link>
      </button>
      {/* Message Flash d'ajout au panier avec bouton de fermeture (Succès) */}
      {showFlash && (
        <div className="flash-message-cart flash-success">
          <div className="flash-message-content">
            <p>
              {/* ... (Logique  pour construire le message du produit) ... */}

              {(() => {
                let name = product.name;
                const variations = []; // ... (logique de construction de 'name' et 'variations') ...
                if (flashSize) {
                  variations.push(flashSize);
                }
                if (flashColor) {
                  variations.push(flashColor);
                }

                if (variations.length > 0) {
                  name += ` ,${variations.join(" ")}`;
                }

                const articleName = `"${name}"`;

                if (addedQuantity > 1) {
                  return `${addedQuantity} x ${articleName} ont été ajoutés à votre panier.`;
                } else {
                  return `${articleName} a été ajouté à votre panier.`;
                }
              })()}
            </p>
            {/* Le lien sera aligné à droite de la phrase */}
            <Link
              to="/cart"
              className="btn-view-cart"
              onClick={handleCloseFlash}
            >
              Voir le panier
            </Link>
          </div>
          {/* Bouton de Fermeture */}
          <button
            className="btn-close-flash"
            onClick={handleCloseFlash}
            aria-label="Fermer la notification"
          >
            &times;
          </button>
        </div>
      )}
      {showStockFlash && (
        <div className="flash-message-cart flash-error">
          <p>❌ {stockFlashMessage}</p>
          <button
            className="btn-close-flash"
            onClick={handleCloseStockFlash}
            aria-label="Fermer la notification d'erreur de stock"
          >
            &times;
          </button>
        </div>
      )}
      <div className="product-content">
        <div className="product-image-area">
          {/*  Utiliser l'image de la variation sélectionnée si elle existe, sinon l'image du produit parent  */}
          <img
            src={stockSource.image?.src || product.image}
            alt={product.name}
          />
          {(product.isOutOfStock && productVariations.length === 0) ||
            (isVariationOutOfStock && (
              <div className="product-badge out-of-stock">Rupture de Stock</div>
            ))}
        </div>
        <div className="product-info-area">
          <div itemScope itemType="https://schema.org/Product">
            <h1 itemProp="name" className="product-name">
              {product.name}
            </h1>
            {totalReviews > 0 && (
              <div
                className="product-header-reviews"
                itemProp="aggregateRating" /* <-- Propriété principale */
                itemScope
                itemType="https://schema.org/AggregateRating" /* <-- Type spécifique */
              >
                <span itemProp="ratingValue">{averageRating.toFixed(1)}</span>
                <RatingStars rating={averageRating} />
                <span className="review-count">
                  (<span itemProp="reviewCount">{totalReviews}</span> avis)
                </span>
              </div>
            )}
            <div
              itemProp="offers"
              itemScope
              itemType="https://schema.org/Offer"
            >
              <div className="price-section">
                <span className="current-price" itemProp="price">
                  {formatPrice(displayPrice)}
                </span>
                <meta itemProp="priceCurrency" content="EUR" />
                <link
                  itemProp="availability"
                  href={
                    isVariationOutOfStock
                      ? "https://schema.org/OutOfStock"
                      : "https://schema.org/InStock"
                  }
                />
              </div>
            </div>
            <meta
              itemProp="image"
              content={stockSource.image?.src || product.image}
            />
            {product.displayDescription && (
              <div
                className="product-excerpt-description"
                itemProp="description"
                dangerouslySetInnerHTML={{ __html: product.displayDescription }}
              />
            )}
          </div>
          {/*  SÉLECTEUR DE COULEUR  */}
          {availableColors.length > 0 && (
            <div className="color-selector-group">
              <label htmlFor="product-color">
                Couleur :<span className="required-star">*</span>
              </label>

              <select
                id="product-color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                required
                className="color-select-input"
              >
                <option value="" disabled>
                  Choisir une couleur...
                </option>

                {availableColors.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </div>
          )}
          {/*  SÉLECTEUR DE POINTURE EN CARRÉS  */}
          {availableSizes.length > 0 && (
            <div className="size-selector-group">
              <label>
                Pointure sélectionnée :<span className="required-star">*</span>
              </label>

              <div className="size-buttons-container">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={`size-button ${
                      selectedSize === size ? "selected" : ""
                    }`}
                    onClick={() => setSelectedSize(size)}
                    //  désactiver les boutons pour les combinaisons en rupture de stock ici si nécessaire
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* -------------------------------------------------
             LOGIQUE D'AFFICHAGE DU STOCK PAR VARIATION 
            -------------------------------------------------
          */}
          {productVariations.length === 0 ? (
            // CAS 1: Produit Simple (utilise le stock du parent)
            displayStock && (
              <p className="stock-info">
                {product.isOutOfStock
                  ? "Rupture de stock (0 disponible)"
                  : `${product.stockQuantity} articles en stock`}
              </p>
            )
          ) : (
            // CAS 2: Produit Variable (utilise le stock de la variation)
            <>
              {selectedVariation && displayStock && !isVariationOutOfStock && (
                <p className="stock-info">
                  {currentStockQuantity === 0
                    ? "Rupture de stock (0 disponible)"
                    : `${currentStockQuantity} articles en stock`}
                </p>
              )}

              {/* Message pour la variation épuisée */}
              {selectedVariation && isVariationOutOfStock && (
                <p className="stock-info out-of-stock-message">
                  Rupture de stock pour cette option.
                </p>
              )}

              {/* Message si les options sont sélectionnées mais aucune variation correspondante n'est trouvée (combo invalide) */}
              {!selectedVariation && (selectedColor || selectedSize) && (
                <p className="stock-info out-of-stock-message">
                  Cette combinaison (Couleur/Pointure) n'est pas disponible.
                </p>
              )}
            </>
          )}

          {/*  Champ de sélection de quantité  */}
          {!isVariationOutOfStock && !product.isOutOfStock && (
            <div className="quantity-selector-group">
              <label htmlFor="product-quantity">Quantité :</label>{" "}
              <input
                id="product-quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => {
                  let val = parseInt(e.target.value, 10);
                  const maxStock =
                    stockSource.manage_stock && currentStockQuantity !== null
                      ? currentStockQuantity
                      : Infinity;

                  val = Math.max(1, val);
                  val = Math.min(val, maxStock);

                  setQuantity(val);
                }}
                className="quantity-input"
              />
            </div>
          )}

          <button
            className="btn-add-to-cart"
            type="button"
            disabled={
              product.isOutOfStock ||
              isVariationOutOfStock ||
              quantity < 1 ||
              (availableColors.length > 0 && !selectedColor) ||
              (availableSizes.length > 0 && !selectedSize) ||
              (productVariations.length > 0 && !selectedVariation) // Désactiver si variable et qu'aucune variation valide n'est trouvée
            }
            onClick={handleAddToCart}
          >
            {product.isOutOfStock || isVariationOutOfStock
              ? "Indisponible"
              : `Ajouter au panier`}
          </button>
        </div>
      </div>
      <div
        className="product-tabs-section"
        itemscope
        itemtype="https://schema.org/Product"
      >
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
