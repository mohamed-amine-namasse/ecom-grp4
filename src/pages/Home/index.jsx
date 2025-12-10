import { useState, useEffect } from "react";


import Cards from "../../components/Cards";
import Figures from "../../components/Figures";
import Momo from "../../components/Momo";
import ShoppingLoader from "../../components/ShoppingLoader";

import MainShoeDisplay from "../../components/MainShoeDisplay";
import Thumbnail from "../../components/Thumbnail";

import { useCart } from "../../components/CartContext";


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


  const [selectedShoe, setSelectedShoe] = useState(SHOE_DATA[0]);

  const handleShoeSelect = (shoe) => {
    setSelectedShoe(shoe);
  };


  useEffect(() => {
    const MINIMUM_LOAD_TIME = 1500;

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, MINIMUM_LOAD_TIME);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
  
      {isLoading && <ShoppingLoader isLoading={isLoading} />}

    
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

     
        <section className="shoe-selector-container container mt-5 mb-5">
          <p>
           Chez Foot Market, nous mettons à l’honneur les joueuses qui veulent aller plus loin, plus vite et plus fort. Découvrez une sélection de crampons spécialement conçus pour les femmes, alliant performance, confort et style sur tous les terrains.

Que vous soyez débutante, passionnée ou joueuse confirmée, nous vous proposons des modèles adaptés à votre jeu : crampons pour terrain sec, synthétique, mouillé ou indoor. Notre mission : vous offrir l’équipement parfait pour exprimer tout votre potentiel.
          </p>
          <div>
           
            <MainShoeDisplay
              imageURL={selectedShoe.imageURL}
              name={selectedShoe.name}
            />

         
            <div className="thumbnail-list d-flex justify-content-center gap-3 mt-4">
              {SHOE_DATA.map((shoe) => (
                <Thumbnail
                  key={shoe.id}
                  shoe={shoe}
                  imageURL={shoe.imageURL} 
                  isSelected={shoe.id === selectedShoe.id}
                  onSelect={handleShoeSelect}
                />
              ))}
            </div>
          </div>
        </section>
     

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
