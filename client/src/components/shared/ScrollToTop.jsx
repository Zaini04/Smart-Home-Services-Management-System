import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Attempt to scroll the window object
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant"
    });
    
    // Also scroll the main element if Provider Layout restricts window scrolling
    const mainArea = document.querySelector("main");
    if (mainArea) {
      mainArea.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant"
      });
    }
  }, [pathname]);

  return null;
}

