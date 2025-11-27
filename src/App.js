import logo from "./logo.svg";
import "./App.css";
import NavScrollExample from "./components/NavScrollExample";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import Error from "./pages/Error";
import Shop from "./pages/Shop";
import Terms from "./pages/Terms";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import ProductDetail from "./pages/ProductDetail";
import { CartProvider } from "./components/CartContext";
import { BrowserRouter as Router, Route, Routes } from "react-router";

function App() {
  return (
    <Router>
      <CartProvider>
        <NavScrollExample />

        <Routes>
          <Route path="/shop" element={<Shop />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/produit/:id" element={<ProductDetail />} />
          <Route path="/" element={<Home />} />
          <Route path="*" element={<Error />} />
        </Routes>
      </CartProvider>
      <Footer />
    </Router>
  );
}

export default App;
