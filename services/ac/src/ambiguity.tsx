import React from 'react';
import ReactDOM from 'react-dom/client';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import ambLogo from '../src/assets/amb-logo.jpg'

import 'primereact/resources/primereact.min.css';
import "primereact/resources/themes/lara-light-cyan/theme.css";
import { APIOptions, PrimeReactProvider } from "primereact/api";
import Tailwind from "primereact/passthrough/tailwind";
import "primeicons/primeicons.css";
import { twMerge } from 'tailwind-merge';
import { useNavigate } from 'react-router-dom';

export default function demo() {
  // const navigate = useNavigate();
  // const handleButtonClick = () => {
  //   navigate('/ambiguity')
  // };
  return (
    <PrimeReactProvider value={{ unstyled: true, pt: Tailwind, ptOptions: { mergeSections: true, mergeProps: true, classNameMergeFunction: twMerge } }}>
      <Card className="text-center p-4">
        <img src={ambLogo} alt="Ambiguity Checker" className="mx-auto mb-4 w-24 h-24 object-contain" />
        <h3 className="font-bold mb-2 text-lg">Kill Ambiguity</h3>
        <p className="text-gray-600 text-sm">Hunt down hidden enemies in your requirements and clear the path for a flawless project victory!</p>
        {/* <Button label="Select" className="p-button-sm p-button-rounded mt-4" /> */}
      </Card>
    </PrimeReactProvider>

  );
}