// ...existing code...
import "./style.css";
import MonCarousel from "../../components/MonCarousel";
import Cards from "../../components/Cards";


const API_URL =
  "https://mohamed-amine-namasse.students-laplateforme.io/wordpress-eco/wordpress/wp-json/wp/v2/posts";



function Home() {
  return (
    <div>
      <header className="home-header">
        <h1 className="display-4 text-center">Nouvelle collection</h1>
        <p className="lead text-center">Autonne & Hiver</p>
      </header>

      <MonCarousel />
      <Cards />

      <section className="container mt-5">
        <h2 className="h4">Nouveautés cette semaine</h2>
        <p>Nos crampons du moments.</p>
      </section>
    </div>
  );
}

export default Home;
// ...existing code...


