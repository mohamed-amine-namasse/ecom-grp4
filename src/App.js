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
import Checkout from "./pages/Checkout";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import Update from "./pages/Profile/update";
import Orders from "./pages/Profile/orders";
import Shipping from "./pages/Shipping";
import ProductDetail from "./pages/ProductDetail";
import { CartProvider } from "./components/CartContext";
import ScrollToTop from "./components/ScrollToTop";
import { AuthProvider } from "./components/AuthContext";
import { BrowserRouter as Router, Route, Routes } from "react-router";

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <CartProvider>
          <NavScrollExample />

          <Routes>
            <Route path="/shop" element={<Shop />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/update" element={<Update />} />
            <Route path="/profile/orders/:customerId" element={<Orders />} />
            <Route path="/shipping" element={<Shipping />} />
            <Route path="/" element={<Home />} />
            <Route path="*" element={<Error />} />
          </Routes>
        </CartProvider>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
