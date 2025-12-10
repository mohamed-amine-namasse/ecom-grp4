import { useEffect } from "react";
import { useLocation } from "react-router";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Cette fonction est exécutée à chaque changement de l'URL (route)
    window.scrollTo(0, 0);
  }, [pathname]); // 👈 Déclencher l'effet lorsque 'pathname' change

  return null;
}

export default ScrollToTop;
