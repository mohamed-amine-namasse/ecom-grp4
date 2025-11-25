// src/contexts/CartContext.js

import React, { createContext, useState, useContext } from "react";

// Crée le Contexte du Panier
export const CartContext = createContext();

// Hook personnalisé pour une utilisation plus simple
export const useCart = () => {
  return useContext(CartContext);
};

// Fournisseur de Contexte (Wrapper pour l'application)
export const CartProvider = ({ children }) => {
  // L'état du panier est un tableau d'objets {id, name, price, quantity}
  const [cartItems, setCartItems] = useState([]);

  // --- Fonctions de Logique du Panier ---

  /**
   * Ajoute un produit au panier ou augmente sa quantité s'il existe déjà.
   * @param {object} product - L'objet produit à ajouter (doit avoir au moins id, name, price).
   */
  const addToCart = (product) => {
    // Vérifie si le produit est déjà dans le panier
    const existingItemIndex = cartItems.findIndex(
      (item) => item.id === product.id
    );

    if (existingItemIndex > -1) {
      // Si l'article existe, augmente la quantité
      const updatedCart = [...cartItems];
      updatedCart[existingItemIndex].quantity += 1;
      setCartItems(updatedCart);
    } else {
      // Sinon, ajoute le nouvel article avec une quantité de 1
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
  };

  /**
   * Retourne le nombre total d'articles (pas de quantités) dans le panier.
   * C'est la valeur pour le badge de notification.
   */
  const getCartCount = () => {
    // Calcul de la somme des quantités
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // L'objet valeur qui sera fourni aux composants
  const contextValue = {
    cartItems,
    addToCart,
    getCartCount,
    // Vous pouvez ajouter ici: removeFromCart, clearCart, etc.
  };

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
};
