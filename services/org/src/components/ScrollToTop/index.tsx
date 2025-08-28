import { useEffect } from "react";

const ScrollToTop = () => {
  useEffect(() => {
    const handleNavigation = () => {
      window.scrollTo(0, 0);
    };

    // Listen for back/forward navigation
    window.addEventListener("popstate", handleNavigation);

    // Monkey-patch pushState & replaceState to detect programmatic navigation
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      originalPushState.apply(this, args);
      handleNavigation();
    };

    history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      handleNavigation();
    };

    return () => {
      window.removeEventListener("popstate", handleNavigation);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);

  return null;
};

export default ScrollToTop;
