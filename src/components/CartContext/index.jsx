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
// Clé utilisée pour le Local Storage (doit être définie une seule fois)
const CART_STORAGE_KEY = "cartItems";

// Fonction pour récupérer le panier du localStorage lors de l'initialisation
const getInitialCart = () => {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
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

  useEffect(() => {
    try {
      // Sauvegarder les données dans localStorage
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (e) {
      console.error("Erreur d'écriture dans localStorage:", e);
    }
  }, [cartItems]); // ------------------------------------------------------------------ // --- FONCTIONS DE LOGIQUE DU PANIER // ------------------------------------------------------------------
  const addToCart = (product, quantityToAdd = 1) => {
    // ... (Logique addToCart inchangée)
    const price = parseFloat(product.price) || 0;
    const maxStock = product.stockQuantity;
    const manageStock = product.manageStock;

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
        let newQuantity = existingItem.quantity + initialQuantity;

        if (manageStock && maxStock !== null && newQuantity > maxStock) {
          newQuantity = maxStock;
        }

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
        let finalQuantity = initialQuantity;

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
            image: product.image || "/img/default.jpg",
            selectedSize: product.selectedSize,
            selectedColor: product.selectedColor,
            manageStock: manageStock,
            stockQuantity: maxStock,
          },
        ];
      }
      return newCart;
    });
  };
  const updateQuantity = (id, newQuantity) => {
    setCartItems((prevItems) => {
      return prevItems.map((item) => {
        if (item.id === id) {
          const maxStock = item.stockQuantity;
          const manageStock = item.manageStock;
          let finalQuantity = newQuantity;

          if (manageStock && maxStock !== null) {
            if (newQuantity > maxStock) {
              finalQuantity = maxStock;
            }
          }

          if (finalQuantity < 1) {
            finalQuantity = 1;
          }

          if (item.quantity === finalQuantity) {
            return item;
          }

          return { ...item, quantity: finalQuantity };
        }
        return item;
      });
    });
  };
  const removeFromCart = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  }; //  Vider complètement le panier et le localStorage
  const clearCart = () => {
    setCartItems([]); // Vider l'état React
    localStorage.removeItem(CART_STORAGE_KEY); // Vider le Local Storage
    console.log("Panier vidé et localStorage nettoyé.");
  }; // ------------------------------------------------------------------ // --- CALCULS OPTIMISÉS (useMemo) // ------------------------------------------------------------------
  const getCartCount = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);
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
    clearCart,
    cartTotal,
  };

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
};
