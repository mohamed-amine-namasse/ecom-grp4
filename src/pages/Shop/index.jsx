import React, { useState, useEffect, useMemo } from "react";
import "./style.css";
import FilterControls from "../../components/FilterControls";
import { useCart } from "../../components/CartContext";
import { Link } from "react-router";

// ----------------------------------------------------------------------
// --- CONFIGURATION WOOCOMMERCE ---
// ----------------------------------------------------------------------

const WOOCOMMERCE_FULL_URL =
  "https://mohamed-amine-namasse.students-laplateforme.io/wordpress-eco/wordpress";
const CONSUMER_KEY = "ck_ae0703c9b00197c41256d3da1618e3e0209c7fc2";
const CONSUMER_SECRET = "cs_a79c66ab51106107de3d3355a0a015909629e3fc";

// Construction de l'URL API
const API_URL = `${WOOCOMMERCE_FULL_URL}/wp-json/wc/v3/products?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}&per_page=100`;

// Définition des filtres initiaux (avec un prix max par défaut de 500)
const initialFilters = {
  size: [],
  color: [],
  surface: [],
  material: [],
  disponibility: "all",
  priceRange: [0, 500],
  marque: [],
};

// Fonction utilitaire pour extraire une valeur d'attribut spécifique
const getAttributeValue = (attributes, name) => {
  const attr = attributes.find(
    (a) => a.name.toLowerCase() === name.toLowerCase()
  );

  if (attr && attr.options) {
    // Pour les attributs multiples (comme Taille), retourne un tableau de chaînes
    return attr.options.map((option) => String(option).trim());
  }
  // Pour une valeur simple
  if (attr && attr.option) {
    return String(attr.option).trim();
  }
  return null;
};

// Fonction utilitaire pour calculer le prix maximum
const getMaxPrice = (products) => {
  if (!products || products.length === 0) return 300;

  // Trouver le prix maximum
  const max = Math.max(...products.map((p) => p.price));

  // Arrondir au multiple de 10 supérieur (ou 500 minimum)
  return Math.max(500, Math.ceil(max / 10) * 10);
};

function Shop() {
  const { addToCart, cartItems } = useCart();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [shopOptions, setShopOptions] = useState({
    marques: [],
    sizes: [],
    materials: [],
  });

  //   TOTAL
  const [totalProducts, setTotalProducts] = useState(0);
  // 🚨 NOUVEAUX ÉTATS POUR LE MESSAGE FLASH D'ERREUR DE STOCK
  const [showStockFlash, setShowStockFlash] = useState(false);
  const [stockFlashMessage, setStockFlashMessage] = useState("");
  const handleCloseStockFlash = () => {
    setShowStockFlash(false);
    setStockFlashMessage("");
  };
  const handleFilterChange = (filterName, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterName]: value,
    }));
  };

  // Réinitialisation des filtres
  const handleResetFilters = () => {
    setFilters(initialFilters);
  };

  const formatPrice = (p) =>
    p.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

  // --- APPEL API REALISTE ---
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error(
            `Erreur HTTP: ${response.status} - Vérifiez les clés API.`
          );
        }

        //  Récupérer le total à partir des en-têtes

        const totalCount =
          parseInt(response.headers.get("X-WP-Total"), 10) || 0;

        const data = await response.json();

        // --- MAPPAGE DES DONNÉES WOOCOMMERCE ---
        const formattedProducts = data.map((product) => {
          const price = product.sale_price
            ? parseFloat(product.sale_price)
            : parseFloat(product.regular_price);

          // Le prix régulier (pour l'affichage barré si en promo)
          const regularPrice = parseFloat(product.regular_price);

          const desc = product.short_description
            ? product.short_description.replace(/<\/?[^>]+(>|$)/g, "")
            : "";

          const imageUrl =
            product.images.length > 0
              ? product.images[0].src
              : "https://via.placeholder.com/400x300?text=Image+Manquante";
          const brandKeyName = "brands";

          // Cherche la première marque associée au produit dans le tableau de la clé trouvée
          const firstBrand =
            product[brandKeyName] && product[brandKeyName].length > 0
              ? product[brandKeyName][0]
              : null;

          const marqueName = firstBrand ? firstBrand.name.trim() : "";

          const productAttributes = {
            size:
              getAttributeValue(product.attributes, "taille/pointure") || [],
            color: getAttributeValue(product.attributes, "couleur") || "",
            material: getAttributeValue(product.attributes, "matière") || "",
            surface: getAttributeValue(product.attributes, "surface") || "",
            marque: marqueName,
          };
          // 🚨 AJOUT DES DONNÉES DE STOCK WOOCOMMERCE
          const manageStock = product.manage_stock;
          const stockQuantity =
            product.stock_quantity !== null
              ? parseInt(product.stock_quantity, 10)
              : null;
          return {
            id: product.id,
            name: product.name,
            price: price || 0,
            regularPrice: regularPrice || 0,
            desc: desc,
            image: imageUrl,
            stock_status: product.stock_status,
            attributes: productAttributes,
            manageStock: manageStock,
            stockQuantity: stockQuantity,
          };
        });
        // Calcul des Matières uniques
        const allMaterials = formattedProducts
          .map((p) => p.attributes.material)
          .filter((m) => m && String(m).trim() !== "");
        console.log("Matériaux bruts collectés :", allMaterials);
        // Calcul des marques uniques ⭐️
        const allMarques = formattedProducts
          .map((p) => p.attributes.marque)
          .filter((m) => m && m.trim() !== ""); // Élimine les vides/nulls // Crée un ensemble (Set) pour avoir des valeurs uniques, puis le reconvertit en tableau

        const uniqueMarques = Array.from(new Set(allMarques)).sort();
        // Calcul des tailles uniques 🚀
        const allSizes = formattedProducts
          .map((p) => p.attributes.size)
          .flat() // Important : aplatir le tableau de tableaux de tailles
          .filter((s) => s && String(s).trim() !== "");

        const uniqueSizes = Array.from(new Set(allSizes))
          .map(String)
          .sort((a, b) => {
            // Tente de trier numériquement pour 39, 40, 41...
            const numA = Number(a);
            const numB = Number(b);
            if (!isNaN(numA) && !isNaN(numB)) {
              return numA - numB;
            }
            // Tri alphabétique par défaut (S, M, L)
            return a.localeCompare(b);
          });
        const uniqueMaterials = Array.from(new Set(allMaterials)).sort();

        setProducts(formattedProducts);
        //  Mettre à jour le nombre total
        setTotalProducts(totalCount);
        // Mise à jour de l'état des options dynamiques
        setShopOptions((prev) => ({
          ...prev,
          marques: uniqueMarques,
          sizes: uniqueSizes,
          materials: uniqueMaterials,
        }));
        setError(null);
      } catch (err) {
        console.error("Erreur de récupération des produits:", err);
        setError(
          "Impossible de charger les produits. Vérifiez la connexion ou les clés API."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);
  // --- FIN APPEL API REALISTE ---

  // 2. Fonction de filtrage principale (Utilisation de useMemo pour l'optimisation)
  const filteredProducts = useMemo(() => {
    if (products.length === 0) return [];

    let workingProducts = products;

    // FILTRE PRIX
    workingProducts = workingProducts.filter(
      (prod) =>
        prod.price >= filters.priceRange[0] &&
        prod.price <= filters.priceRange[1]
    );

    // FILTRE DISPONIBILITÉ
    if (filters.disponibility !== "all") {
      const status =
        filters.disponibility === "in-stock" ? "instock" : "outofstock";
      workingProducts = workingProducts.filter(
        (prod) => prod.stock_status === status
      );
    }

    const filterByAttribute = (attributeName, attributeValue) => {
      if (filters[attributeName].length > 0) {
        // Si l'attribut est un tableau (Tailles)
        if (Array.isArray(attributeValue)) {
          return filters[attributeName].some(
            (filterVal) => attributeValue.includes(String(filterVal)) // Conversion en chaîne pour la sécurité
          );
        }

        // Si l'attribut est une chaîne simple (Couleur, Gamme, etc.)
        return filters[attributeName].includes(attributeValue);
      }
      return true;
    };

    // Appliquer les filtres spécifiques
    workingProducts = workingProducts.filter(
      (prod) =>
        filterByAttribute("color", prod.attributes.color) &&
        filterByAttribute("size", prod.attributes.size) &&
        filterByAttribute("material", prod.attributes.material) &&
        filterByAttribute("surface", prod.attributes.surface) &&
        filterByAttribute("marque", prod.attributes.marque)
    );

    return workingProducts;
  }, [products, filters]);
  // 3. Fonction pour obtenir la quantité actuelle dans le panier
  const getProductQuantityInCart = (productId) => {
    const item = cartItems.find((item) => item.id === productId);
    return item ? item.quantity : 0;
  };
  // 🚨 FONCTION POUR GÉRER L'AJOUT ET LA VÉRIFICATION DU STOCK 🚨
  const handleStockedAddToCart = (productData) => {
    const currentQuantity = getProductQuantityInCart(productData.id);
    const quantityToRequest = currentQuantity + 1; // La nouvelle quantité après le clic
    const maxStock = productData.stockQuantity; // Fermer tout message flash précédent
    handleCloseStockFlash(); // 🚀 VÉRIFICATION DE LA QUANTITÉ MAXIMALE // Vérifie si le stock est géré, s'il y a une quantité max, et si la requête dépasse cette max.

    if (
      productData.manageStock &&
      maxStock !== null &&
      quantityToRequest > maxStock
    ) {
      // Cas d'erreur : stock dépassé
      setStockFlashMessage(
        `La quantité maximum de « ${productData.name} » autorisée dans le panier est de ${maxStock}`
      );
      setShowStockFlash(true);
      return; // Bloquer l'ajout
    } // Si en stock ou stock non géré, ajouter l'article

    addToCart(productData, 1);
  };
  // 4. Gérer l'affichage du chargement et des erreurs
  if (isLoading) {
    return (
      <main className="shop-container loading-state">
        <p>Chargement des produits de la boutique...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="shop-container error-state">
        <div className="alert alert-danger">
          <h2>Erreur de connexion WooCommerce</h2>
          <p>{error}</p>
          <p>
            Veuillez vérifier que l'URL, les clés API sont correctes, et que
            l'API REST est activée sur votre WordPress.
          </p>
        </div>
      </main>
    );
  }

  // Calcul du prix maximum dynamique pour FilterControls
  const maxShopPrice = getMaxPrice(products);

  // 5. Rendu du contenu
  return (
    <main className="shop-container">
      <header className="shop-header">
        <h1>Boutique</h1>
        {/* Affichage du nombre total de produits  */}
        <p className="total-products-count">
          {totalProducts > 0
            ? `Total des produits: ${totalProducts} `
            : "Aucun produit trouvé sur WooCommerce."}
        </p>
      </header>
      {/* 🚨 MESSAGE FLASH D'ERREUR DE STOCK 🚨 */}
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

      <div className="shop-layout">
        <aside className="shop-sidebar">
          <FilterControls
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            maxShopPrice={maxShopPrice}
            dynamicMarques={shopOptions.marques}
            dynamicSizes={shopOptions.sizes}
          />
        </aside>

        <section className="products-grid" aria-live="polite">
          {/* Ligne d'info sur les produits filtrés (optionnel) */}
          <p className="filtered-count-info">
            {filteredProducts.length} produit
            {filteredProducts.length > 1 ? "s" : ""} correspondent à vos
            filtres.
          </p>

          {filteredProducts.length === 0 && (
            <p className="no-results">
              Aucun produit ne correspond à vos critères de recherche.
            </p>
          )}

          {filteredProducts.map((prod) => {
            const isOutOfStock = prod.stock_status === "outofstock";
            const productLink = `/product/${prod.id}`; // Définir le lien une seule fois
            const quantityInCart = getProductQuantityInCart(prod.id);
            return (
              <article className="product-card">
                <div className="product-media" key={prod.id}>
                  <Link to={productLink} className="product-image-link">
                    <img src={prod.image} alt={prod.name} />
                  </Link>
                  {/* Affichage du badge si rupture de stock */}
                  {isOutOfStock && (
                    <div className="product-badge out-of-stock">
                      Rupture de Stock
                    </div>
                  )}
                </div>

                <div className="product-body">
                  <h3 className="product-title">
                    <Link className="text-dark " to={productLink}>
                      {prod.name}
                    </Link>
                  </h3>

                  {prod.desc && prod.desc.trim() && (
                    <p className="product-desc">{prod.desc}</p>
                  )}

                  <div className="product-footer">
                    {/* Affichage du prix régulier barré si une promotion est active */}
                    <div className="flex">
                      {prod.price < prod.regularPrice && (
                        <span className="product-price old-price">
                          {formatPrice(prod.regularPrice)}
                        </span>
                      )}

                      {/* Prix actuel (prix de vente ou prix régulier) */}
                      <span className="product-price current-price">
                        {formatPrice(prod.price)}
                      </span>
                    </div>

                    <button
                      className="btn-add"
                      type="button"
                      // Désactivation du bouton si l'article est hors stock
                      disabled={isOutOfStock}
                      onClick={() =>
                        // 🚀 Utiliser la fonction de vérification
                        handleStockedAddToCart({
                          id: prod.id,
                          name: prod.name,
                          price: prod.price,
                          image: prod.image,
                          manageStock: prod.manageStock,
                          stockQuantity: prod.stockQuantity,
                        })
                      }
                    >
                      {isOutOfStock
                        ? "Rupture de Stock"
                        : quantityInCart > 0
                        ? `${quantityInCart} dans le panier`
                        : "Ajouter au panier"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}

export default Shop;
