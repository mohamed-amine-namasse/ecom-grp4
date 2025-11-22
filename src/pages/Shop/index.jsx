import React, { useState, useEffect, useMemo } from "react";
import "./style.css";
import FilterControls from "../../components/FilterControls";

// ----------------------------------------------------------------------
// --- CONFIGURATION WOOCOMMERCE ---
// ----------------------------------------------------------------------

// ⚠️ IMPORTANT : L'URL complète et les clés API
const WOOCOMMERCE_FULL_URL =
  "https://mohamed-amine-namasse.students-laplateforme.io/wordpress-eco/wordpress";
const CONSUMER_KEY = "ck_ae0703c9b00197c41256d3da1618e3e0209c7fc2";
const CONSUMER_SECRET = "cs_a79c66ab51106107de3d3355a0a015909629e3fc";

// Construction de l'URL API
const API_URL = `${WOOCOMMERCE_FULL_URL}/wp-json/wc/v3/products?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`;

// Définition des filtres initiaux (avec un prix max par défaut de 500)
const initialFilters = {
  size: [],
  color: [],
  gamme: [],
  collection: [],
  surface: [],
  material: [],
  disponibility: "all",
  priceRange: [0, 500],
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
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

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

        const data = await response.json();

        // --- MAPPAGE DES DONNÉES WOOCOMMERCE ---
        const formattedProducts = data.map((product) => {
          const price = product.sale_price
            ? parseFloat(product.sale_price)
            : parseFloat(product.regular_price);

          const desc = product.short_description
            ? product.short_description.replace(/<\/?[^>]+(>|$)/g, "")
            : "";

          const imageUrl =
            product.images.length > 0
              ? product.images[0].src
              : "https://via.placeholder.com/400x300?text=Image+Manquante";

          const productAttributes = {
            size: getAttributeValue(product.attributes, "taille") || [],
            color: getAttributeValue(product.attributes, "couleur") || "",
            gamme: getAttributeValue(product.attributes, "gamme") || "",
            material: getAttributeValue(product.attributes, "matiere") || "",
            collection:
              getAttributeValue(product.attributes, "collection") || "",
            surface: getAttributeValue(product.attributes, "surface") || "",
          };

          return {
            id: product.id,
            name: product.name,
            price: price || 0,
            desc: desc,
            image: imageUrl,
            stock_status: product.stock_status,
            attributes: productAttributes,
          };
        });

        setProducts(formattedProducts);
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
        filterByAttribute("gamme", prod.attributes.gamme) &&
        filterByAttribute("material", prod.attributes.material) &&
        filterByAttribute("collection", prod.attributes.collection) &&
        filterByAttribute("surface", prod.attributes.surface)
    );

    return workingProducts;
  }, [products, filters]);

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
        <p className="shop-sub">Découvrez nos produits sélectionnés</p>
      </header>

      <div className="shop-layout">
        <aside className="shop-sidebar">
          <FilterControls
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            maxShopPrice={maxShopPrice}
          />
        </aside>

        <section className="products-grid" aria-live="polite">
          {filteredProducts.length === 0 && (
            <p className="no-results">
              Aucun produit ne correspond à vos critères de recherche.
            </p>
          )}

          {filteredProducts.map((prod) => {
            const isOutOfStock = prod.stock_status === "outofstock";

            return (
              <article key={prod.id} className="product-card">
                <div className="product-media">
                  <img src={prod.image} alt={prod.name} />
                  {/* Affichage du badge si rupture de stock */}
                  {isOutOfStock && (
                    <div className="product-badge out-of-stock">
                      Rupture de Stock
                    </div>
                  )}
                </div>

                <div className="product-body">
                  <h3 className="product-title">{prod.name}</h3>

                  {/* ⭐️ Rendu conditionnel optimisé : La balise <p> est ABSENTE si prod.desc est vide ⭐️ */}
                  {prod.desc && <p className="product-desc">{prod.desc}</p>}

                  <div className="product-footer">
                    <span className="product-price">
                      {formatPrice(prod.price)}
                    </span>
                    <button
                      className="btn-add"
                      type="button"
                      // Désactivation du bouton si l'article est hors stock
                      disabled={isOutOfStock}
                    >
                      Ajouter
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
