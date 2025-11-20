import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Contact from "./pages/Contact/index.jsx";
import About from "./pages/about/index.jsx";
import NotFound from "./pages/notfound/index.jsx";
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
export default App;
