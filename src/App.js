import { BrowserRouter as Router, Routes, Route } from "react-router";
import Contact from "./pages/Contact";
import './App.css';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </Router>
  );
}
export default App;
