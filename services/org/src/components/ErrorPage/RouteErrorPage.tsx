// src/components/RouteErrorPage.tsx
import React from 'react';
import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { Button } from 'primereact/button';
import Lottie from 'lottie-react';
import errorAnimation from '../../assets/404_animation.json'; // Replace with your Lottie file
import { useNavigate } from 'react-router-dom';

export default function RouteErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();
  
  const title = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : 'Something went wrong';

  const detail =
    isRouteErrorResponse(error)
      ? (error.data && typeof error.data === 'string' ? error.data : 'Route error')
      : (error instanceof Error ? error.message : 'Unexpected application error');

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 to-white flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full flex flex-col md:flex-row items-center justify-center gap-10">
        {/* Lottie Animation */}
        <div className="w-full md:w-1/2 lg:w-2/5">
          <Lottie 
            animationData={errorAnimation} 
            loop={true}
            className="w-full h-auto max-h-96"
          />
        </div>

        {/* Error Content */}
        <div className="w-full md:w-1/2 space-y-6 text-center md:text-left">
          <h1 className="text-5xl font-bold text-gray-800">Oops!</h1>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-700">{title}</h2>
            <p className="text-gray-600">{detail}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
            <Button
              label="Try Again"
              icon="pi pi-sync"
              className="p-button-text p-button-rounded shadow-sm hover:shadow-md transition-all"
              onClick={() => window.location.reload()}
            />
            <Button
              label="Go Home"
              icon="pi pi-home"
              className="p-button-rounded shadow-sm hover:shadow-md transition-all"
              onClick={() => navigate('/')}
            />
            <Button
              label="Contact Support"
              icon="pi pi-envelope"
              className="p-button-outlined p-button-rounded shadow-sm hover:shadow-md transition-all"
              onClick={() => navigate('/contact')}
            />
          </div>

          <p className="text-sm text-gray-400 mt-6">
            Error reference: #{Math.random().toString(36).substring(2, 10).toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  );
}