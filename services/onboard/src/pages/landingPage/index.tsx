import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import NavBar from "../../components/NavBar";
import { Divider } from "primereact/divider";

import amblogo from "../../assets/amb-logo.jpg";
import mmlogo from "../../assets/mm-logo.jpg";
import tslogo from "../../assets/ts-logo.png";
import headerImage from "../../assets/Background.jpg";
import curvedImage from "../../assets/curved.jpg";

const ONBOARDING_URL = process.env.ONBOARDING_URL
const BASE_URL = process.env.BASE_URL
const LOGIN_URL = process.env.LOGIN_URL


// Custom hook to load copies from public/copies.json
const useCopies = () => {
  const [copies, setCopies] = useState({});

  useEffect(() => {
    fetch("/copies.json")
      .then((response) => response.json())
      .then((data) => setCopies(data))
      .catch((error) => console.error("Error loading copies:", error));
  }, []);

  const getCopy = (key) => copies[key] || `[[${key}]]`;
  return getCopy;
};

// Featured Products Card Component (Cards with Read More buttons)
const FeaturedProductsCard = ({ getCopy }) => {
  const handleAmbClick = () => {
    window.location.href =
      `${BASE_URL}/assets/ambiguity_checker.html`;
  };
  const handleMMClick = () => {
    window.location.href =
      `${BASE_URL}/assets/mind_maps.html`;
  };
  const handleTSClick = () => {
    window.location.href =
      `${BASE_URL}/assets/test_scenario.html`;
  };

  return (
    <div className="container mx-auto my-10 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-10">
        {/* Card 1 */}
        <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl">
          {/* Left Side (Image) */}
          <div
            className="w-full md:w-1/2 h-64 sm:h-72 bg-cover bg-center relative"
            style={{
              backgroundImage: `url(${curvedImage})`,
              clipPath: "polygon(0 0, 90% 0, 100% 100%, 0 100%)",
            }}
          >
            <h1 className="absolute inset-0 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold bg-black bg-opacity-75 px-4 py-2">
              {getCopy("Feature Card 1 Title") !== `[[Feature Card 1 Title]]`
                ? getCopy("Feature Card 1 Title")
                : "Kill Ambiguity"}
            </h1>
          </div>
          {/* Right Side (Content) */}
          <div className="p-6 md:w-1/2 flex flex-col justify-center">
            <p className="text-gray-600 mb-6 text-base sm:text-lg">
              {getCopy("Feature Card 1 Content") !== `[[Feature Card 1 Content]]`
                ? getCopy("Feature Card 1 Content")
                : "Identify and resolve ambiguities in user stories with AI-driven analysis. Automatically generate Acceptance Criteria, Assumptions, and a Refined User Story for improved clarity and precision."}
            </p>
            <div className="flex gap-4">
              <button
                type="button"
                className="inline-flex items-center justify-center h-10 sm:h-12 px-4 sm:px-8 font-medium tracking-wide text-white transition duration-200 rounded-lg shadow-lg bg-red-600 hover:bg-orange-700 focus:shadow-outline focus:outline-none transform hover:scale-105 text-sm sm:text-base"
                onClick={handleAmbClick}
              >
                {getCopy("Feature Card Read More Button") !== `[[Feature Card Read More Button]]`
                  ? getCopy("Feature Card Read More Button")
                  : "Read More"}
              </button>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="flex flex-col md:flex-row-reverse bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl">
          {/* Right Side (Image) */}
          <div
            className="w-full md:w-1/2 h-64 sm:h-72 bg-cover bg-center relative"
            style={{
              backgroundImage: `url(${curvedImage})`,
              clipPath: "polygon(0 0, 100% 0, 100% 100%, 10% 100%)",
            }}
          >
            <h1 className="absolute inset-0 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold bg-black bg-opacity-75 px-4 py-2">
              {getCopy("Feature Card 2 Title") !== `[[Feature Card 2 Title]]`
                ? getCopy("Feature Card 2 Title")
                : "Mind Maps"}
            </h1>
          </div>
          {/* Left Side (Content) */}
          <div className="flex-grow md:w-1/2 p-6 flex flex-col justify-center">
            <p className="text-gray-600 mb-6 text-base sm:text-lg">
              {getCopy("Feature Card 2 Content") !== `[[Feature Card 2 Content]]`
                ? getCopy("Feature Card 2 Content")
                : "Visualize complex ideas with structured mind maps. Explore key system aspects, including Overview, Reliability, Availability, Scalability, Resilience, and System Components, to refine user stories effectively."}
            </p>
            <div className="flex gap-4">
              <button
                type="button"
                className="inline-flex items-center justify-center h-10 sm:h-12 px-4 sm:px-8 font-medium tracking-wide text-white transition duration-200 rounded-lg shadow-lg bg-red-600 hover:bg-orange-700 focus:shadow-outline focus:outline-none transform hover:scale-105 text-sm sm:text-base"
                onClick={handleMMClick}
              >
                {getCopy("Feature Card Read More Button") !== `[[Feature Card Read More Button]]`
                  ? getCopy("Feature Card Read More Button")
                  : "Read More"}
              </button>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl">
          {/* Left Side (Image) */}
          <div
            className="w-full md:w-1/2 h-64 sm:h-72 bg-cover bg-center relative"
            style={{
              backgroundImage: `url(${curvedImage})`,
              clipPath: "polygon(0 0, 90% 0, 100% 100%, 0 100%)",
            }}
          >
            <h1 className="absolute inset-0 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold bg-black bg-opacity-75 px-4 py-2">
              {getCopy("Feature Card 3 Title") !== `[[Feature Card 3 Title]]`
                ? getCopy("Feature Card 3 Title")
                : "Test Scenario"}
            </h1>
          </div>
          {/* Right Side (Content) */}
          <div className="p-6 md:w-1/2 flex flex-col justify-center">
            <p className="text-gray-600 mb-6 text-base sm:text-lg">
              {getCopy("Feature Card 3 Content") !== `[[Feature Card 3 Content]]`
                ? getCopy("Feature Card 3 Content")
                : "Automatically generate positive, negative and edge-case test scenarios covering functionality, performance, and security. Ensure robust testing for user stories with minimal manual effort."}
            </p>
            <div className="flex gap-4">
              <button
                type="button"
                className="inline-flex items-center justify-center h-10 sm:h-12 px-4 sm:px-8 font-medium tracking-wide text-white transition duration-200 rounded-lg shadow-lg bg-red-600 hover:bg-orange-700 focus:shadow-outline focus:outline-none transform hover:scale-105 text-sm sm:text-base"
                onClick={handleTSClick}
              >
                {getCopy("Feature Card Read More Button") !== `[[Feature Card Read More Button]]`
                  ? getCopy("Feature Card Read More Button")
                  : "Read More"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Core Attributes Card Component (using a responsive grid layout)
const CoreAttributesCard = ({ getCopy }) => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col items-center bg-black rounded-lg shadow-lg p-6 transition-transform duration-300 hover:shadow-xl">
          <div className="bg-blue-100 p-3 rounded-full mb-4">
            <span className="text-5xl">🎯</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
            {getCopy("Attribute Card 1 Title") !== `[[Attribute Card 1 Title]]`
              ? getCopy("Attribute Card 1 Title")
              : "AI-Powered Precision"}
          </h3>
          <p className="text-base sm:text-lg text-white text-center mt-3">
            {getCopy("Attribute Card 1 Content") !== `[[Attribute Card 1 Content]]`
              ? getCopy("Attribute Card 1 Content")
              : "Our neural networks trained on 1M+ user stories deliver unmatched requirement clarity and test accuracy"}
          </p>
        </div>

        <div className="flex flex-col items-center bg-black rounded-lg shadow-lg p-6 transition-transform duration-300 hover:shadow-xl">
          <div className="bg-blue-100 p-3 rounded-full mb-4">
            <span className="text-5xl">🤝</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
            {getCopy("Attribute Card 2 Title") !== `[[Attribute Card 2 Title]]`
              ? getCopy("Attribute Card 2 Title")
              : "Human+AI Synergy"}
          </h3>
          <p className="text-base sm:text-lg text-white text-center mt-3">
            {getCopy("Attribute Card 2 Content") !== `[[Attribute Card 2 Content]]`
              ? getCopy("Attribute Card 2 Content")
              : "Enhance - don't replace - your team's expertise with intelligent augmentation at every workflow stage"}
          </p>
        </div>

        <div className="flex flex-col items-center bg-black rounded-lg shadow-lg p-6 transition-transform duration-300 hover:shadow-xl">
          <div className="bg-blue-100 p-3 rounded-full mb-4">
            <span className="text-5xl">🔒</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
            {getCopy("Attribute Card 3 Title") !== `[[Attribute Card 3 Title]]`
              ? getCopy("Attribute Card 3 Title")
              : "End-to-End Traceability"}
          </h3>
          <p className="text-base sm:text-lg text-white text-center mt-3">
            {getCopy("Attribute Card 3 Content") !== `[[Attribute Card 3 Content]]`
              ? getCopy("Attribute Card 3 Content")
              : "Maintain perfect audit trails from initial story to final test execution with our blockchain-backed system"}
          </p>
        </div>
      </div>
    </div>
  );
};

// Landing Page Component
const LandingPage = () => {
  const navigate = useNavigate();
  const getCopy = useCopies();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Optional Navigation Bar */}

      <main className="flex-grow">
        {/* Header Section */}
        <div
          className="relative text-white bg-cover bg-center py-20 sm:py-28 md:py-40"
          style={{
            backgroundImage: `url(${headerImage})`,
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className="relative z-10 text-center lg:text-left mx-4 sm:mx-8 md:mx-20 max-w-4xl">
            <h1 className="mb-6 text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight">
              {getCopy("Title_p1") !== `[[Title_p1]]`
                ? getCopy("Title_p1")
                : "Why Quali"}
              <span className="text-red-600">
                {getCopy("Title_p2") !== `[[Title_p2]]`
                  ? getCopy("Title_p2")
                  : "zen?"}
              </span>
            </h1>
            <p className="mb-6 text-base sm:text-lg md:text-xl text-gray-300">
              {getCopy("Sub Title") !== `[[Sub Title]]`
                ? getCopy("Sub Title")
                : "by leveraging the power of Artificial Intelligence"}
            </p>
            <div className="flex justify-center lg:justify-start">
              <button
                type="button"
                className="inline-flex text-base sm:text-lg items-center justify-center h-10 sm:h-12 px-4 sm:px-8 font-medium tracking-wide text-white transition duration-200 rounded-lg shadow-lg bg-red-600 hover:bg-orange-700 focus:shadow-outline focus:outline-none transform hover:scale-105"
                // onClick={() => navigate("/sign-up")}
                onClick={() =>
                  (window.location.href = `${LOGIN_URL}`)
                }
              >
                {getCopy("Login Button") !== `[[Login Button]]`
                  ? getCopy("Login Button")
                  : "Get Started For Free"}
              </button>
            </div>
          </div>
        </div>

        {/* Featured Products Section */}
        <section className="mt-16">
          <h2 className="text-center text-2xl sm:text-3xl md:text-4xl font-bold text-black">
            {getCopy("Attribute Card Heading") !== `[[Attribute Card Heading]]`
              ? getCopy("Attribute Card Heading")
              : "Featured Products"}
          </h2>
          <CoreAttributesCard getCopy={getCopy} />
        </section>

        {/* Core Attributes Section */}
        <section className="mt-16">
          <h2 className="text-center text-2xl sm:text-3xl md:text-4xl font-bold text-black">
            {getCopy("Feature Card Heading") !== `[[Feature Card Heading]]`
              ? getCopy("Feature Card Heading")
              : "Core Attributes"}
          </h2>
          <FeaturedProductsCard getCopy={getCopy} />
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;
