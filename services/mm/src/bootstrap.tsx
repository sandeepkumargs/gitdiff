import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import MindMaps from './pages/index'

import 'primereact/resources/primereact.min.css';   
import "primereact/resources/themes/lara-light-cyan/theme.css";   
import { APIOptions, PrimeReactProvider } from "primereact/api";
import Tailwind from "primereact/passthrough/tailwind";
import "primeicons/primeicons.css";
import { twMerge } from 'tailwind-merge';

const config: APIOptions = {
    unstyled: true,
    // ripple: true,
    pt: Tailwind,
    ptOptions: { mergeSections: true, mergeProps: true },
  };

  const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
      <PrimeReactProvider value={{ unstyled: true, pt: Tailwind, ptOptions: { mergeSections: true, mergeProps: true, classNameMergeFunction: twMerge } }}>
    <MindMaps />
    </PrimeReactProvider>
  </React.StrictMode>,
  
);
