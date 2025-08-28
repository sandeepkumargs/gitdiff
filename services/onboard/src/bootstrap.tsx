import React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./App.css";
import "primeicons/primeicons.css";
import { createRouter } from "./routing/router-factory";
import { RoutingStrategy } from "./routing/types";
import { APIOptions, PrimeReactProvider } from "primereact/api";
import Tailwind from "primereact/passthrough/tailwind";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// index.js or App.js
import 'primereact/resources/themes/saga-blue/theme.css';  // Theme CSS
import 'primereact/resources/primereact.min.css';           // Core CSS

import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";


const config: APIOptions = {
  unstyled: true,
  ripple: true,
  pt: Tailwind,
  ptOptions: { mergeSections: true, mergeProps: true },
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

  const queryClient = new QueryClient();

  root.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <PrimeReactProvider value={config}>
          <RouterProvider router={router} />
        </PrimeReactProvider>
      </QueryClientProvider>
    </React.StrictMode>,
  );

  return () => queueMicrotask(() => root.unmount());
};

export { mount };
