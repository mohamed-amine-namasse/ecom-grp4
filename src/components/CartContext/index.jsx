import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useMemo,
} from "react";

// Crée le Contexte du Panier
export const CartContext = createContext();

// Hook personnalisé pour une utilisation plus simple
export const useCart = () => {
  return useContext(CartContext);
};

// ------------------------------------------------------------------
// --- LOGIQUE DE PERSISTANCE ET D'INITIALISATION
// ------------------------------------------------------------------

// Fonction pour récupérer le panier du localStorage lors de l'initialisation
const getInitialCart = () => {
  try {
    const savedCart = localStorage.getItem("cartItems"); // Si des données existent, parsez-les. Sinon, retournez un tableau vide.
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (e) {
    console.error("Erreur de lecture de localStorage:", e);
    return [];
  }
};

// Fournisseur de Contexte (Wrapper pour l'application)
export const CartProvider = ({ children }) => {
  // L'état du panier est initialisé à partir du localStorage
  const [cartItems, setCartItems] = useState(getInitialCart); // Effet pour synchroniser cartItems avec localStorage à chaque changement

  useEffect(() => {
    try {
      // Sauvegarder les données dans localStorage
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
    } catch (e) {
      console.error("Erreur d'écriture dans localStorage:", e);
    }
  }, [cartItems]);
  /**
   * Ajoute un produit au panier ou augmente sa quantité s'il existe déjà.
   * Cette fonction inclut désormais la vérification du stock maximal.
   * @param {object} product - L'objet produit (doit inclure manageStock et stockQuantity).
   */

  // ------------------------------------------------------------------
  // --- FONCTIONS DE LOGIQUE DU PANIER
  // ------------------------------------------------------------------

  const addToCart = (product, quantityToAdd = 1) => {
    const price = parseFloat(product.price) || 0;
    const maxStock = product.stockQuantity;
    const manageStock = product.manageStock; // S'assurer que la quantité est au moins 1

    const initialQuantity = Math.max(1, quantityToAdd);

    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) => item.id === product.id
      );

      let newCart;

      if (existingItemIndex > -1) {
        // Cas où l'article existe déjà
        newCart = [...prevItems];
        const existingItem = newCart[existingItemIndex];
        let newQuantity = existingItem.quantity + initialQuantity; // 🚨 PLAFONNEMENT À L'AJOUT

        if (manageStock && maxStock !== null && newQuantity > maxStock) {
          newQuantity = maxStock;
        } // Si la quantité n'a pas changé à cause du plafonnement, ne pas mettre à jour

        if (existingItem.quantity === newQuantity) {
          return prevItems;
        }

        newCart[existingItemIndex] = {
          ...existingItem,
          ...product,
          quantity: newQuantity,
          price: price,
        };
      } else {
        // Cas où l'article est NOUVEAU
        let finalQuantity = initialQuantity; // 🚨 PLAFONNEMENT À LA CRÉATION

        if (manageStock && maxStock !== null && finalQuantity > maxStock) {
          finalQuantity = maxStock;
        }

        newCart = [
          ...prevItems,
          {
            id: product.id,
            name: product.name,
            price: price,
            quantity: finalQuantity,
            image: product.image || "/img/default.jpg", // ✅ S'ASSURER QUE LES DONNÉES DE STOCK SONT SAUVEGARDÉES
            manageStock: manageStock,
            stockQuantity: maxStock,
          },
        ];
      }
      return newCart;
    });
  };
  /**
   * Met à jour la quantité d'un produit spécifique, en plafonnant au stock max.
   * @param {number} id - L'ID du produit.
   * @param {number} newQuantity - La nouvelle quantité souhaitée.
   */

  const updateQuantity = (id, newQuantity) => {
    setCartItems((prevItems) => {
      return prevItems.map((item) => {
        if (item.id === id) {
          const maxStock = item.stockQuantity;
          const manageStock = item.manageStock;
          let finalQuantity = newQuantity; // 🚨 VÉRIFICATION ET PLAFONNEMENT DU STOCK (C'EST LE FIX)

          if (manageStock && maxStock !== null) {
            // Plafonner si la nouvelle quantité dépasse le stock
            if (newQuantity > maxStock) {
              finalQuantity = maxStock;
            }
          } // S'assurer que la quantité est au moins 1

          if (finalQuantity < 1) {
            // Si c'est l'intention (gérée dans Cart.js), on peut appeler removeFromCart
            // Mais ici, on se contente de la mettre à 1 si on veut la garder dans le panier.
            // Cependant, votre Cart.js gère le retrait si < 1, donc on laisse 1 ici pour la sécurité.
            finalQuantity = 1;
          }

          // Si la quantité n'a pas changé après vérification/plafonnement, on retourne l'item inchangé
          if (item.quantity === finalQuantity) {
            return item;
          }

          return { ...item, quantity: finalQuantity };
        }
        return item;
      });
    });
  };
  /**
   * Retire complètement un produit du panier.
   */
  const removeFromCart = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };
  /**
   * Retourne le nombre total d'articles (somme des quantités) dans le panier (pour le badge).
   */

  // ------------------------------------------------------------------
  // --- CALCULS OPTIMISÉS (useMemo)
  // ------------------------------------------------------------------
  const getCartCount = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);
  /**
   * Calcule le montant total du panier.
   */

  const cartTotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const price =
        typeof item.price === "number" && !isNaN(item.price) ? item.price : 0;
      return total + price * item.quantity;
    }, 0);
  }, [cartItems]);

  const contextValue = {
    cartItems,
    addToCart,
    getCartCount,
    updateQuantity,
    removeFromCart,
    cartTotal,
  };

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
};
