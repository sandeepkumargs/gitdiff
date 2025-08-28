import React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./App.css";
import "primeicons/primeicons.css";
import { createRouter } from "./routing/router-factory";
import { RoutingStrategy } from "./routing/types";
import { APIOptions, PrimeReactProvider } from "primereact/api";
import Tailwind from "primereact/passthrough/tailwind";
import 'primereact/resources/themes/saga-blue/theme.css';  // Theme CSS
import 'primereact/resources/primereact.min.css';           // Core CSS
import { twMerge } from 'tailwind-merge';
import TopNavBar from './components/topnav'; // Import TopNavBar
import { AppProvider } from "./routing/appContext";
import ScrollToTop from "./components/ScrollToTop";
import Disclaimer from "./components/Disclaimer";
import { ErrorBoundary } from "react-error-boundary";
import GlobalErrorFallback from "./components/ErrorPage/GlobalErrorFallback";


const config: APIOptions = {
  unstyled: true,
  pt: Tailwind,
};

const mount = ({
  mountPoint,
  initialPathname,
  routingStrategy,
}: {
  mountPoint: HTMLElement;
  initialPathname?: string;
  routingStrategy?: RoutingStrategy;
}) => {
  const router = createRouter({ strategy: routingStrategy, initialPathname });
  const root = createRoot(mountPoint);

    // Function to update viewport height
    const updateHeight = () => {
      document.documentElement.style.setProperty(
        "--vh",
        `${window.innerHeight * 0.01}px`
      );
    };
  
    window.addEventListener("resize", updateHeight);
    updateHeight(); // Set initial height

  root.render(
    <AppProvider>
    <React.StrictMode>
      <PrimeReactProvider value={{ unstyled: false, pt: Tailwind }}>
      <ErrorBoundary
          FallbackComponent={GlobalErrorFallback}
          onError={(error, info) => {
            // optional: send to Sentry/telemetry
          }}
          onReset={() => {
            // optional: clear global state, query cache, etc.
          }}
        >
        <div>
          <ScrollToTop />
          <RouterProvider router={router} /> {/* Ensure RouterProvider wraps the entire app */}
          {!["/", "/login"].includes(location.pathname) && <Disclaimer />}

        </div>
        </ErrorBoundary>
      </PrimeReactProvider>
    </React.StrictMode>
    </AppProvider>
  );

  return () => {
    window.removeEventListener("resize", updateHeight);
    queueMicrotask(() => root.unmount());
  };
};

export { mount };
