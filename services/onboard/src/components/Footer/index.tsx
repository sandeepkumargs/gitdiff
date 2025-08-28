import React from "react";
import { Divider } from "primereact/divider";
import logo from "../../assets/IGS_LOGO3.png";

const Footer = () => {
  return (
    <div className="bg-black">
      <div className="px-8 py-8 sm:px-8 sm:py-12 rounded shadow-xl">
        <div className="flex flex-col lg:flex-row items-center lg:items-start">
          {/* Left Section */}
          <div className="lg:w-1/2 lg:pr-5 mb-6 lg:mb-0">
            <h2 className="font-sans text-3xl font-bold tracking-tight text-white sm:text-4xl sm:leading-none">
              Leveraging the power of{" "}
              <span className="inline-block text-deep-purple-accent-400">
                Artificial Intelligence
              </span>
            </h2>
          </div>

          {/* Responsive Divider */}
          <div className="block lg:hidden">
            <Divider layout="horizontal" className="my-4 border-gray-600" />
          </div>
          <div className="hidden lg:block">
            <Divider layout="vertical" className="mx-4 border-gray-600" />
          </div>

          {/* Right Section */}
          <div className="lg:w-1/2">
            <p className="mb-4 text-base text-white">
              Utilizing AI-driven analysis of requirements, this process detects
              vague, unclear, or contradictory statements, significantly
              improving the clarity, coverage, and efficiency of testing. By
              generating comprehensive test scenarios, it enhances the accuracy
              and effectiveness of the testing process, focusing on edge cases
              and high-risk areas to ensure higher quality software.
            </p>
            {/* Branding Section */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 px-4 py-4 rounded-lg shadow-md">
              <span className="text-white font-extrabold text-xl tracking-wide">
                Qualizen
              </span>
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-gray-400 font-medium text-sm uppercase tracking-widest">
                  Powered by
                </span>
                <img
                  src={logo}
                  alt="IGS Logo"
                  className="h-12 sm:h-16 opacity-90 hover:opacity-100 transition-opacity duration-200"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
