import React from 'react';
import ReactDOM from 'react-dom/client';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import tsLogo from '../assets/ts-logo.png'

import '../App.css'

import 'primereact/resources/primereact.min.css';
import "primereact/resources/themes/lara-light-cyan/theme.css";
import { APIOptions, PrimeReactProvider } from "primereact/api";
import Tailwind from "primereact/passthrough/tailwind";
import "primeicons/primeicons.css";
import { twMerge } from 'tailwind-merge';

export default function demo() {
  return (
    <PrimeReactProvider value={{ unstyled: true, pt: Tailwind, ptOptions: { mergeSections: true, mergeProps: true, classNameMergeFunction: twMerge } }}>
      <Card className="text-center p-4">
        <img src={tsLogo} alt="Test Scenarios" className="mx-auto mb-4 w-24 h-24 object-contain" />
        <h3 className="font-bold mb-2 text-lg">Generate Scenarios</h3>
        <p className="text-gray-600 text-sm"> Gear up, test your strategies, and crush every bug standing between you and project perfection!</p>
        {/* <Button label="Select" className="p-button-sm p-button-rounded mt-4"  /> */}
      </Card>
    </PrimeReactProvider>

  );
}