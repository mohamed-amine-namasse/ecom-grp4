<<<<<<< HEAD
import "./style.css";

function Shop() {
  return (
    <div className="shop-container">
      <p>iiii</p>
    </div>
=======
import React, { useState, useEffect, useMemo } from "react";
import "./style.css";
import FilterControls from "../../components/FilterControls";
import Pagination from "../../components/Pagination";
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

// Définition des filtres initiaux
const initialFilters = {
  size: [],
  color: [],
  surface: [],
  material: [],
  disponibility: "all",
  priceRange: [0, 250],
  marque: [],
};

// Fonction utilitaire pour extraire une valeur d'attribut spécifique
const getAttributeValue = (attributes, name) => {
  const attr = attributes.find(
    (a) => a.name.toLowerCase() === name.toLowerCase()
  );

  if (attr && attr.options) {
    return attr.options.map((option) => String(option).trim());
  }
  if (attr && attr.option) {
    return String(attr.option).trim();
  }
  return null;
};

// Fonction utilitaire pour calculer le prix maximum
const getMaxPrice = (products) => {
  if (!products || products.length === 0) return 300;

  const max = Math.max(...products.map((p) => p.maxPrice || p.price));

  return Math.max(250, Math.ceil(max / 10) * 10);
};

function Shop() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [shopOptions, setShopOptions] = useState({
    marques: [],
    sizes: [],
    materials: [],
  });
  const [totalProducts, setTotalProducts] = useState(0);
  // ---  ÉTATS POUR LA PAGINATION ---
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12); // Nombre de produits affichés par page
  const [apiProducts, setApiProducts] = useState([]); // Pour stocker les 100 produits chargés initialement
  // ------------------------------------------
  const handleFilterChange = (filterName, value) => {
    setCurrentPage(1);
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterName]: value,
    }));
  };

  const handleResetFilters = () => {
    setCurrentPage(1);
    setFilters(initialFilters);
  };

  const formatPrice = (p) =>
    p.toLocaleString("fr-FR", { style: "currency", currency: "EUR" }); // --- APPEL API ET MAPPING CORRIGÉ AVEC RÉCUPÉRATION DES VARIATIONS ---

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error(
            `Erreur HTTP: ${response.status} - Vérifiez les clés API.`
          );
        }

        const totalCount =
          parseInt(response.headers.get("X-WP-Total"), 10) || 0;

        const data = await response.json(); // Traitement asynchrone pour récupérer les variations si nécessaire

        const productsPromises = data.map(async (product) => {
          let price = 0; // Prix de vente (min pour variable)
          let regularPrice = 0; // Prix régulier (prix barré potentiel)
          let maxPrice = 0;
          const productType = product.type;

          if (productType === "variable") {
            // 1. Tenter d'abord la récupération du prix via min_price (méthode rapide)
            const minPriceAPI = parseFloat(product.min_price) || 0;
            const maxPriceAPI = parseFloat(product.max_price) || 0; // Utiliser min_regular_price de l'API comme prix de base

            regularPrice = parseFloat(product.min_regular_price) || 0;

            if (minPriceAPI > 0) {
              // Utilisation des prix de vente rapides
              price = minPriceAPI;
              maxPrice = maxPriceAPI;
            } // Si la méthode rapide n'a pas donné de prix, on passe à la vérification des variations

            if (price === 0) {
              const variationsUrl = `${WOOCOMMERCE_FULL_URL}/wp-json/wc/v3/products/${product.id}/variations?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`;

              if (product.variations && product.variations.length > 0) {
                const variationsResponse = await fetch(variationsUrl);
                if (variationsResponse.ok) {
                  const variations = await variationsResponse.json(); // Extraction des prix de vente effectifs

                  const validPrices = variations
                    .map((v) => parseFloat(v.price))
                    .filter((p) => p > 0); // Extraction des prix réguliers (pour le barré)

                  const validRegularPrices = variations
                    .map((v) => parseFloat(v.regular_price))
                    .filter((p) => p > 0);

                  if (validPrices.length > 0) {
                    price = Math.min(...validPrices);
                    maxPrice = Math.max(...validPrices); // Mettre le prix régulier minimum trouvé comme prix barré

                    if (validRegularPrices.length > 0) {
                      regularPrice = Math.min(...validRegularPrices);
                    }
                  }
                }
              } // Dernier recours si aucun prix trouvé

              if (price === 0) {
                price = parseFloat(product.regular_price) || 0;
              }
            }
          } else {
            // Pour les produits simples
            price = product.sale_price
              ? parseFloat(product.sale_price)
              : parseFloat(product.regular_price);
            regularPrice = parseFloat(product.regular_price);
            maxPrice = regularPrice;
          }

          price = isNaN(price) ? 0 : price;
          regularPrice = isNaN(regularPrice) ? 0 : regularPrice;
          maxPrice = isNaN(maxPrice) ? 0 : maxPrice; // S'assurer que regularPrice n'est jamais 0 // quand un prix est trouvé, ou qu'il n'est pas inférieur au prix de vente.

          if (regularPrice === 0 && price > 0) {
            regularPrice = price;
          }
          if (regularPrice < price) {
            regularPrice = price;
          }

          const desc = product.short_description
            ? product.short_description.replace(/<\/?[^>]+(>|$)/g, "")
            : "";

          const imageUrl =
            product.images.length > 0
              ? product.images[0].src
              : "https://via.placeholder.com/400x300?text=Image+Manquante";

          const brandKeyName = "brands";

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

          const manageStock = product.manage_stock;
          const stockQuantity =
            product.stock_quantity !== null
              ? parseInt(product.stock_quantity, 10)
              : null;

          return {
            id: product.id,
            name: product.name,
            type: productType,
            price: price || 0,
            regularPrice: regularPrice || 0,
            maxPrice: maxPrice || price || 0,
            desc: desc,
            image: imageUrl,
            stock_status: product.stock_status,
            attributes: productAttributes,
            manageStock: manageStock,
            stockQuantity: stockQuantity,
          };
        }); // Attendre que tous les appels API (variations) soient terminés

        const formattedProducts = await Promise.all(productsPromises); // Calcul des options de filtrage
        const allMaterials = formattedProducts
          .map((p) => p.attributes.material)
          .filter((m) => m && String(m).trim() !== "");

        const allMarques = formattedProducts
          .map((p) => p.attributes.marque)
          .filter((m) => m && m.trim() !== "");

        const uniqueMarques = Array.from(new Set(allMarques)).sort();

        const allSizes = formattedProducts
          .map((p) => p.attributes.size)
          .flat()
          .filter((s) => s && String(s).trim() !== "");

        const uniqueSizes = Array.from(new Set(allSizes))
          .map(String)
          .sort((a, b) => {
            const numA = Number(a);
            const numB = Number(b);
            if (!isNaN(numA) && !isNaN(numB)) {
              return numA - numB;
            }
            return a.localeCompare(b);
          });
        const uniqueMaterials = Array.from(new Set(allMaterials)).sort();

        setProducts(formattedProducts);
        setTotalProducts(totalCount);
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
  }, []); // 2. Fonction de filtrage principale

  const filteredProducts = useMemo(() => {
    if (products.length === 0) return [];

    let workingProducts = products;

    workingProducts = workingProducts.filter(
      (prod) =>
        prod.price >= filters.priceRange[0] &&
        prod.price <= filters.priceRange[1]
    );

    if (filters.disponibility !== "all") {
      const status =
        filters.disponibility === "in-stock" ? "instock" : "outofstock";
      workingProducts = workingProducts.filter(
        (prod) => prod.stock_status === status
      );
    }

    const filterByAttribute = (attributeName, attributeValue) => {
      if (filters[attributeName].length > 0) {
        if (Array.isArray(attributeValue)) {
          return filters[attributeName].some((filterVal) =>
            attributeValue.includes(String(filterVal))
          );
        }
        return filters[attributeName].includes(attributeValue);
      }
      return true;
    };

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
  // ---  useMemo pour extraire les produits de la page courante ---
  const paginatedProducts = useMemo(() => {
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    return filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  }, [filteredProducts, currentPage, productsPerPage]);

  // Calcul du nombre total de pages
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Fonction pour changer de page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
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

  const maxShopPrice = getMaxPrice(products); // 5. Rendu du contenu

  return (
    <main className="shop-container">
      <header className="shop-header">
        <div className="d-flex align-items-center mt-3  ">
          <h1 className="px-3">Boutique</h1>
          <p className="total-products-count">
            {totalProducts > 0
              ? `Total des produits: ${totalProducts} `
              : "Aucun produit trouvé sur WooCommerce."}
          </p>
        </div>
      </header>

      <div className="shop-layout">
        <aside className="shop-sidebar">
          <FilterControls
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            maxShopPrice={maxShopPrice}
            dynamicMarques={shopOptions.marques}
            dynamicSizes={shopOptions.sizes}
            dynamicMaterials={shopOptions.materials}
          />
        </aside>

        <section className="products-grid" aria-live="polite">
          <p className="filtered-count-info">
            {filteredProducts.length} produit
            {filteredProducts.length > 1 ? "s" : ""} correspondent à vos
            filtres.
          </p>
          {/* Affiche le message s'il n'y a aucun résultat FILTRÉ */}
          {filteredProducts.length === 0 && (
            <p className="no-results">
              Aucun produit ne correspond à vos critères de recherche.
            </p>
          )}

          {/* IMPORTANT : Utilisation de paginatedProducts pour l'affichage */}
          {paginatedProducts.map((prod) => {
            const isOutOfStock = prod.stock_status === "outofstock";
            const productLink = `/product/${prod.id}`;
            const isVariable = prod.type === "variable";
            const hasPriceRange =
              isVariable &&
              prod.price !== prod.maxPrice &&
              prod.maxPrice > prod.price;

            const isOnSale = prod.price < prod.regularPrice;

            return (
              <article className="product-card" key={prod.id}>
                <div itemScope itemType="https://schema.org/Product">
                  <div className="product-media">
                    <Link to={productLink} className="product-image-link">
                      <img itemProp="image" src={prod.image} alt={prod.name} />
                    </Link>

                    {isOutOfStock && (
                      <div className="product-badge out-of-stock">
                        Rupture de Stock
                      </div>
                    )}
                  </div>

                  <div className="product-body">
                    <h3 itemProp="name" className="product-title">
                      <Link className="text-dark " to={productLink}>
                        {prod.name}
                      </Link>
                    </h3>
                    {prod.desc && prod.desc.trim() && (
                      <p className="product-desc">{prod.desc}</p>
                    )}
                    <div className="product-footer">
                      <div className="flex">
                        {/* Affichage du prix régulier barré SI le produit est en promotion */}
                        {isOnSale && (
                          <div
                            itemProp="offers"
                            itemScope
                            itemType="https://schema.org/Offer"
                          >
                            <span
                              itemProp="price"
                              className="product-price old-price"
                            >
                              {formatPrice(prod.regularPrice)}
                            </span>
                            <meta
                              itemProp="availability"
                              content={
                                prod.stock_status === "instock"
                                  ? "https://schema.org/InStock"
                                  : "https://schema.org/OutOfStock"
                              }
                            />
                            <meta itemProp="priceCurrency" content="EUR" />
                          </div>
                        )}
                        {/* Prix actuel (prix de vente ou prix régulier) */}
                        <div
                          itemProp="offers"
                          itemScope
                          itemType="https://schema.org/Offer"
                        >
                          <span
                            itemProp="price"
                            className="product-price current-price"
                          >
                            {/* Affichage intelligent : Plage de prix si variable et PAS en promo, sinon prix unique */}
                            {hasPriceRange && !isOnSale
                              ? `${formatPrice(prod.price)} - ${formatPrice(
                                  prod.maxPrice
                                )}`
                              : formatPrice(prod.price)}
                          </span>
                          <meta
                            itemProp="availability"
                            content={
                              prod.stock_status === "instock"
                                ? "https://schema.org/InStock"
                                : "https://schema.org/OutOfStock"
                            }
                          />
                          <meta itemProp="priceCurrency" content="EUR" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}

          {/* --- ZONE DE PAGINATION  --- */}
          {/* La pagination s'affiche uniquement si on trouve des produits via les filtres ET plus d'une page */}
          {filteredProducts.length > 0 && totalPages > 1 && (
            <Pagination
              productsPerPage={productsPerPage}
              totalProducts={filteredProducts.length}
              paginate={paginate}
              currentPage={currentPage}
              totalPages={totalPages}
            />
          )}
        </section>
      </div>
    </main>
>>>>>>> mohamed-amine
  );
}

export default Shop;
