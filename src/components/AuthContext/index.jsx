import React, { createContext, useState, useEffect, useContext } from "react";
import { validateStoredToken } from "../Api";

// Clé utilisée pour le Local Storage
const AUTH_STORAGE_KEY = "userAuth";

// 1. Création du Contexte
const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  loading: true, // Doit commencer à true pour vérifier le LS
  login: () => {}, // Fonction pour la connexion
  logout: () => {}, // Fonction pour la déconnexion
});

// 2. Le Fournisseur de Contexte
export const AuthProvider = ({ children }) => {
  // État principal
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Initialisation à true pour la vérification

  // Fonction pour la connexion (utilisée par Login.js)
  const login = (userData) => {
    // 1. Mise à jour de l'état du Contexte (déclenche le re-rendu de Profile.jsx)
    setUser(userData);
    setIsAuthenticated(true);

    // 2. Mise à jour du Local Storage pour la persistance
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));

    // 3. Informer la Navbar (mécanisme custom)
    window.dispatchEvent(new Event("storageUpdate"));
  };

  // Fonction pour la déconnexion (utilisée par NavScrollExample.js)
  const logout = () => {
    // 1. 🛑 Vider l'état global du contexte 🛑
    setUser(null);
    setIsAuthenticated(false);

    // 2. 🛑 Supprimer les données du Local Storage 🛑
    //
    localStorage.removeItem(AUTH_STORAGE_KEY);

    // 3. (Crucial pour la Navbar) Déclencher l'événement de mise à jour du stockage
    window.dispatchEvent(new Event("storageUpdate"));

    console.log("Déconnexion réussie: token retiré et état vidé.");
  };

  // 3. Effet de vérification initiale (Gestion du chargement infini)
  useEffect(() => {
    const checkAuthStatus = async () => {
      const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);

      if (storedAuth) {
        try {
          const data = JSON.parse(storedAuth);

          // 🛑 VÉRIFICATION API : S'assurer que le token est valide

          await validateStoredToken(data.token);

          // Si le token est valide:
          setUser(data);
          setIsAuthenticated(true);
        } catch (error) {
          // Si le token est expiré ou invalide: Nettoyer la session
          console.warn(
            "Token expiré ou invalide. Déconnexion automatique.",
            error
          );
          localStorage.removeItem(AUTH_STORAGE_KEY);
          setUser(null);
          setIsAuthenticated(false);
        }
      }

      //  Assurer l'arrêt du chargement
      setLoading(false);
    };

    checkAuthStatus();
  }, []); // Le tableau vide s'exécute uniquement au montage

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 4. Hook personnalisé pour utiliser le contexte
export const useAuth = () => useContext(AuthContext);

export default AuthProvider;
