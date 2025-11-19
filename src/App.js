
import { Route, Router, Routes } from "react-router"
import { Contact } from "./pages/Contact ";
function App() {
  return (
  
      <Router>
       <Routes> 
         <Route path="/contact" element={<Contact />}/>
         <Route path="*" element={<Error />}/>
         </Routes>
      </Router>
   
  );
}
export default App;
