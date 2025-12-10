import { useState, useEffect } from "react";

// Vos composants
import Cards from "../../components/Cards";
import Figures from "../../components/Figures";
import Momo from "../../components/Momo";
import ShoppingLoader from "../../components/ShoppingLoader";

// Nouveaux composants pour le sélecteur de chaussures
import MainShoeDisplay from "../../components/MainShoeDisplay";
import Thumbnail from "../../components/Thumbnail";

// Hook pour le panier (gardé même s'il n'est pas utilisé dans cette logique)
import { useCart } from "../../components/CartContext";

// Données SIMULÉES des chaussures (Une seule image par article)
// ⚠️ ASSUREZ-VOUS QUE CES CHEMINS SONT VALIDES (Ex: dans le dossier public ou importés)
const SHOE_DATA = [
  { id: 1, name: "Beige & Maroon", imageURL: "/images/images2.jpg" },
  { id: 2, name: "Tan & Black", imageURL: "/images/images2.jpg" },
  { id: 3, name: "Blue Trail", imageURL: "/images/images3.jpg" },
];

const API_URL =
  "https://mohamed-amine-namasse.students-laplateforme.io/wordpress-eco/wordpress/wp-json/wp/v2/posts";

function Home() {
  const { clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(true);

  // État du sélecteur de chaussures
  const [selectedShoe, setSelectedShoe] = useState(SHOE_DATA[0]);

  // Fonction pour changer la chaussure sélectionnée
  const handleShoeSelect = (shoe) => {
    setSelectedShoe(shoe);
  };

  // --- LOGIQUE DU LOADER (UX) ---
  useEffect(() => {
    const MINIMUM_LOAD_TIME = 1500;

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, MINIMUM_LOAD_TIME);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* 1. Affichage du Loader */}
      {isLoading && <ShoppingLoader isLoading={isLoading} />}

      {/* 2. Rendu du contenu avec transition d'opacité */}
      <div
        style={{
          opacity: isLoading ? 0 : 1,
          transition: "opacity 0.5s ease-in-out",
          pointerEvents: isLoading ? "none" : "auto",
        }}
      >
        <header className="home-header">
          <h1 className="display-4 text-center">Nouvelle collection</h1>
          <p className="lead text-center">Autonne & Hiver</p>
        </header>

        {/* ⭐️ SÉLECTEUR DE CHAUSSURES (Remplace MonCarousel) ⭐️ */}
        <section className="shoe-selector-container container mt-5 mb-5">
          <p>
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ea nemo,
            esse laudantium reprehenderit numquam quae ut excepturi aliquid et
            explicabo dolore odit unde est nam cumque eum minima facilis?
            Perspiciatis!
          </p>
          <div>
            {/* Affichage de la chaussure principale */}
            <MainShoeDisplay
              imageURL={selectedShoe.imageURL}
              name={selectedShoe.name}
            />

            {/* Liste des vignettes */}
            <div className="thumbnail-list d-flex justify-content-center gap-3 mt-4">
              {SHOE_DATA.map((shoe) => (
                <Thumbnail
                  key={shoe.id}
                  shoe={shoe}
                  imageURL={shoe.imageURL} // Une seule image est utilisée ici
                  isSelected={shoe.id === selectedShoe.id}
                  onSelect={handleShoeSelect}
                />
              ))}
            </div>
          </div>
        </section>
        {/* ⭐️ FIN SÉLECTEUR ⭐️ */}

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
