import React, { useState, useEffect } from "react";
import "./style.css";
import MonCarousel from "../../components/MonCarousel";
import Cards from "../../components/Cards";
// 1. Importez le nouveau loader de shopping
import ShoppingLoader from "../../components/ShoppingLoader";

function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Définir un délai minimum pour le loader (UX)
    const MINIMUM_LOAD_TIME = 1500; // 1.5 secondes pour profiter de l'animation

    const timer = setTimeout(() => {
      setIsLoading(false); // Désactive le loader après le temps minimum
    }, MINIMUM_LOAD_TIME);

    // Nettoyage : toujours bonne pratique de nettoyer le timer
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* 2. Utilisez le ShoppingLoader */}
      {/* L'icône de shopping sera visible pendant au moins 1.5s, puis elle disparaîtra en fondu */}
      {isLoading && <ShoppingLoader isLoading={isLoading} />}

      {/* Rendre le contenu de la page */}
      <div>
        <header className="home-header">
          <h1 className="display-4 text-center">Nouvelle collection</h1>
          <p className="lead text-center">Autonne & Hiver</p>
        </header>

        <MonCarousel />

        <section className="container mt-5">
          <h2 className="h4">Nouveautés cette semaine</h2>
          <p>Nos crampons du moments.</p>
        </section>
        <Cards />
      </div>
    </>
  );
}

export default Home;
