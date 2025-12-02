import { useState, useEffect } from "react";
import MonCarousel from "../../components/MonCarousel";
import Cards from "../../components/Cards";
import Figures from "../../components/Figures";
import Momo from "../../components/Momo";
import ShoppingLoader from "../../components/ShoppingLoader";
const API_URL =
  "https://mohamed-amine-namasse.students-laplateforme.io/wordpress-eco/wordpress/wp-json/wp/v2/posts";

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

        <section className="container mt-5 mb-5">
          <h2 className="h4">Marques</h2>
        </section>

        <Figures />

        <section className=" container mt-5 mb-5">
          <h2 className="h4 ">Notre approche</h2>
        </section>
        <p className=" container">
          Chez Foot Market, nous allions créativité et savoir-faire pour créer
          des crampons uniques. Chaque modèle est confectionné avec minutie,
          garantissant une finition d'une qualité exceptionnelle.
        </p>

        <Momo />
      </div>
    </>
  );
}

export default Home;
