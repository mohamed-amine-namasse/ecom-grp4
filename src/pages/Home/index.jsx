import "./style.css";
import MonCarousel from "../../components/MonCarousel";
import Cards from "../../components/Cards";
import figures from "../../components/figure";
import Figures from "../../components/figure";
import momo from  "../../components/momo";
import Momo from "../../components/momo";
const API_URL =
  "https://mohamed-amine-namasse.students-laplateforme.io/wordpress-eco/wordpress/wp-json/wp/v2/posts";



function Home() {
  return (
    <div>
      <header className="home-header">
        <h1 className="display-4 text-center">Nouvelle collection</h1>
        <p className="lead text-center">Automne & Hiver</p>
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

       <section className="container mt-5 mb-6">
        <h2 className="h5">Notre approche</h2>
        <p>Chez Foot Market, nous allions créativité et savoir-faire pour créer des crampons uniques. Chaque modèle est confectionné avec minutie, garantissant une finition d'une qualité exceptionnelle.</p>
        </section>

      <Momo />

        
    </div>

  

    



    
    
  );
}

export default Home;



