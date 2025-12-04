import React, { createContext, useContext, useState, useEffect } from "react";
import { loginUser, validateStoredToken } from "../Api"; // Assurez-vous que le chemin est correct

// État initial de l'utilisateur (non connecté)
const initialAuthState = {
  isAuthenticated: false,
  user: null, // Contient { id, username, email }
  token: null,
};

const AuthContext = createContext(initialAuthState);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(initialAuthState);
  const [loading, setLoading] = useState(true);

  // Fonction utilitaire pour lire l'état complet du localStorage
  const getAuthStateFromStorage = () => {
    try {
      const storedData = localStorage.getItem("JWT Token:");
      if (storedData) {
        const data = JSON.parse(storedData);

        if (data.token && data.customerId) {
          return {
            isAuthenticated: true,
            user: {
              id: data.customerId, // 👈 Lecture de l'ID Client stocké
              username: data.user_display_name,
              email: data.user_email,
            },
            token: data.token,
          };
        }
      }
    } catch (e) {
      console.error("Erreur de parsing du localStorage", e);
    }
    return initialAuthState;
  };

  // 1. Charger et valider le token au montage
  useEffect(() => {
    const checkToken = async () => {
      setLoading(true);
      try {
        const validationResponse = await validateStoredToken();
        const storedState = getAuthStateFromStorage();

        if (
          validationResponse.code === "jwt_auth_valid_token" &&
          storedState.isAuthenticated
        ) {
          setAuthState(storedState);
        } else {
          localStorage.removeItem("JWT Token:");
          setAuthState(initialAuthState);
        }
      } catch (error) {
        localStorage.removeItem("JWT Token:");
        setAuthState(initialAuthState);
      } finally {
        setLoading(false);
      }
    };
    checkToken();
  }, []);

  // --- FONCTIONS D'AUTHENTIFICATION ---

  const login = async (username, password) => {
    try {
      const data = await loginUser(username, password); // data contient customerId

      setAuthState({
        isAuthenticated: true,
        user: {
          id: data.customerId, // 👈 Utilisation de l'ID Client
          username: data.user_display_name,
          email: data.user_email,
        },
        token: data.token,
      });
      return true;
    } catch (error) {
      console.error("Erreur de connexion dans AuthContext:", error.message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("JWT Token:");
    setAuthState(initialAuthState);
  };

  // --- RENDU DU CONTEXTE ---

  if (loading) {
    return <div>Vérification de la session...</div>;
  }

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
