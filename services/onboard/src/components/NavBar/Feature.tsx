import React from 'react';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

const Feature = () => {
  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="lg:text-center">
          <h2 className="text-lg text-indigo-600 font-semibold tracking-wide uppercase">Key Features</h2>
          <p className="mt-2 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Features Tailored to Your Needs
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Discover the capabilities that make our platform stand out.
          </p>
        </div>

        <div className="mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          <div className="relative bg-white shadow-xl rounded-lg p-8 group hover:shadow-2xl transition-shadow duration-500">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-indigo-500 text-white">
              <i className="pi pi-check text-xl"></i>
            </div>
            <h3 className="mt-6 text-xl leading-6 font-semibold text-gray-900">
              Integration Simplicity
            </h3>
            <p className="mt-4 text-base text-gray-500">
              Connect effortlessly to your existing systems for a streamlined workflow.
            </p>
            <div className="absolute inset-0 bg-indigo-100 opacity-0 group-hover:opacity-25 transition-opacity duration-300"></div>
          </div>

          <div className="relative bg-white shadow-xl rounded-lg p-8 group hover:shadow-2xl transition-shadow duration-500">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-indigo-500 text-white">
              <i className="pi pi-cog text-xl"></i>
            </div>
            <h3 className="mt-6 text-xl leading-6 font-semibold text-gray-900">
              Highly Customizable
            </h3>
            <p className="mt-4 text-base text-gray-500">
              Shape the platform to fit your specific needs with ease.
            </p>
            <div className="absolute inset-0 bg-indigo-100 opacity-0 group-hover:opacity-25 transition-opacity duration-300"></div>
          </div>

          <div className="relative bg-white shadow-xl rounded-lg p-8 group hover:shadow-2xl transition-shadow duration-500">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-indigo-500 text-white">
              <i className="pi pi-users text-xl"></i>
            </div>
            <h3 className="mt-6 text-xl leading-6 font-semibold text-gray-900">
              Collaborative by Design
            </h3>
            <p className="mt-4 text-base text-gray-500">
              Foster teamwork with built-in tools for collaboration.
            </p>
            <div className="absolute inset-0 bg-indigo-100 opacity-0 group-hover:opacity-25 transition-opacity duration-300"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feature;
