// src/components/GlobalErrorFallback.tsx
import React, { useState, useEffect } from 'react';
import type { FallbackProps } from 'react-error-boundary';
import { Button } from 'primereact/button';
import Lottie from 'lottie-react';
// import errorAnimation from '../../assets/404_animation.json';

export default function GlobalErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [particleElements, setParticleElements] = useState<JSX.Element[]>([]);

  const errorDetails = error?.stack || error?.message || 'No additional error details available';
  const errorId = Math.random().toString(36).substring(2, 10).toUpperCase();

  useEffect(() => {
    // Animate in the content
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Create floating particles
    const particles = Array.from({ length: 15 }, (_, i) => (
      <div
        key={i}
        className="absolute w-2 h-2 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full opacity-30 animate-float"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 3}s`,
          animationDuration: `${3 + Math.random() * 2}s`,
        }}
      />
    ));
    setParticleElements(particles);

    return () => clearTimeout(timer);
  }, []);

  const handleGoHome = () => {
    window.history.back();
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const handleContactSupport = () => {
    window.location.href = '/support';
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-4 w-72 h-72 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-r from-pink-400 to-red-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particleElements}
      </div>

      {/* Main Content */}
      <div className={`relative z-10 min-h-screen flex flex-col items-center justify-center p-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        
        {/* Error Icon Animation */}
        <div className="mb-8 relative">
          <div className="w-32 h-32 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center shadow-2xl animate-pulse-slow">
            {/* Custom animated error icon */}
            <div className="relative">
              <div className="w-16 h-16 border-4 border-red-400 rounded-full flex items-center justify-center animate-bounce-slow">
                <i className="pi pi-exclamation-triangle text-3xl text-red-500 animate-pulse"></i>
              </div>
              {/* Ripple effect */}
              <div className="absolute inset-0 w-16 h-16 border-2 border-red-300 rounded-full animate-ping"></div>
            </div>
          </div>
          
          {/* Orbiting elements */}
          <div className="absolute inset-0 w-32 h-32 animate-spin-slow">
            <div className="absolute top-0 left-1/2 w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-gradient-to-r from-pink-400 to-red-400 rounded-full transform -translate-x-1/2 translate-y-1/2"></div>
          </div>
        </div>

        {/* Error Message */}
        <div className="text-center mb-8 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 bg-clip-text text-transparent animate-gradient-x">
            Oops! Something went wrong
          </h1>
          
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto animate-pulse"></div>
          
          <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto">
            We're sorry, but an unexpected error has occurred. Don't worry—our team has been notified.
            <br />
            <span className="inline-block mt-2 text-base text-gray-500">
              Please try refreshing the page, or contact support if the problem persists.
            </span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <Button 
            label="Try Again"
            icon="pi pi-refresh"
            className="p-button-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            onClick={resetErrorBoundary}
          />
          <Button
            label="Go Back"
            icon="pi pi-arrow-left"
            className="p-button-lg p-button-outlined border-2 border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            onClick={handleGoHome}
          />
          <Button
            label="Contact Support"
            icon="pi pi-envelope"
            className="p-button-lg p-button-outlined border-2 border-gray-300 text-gray-700 hover:border-purple-500 hover:text-purple-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            onClick={handleContactSupport}
          />
        </div>

        {/* Error ID Display */}
        <div className="bg-white/60 backdrop-blur-md rounded-xl px-6 py-3 shadow-lg border border-white/20">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <i className="pi pi-info-circle text-blue-500"></i>
            <span>Error ID: <span className="font-mono font-semibold text-blue-600">{errorId}</span></span>
          </div>
        </div>

        {/* Error Details - Only shown in development */}
        {import.meta.env.DEV && (
          <div className={`mt-8 w-full max-w-4xl transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <details className="group bg-white/70 backdrop-blur-md border border-white/30 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
              <summary className="flex justify-between items-center p-6 cursor-pointer list-none hover:bg-white/50 transition-colors duration-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                    <i className="pi pi-code text-white text-sm"></i>
                  </div>
                  <span className="font-semibold text-gray-700 text-lg">Technical Details</span>
                </div>
                <i className="pi pi-chevron-down text-gray-500 transition-transform duration-300 group-open:rotate-180" />
              </summary>
              
              <div className="border-t border-gray-200/50 bg-gradient-to-br from-gray-50 to-white">
                <div className="p-6 space-y-4">
                  <div className="bg-gray-900 rounded-xl p-4 overflow-hidden">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex gap-1">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      </div>
                      <span className="text-gray-400 text-sm font-mono">error.log</span>
                    </div>
                    <pre className="text-sm text-green-400 font-mono overflow-x-auto leading-relaxed">
                      {errorDetails}
                    </pre>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <i className="pi pi-hashtag text-white"></i>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-700">Error Reference</p>
                        <p className="text-sm text-gray-500">Use this ID when contacting support</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-blue-600 text-lg">{errorId}</span>
                  </div>
                </div>
              </div>
            </details>
          </div>
        )}
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        @keyframes gradient-x {
          0%, 100% { background-size: 200% 200%; background-position: left center; }
          50% { background-size: 200% 200%; background-position: right center; }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}