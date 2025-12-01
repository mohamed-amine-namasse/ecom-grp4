// src/contexts/CartContext.js

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
    const savedCart = localStorage.getItem("cartItems");
    // Si des données existent, parsez-les. Sinon, retournez un tableau vide.
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (e) {
    console.error("Erreur de lecture de localStorage:", e);
    return [];
  }
};

// Fournisseur de Contexte (Wrapper pour l'application)
export const CartProvider = ({ children }) => {
  // L'état du panier est initialisé à partir du localStorage
  const [cartItems, setCartItems] = useState(getInitialCart);

  // Effet pour synchroniser cartItems avec localStorage à chaque changement
  useEffect(() => {
    try {
      // Sauvegarder les données dans localStorage
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
    } catch (e) {
      console.error("Erreur d'écriture dans localStorage:", e);
    }
  }, [cartItems]); // ------------------------------------------------------------------ // --- FONCTIONS DE LOGIQUE DU PANIER // ------------------------------------------------------------------
  /**
   * Ajoute un produit au panier ou augmente sa quantité s'il existe déjà.
   * @param {object} product - L'objet produit à ajouter (doit avoir au moins id, name, price).
   */

  const addToCart = (product, quantityToAdd = 1) => {
    const price = parseFloat(product.price) || 0; // Utilise le prix du produit passé
    // S'assurer que la quantité est au moins 1 si elle vient d'une source externe
    const finalQuantity = Math.max(1, quantityToAdd);
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) => item.id === product.id
      );

      let newCart;

      if (existingItemIndex > -1) {
        // Cas où l'article existe déjà : on met à jour l'article existant
        newCart = [...prevItems];
        const existingItem = newCart[existingItemIndex];

        newCart[existingItemIndex] = {
          ...existingItem, // 1. Garder les anciennes propriétés (et la quantité actuelle)
          ...product, // 2. Écraser/ajouter les nouvelles propriétés (comme 'image')
          quantity: existingItem.quantity + finalQuantity, // 3. Augmenter la quantité
          price: price, // 4. Assurer l'utilisation du prix sécurisé
        };
      } else {
        // Cas où l'article est NOUVEAU : on ajoute le produit complet
        newCart = [
          ...prevItems,
          {
            // Nous listons explicitement les propriétés essentielles pour forcer l'inclusion de l'image
            id: product.id,
            name: product.name,
            price: price, // Prix sécurisé
            quantity: finalQuantity,
            image: product.image || "/img/default.jpg", // 🚨 FORCER L'IMAGE ICI
          },
        ];
      }
      return newCart;
    });
  };

  /**
   * Met à jour la quantité d'un produit spécifique dans le panier.
   * @param {number} id - L'ID du produit.
   * @param {number} quantity - La nouvelle quantité.
   */
  const updateQuantity = (id, quantity) => {
    if (quantity < 1) {
      // Si la quantité est inférieure à 1, retire l'article
      removeFromCart(id);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: quantity } : item
      )
    );
  };
  /**
   * Retire complètement un produit du panier.
   * @param {number} id - L'ID du produit à retirer.
   */

  const removeFromCart = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  }; // ------------------------------------------------------------------ // --- CALCULS OPTIMISÉS (useMemo) // ------------------------------------------------------------------
  /**
   * Retourne le nombre total d'articles (somme des quantités) dans le panier.
   */

  const getCartCount = useMemo(() => {
    // Calcul de la somme des quantités
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]); // Recalculé uniquement lorsque cartItems change

  /**
   * Calcule le montant total du panier.
   */
  const cartTotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      // Sécurité : Assurez-vous que le prix est un nombre avant le calcul
      const price =
        typeof item.price === "number" && !isNaN(item.price) ? item.price : 0;
      return total + price * item.quantity;
    }, 0);
  }, [cartItems]); // Recalculé uniquement lorsque cartItems change // L'objet valeur qui sera fourni aux composants

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
