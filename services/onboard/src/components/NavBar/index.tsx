import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button"; // Import PrimeReact Button
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import igs_logo from "../../assets/logo.png";
import logo2 from "../../assets/logo2.jpeg"
import amblogo from "../../assets/amb-logo.jpg";
import mmlogo from "../../assets/mm-logo.jpg";
import tslogo from "../../assets/ts-logo.png";
import { getLogo } from "../../services/service";
import { color } from "framer-motion";
const ONBOARDING_URL = process.env.ONBOARDING_URL
const BASE_URL = process.env.BASE_URL
const LOGIN_URL = process.env.LOGIN_URL

const Feature = () => {
  return (
    <div className="bg-gradient-to-r from-gray-50 to-white py-16 relative overflow-hidden">
      {/* Subtle Pattern Background */}
      <div
        className="absolute inset-0 opacity-20 bg-gray-200"
        style={{
          backgroundImage: "url(/path/to/pattern.svg)",
          filter: "blur(8px)",
        }}
      ></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="lg:text-center mb-12">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">
            Our Products
          </h2>
          <p className="mt-2 text-4xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Products Designed to Enhance Your Experience
          </p>
          <p className="mt-4 max-w-2xl text-lg text-gray-600 lg:mx-auto">
            Discover a better way to manage your projects, boost productivity,
            and streamline your workflow with our applications.
          </p>
        </div>

        <div className="mt-12">
          <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 gap-x-10">
            {/* Feature 1 */}
            <div className="relative bg-white rounded-lg p-8 transition-transform transform hover:scale-105 hover:shadow-2xl flex flex-col items-center text-center shadow-lg border border-gray-200">
              <div className="w-[130px] h-[130px] mb-4">
                <img
                  src={amblogo}
                  alt="Ambiguity Killer Icon"
                  className="w-full h-full object-contain rounded-full shadow-md transition-transform duration-700 transform hover:scale-110 hover:rotate-[360deg]"
                />
              </div>
              <div className="absolute top-2 left-2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                Featured
              </div>
              <h3 className="mt-4 text-lg leading-6 font-semibold text-gray-900">
                Ambiguity Killer
              </h3>
              <p className="mt-2 text-base text-gray-500">
                Tailor your platform to fit your specific needs with our highly
                customizable options.
              </p>
              <a
                href="/"
                className="mt-4 text-indigo-600 hover:text-indigo-900 inline-flex items-center font-semibold transition-colors duration-300"
              >
                Learn more
                <svg
                  className="ml-2 w-5 h-5 transition-transform transform hover:translate-x-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M12.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L16.586 10 12.293 5.707a1 1 0 010-1.414z" />
                  <path d="M6 10a1 1 0 011-1h9.586l-4.293-4.293a1 1 0 111.414-1.414l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L16.586 11H7a1 1 0 01-1-1z" />
                </svg>
              </a>
            </div>

            {/* Feature 2 */}
            <div className="relative bg-white rounded-lg p-8 transition-transform transform hover:scale-105 hover:shadow-2xl flex flex-col items-center text-center shadow-lg border border-gray-200">
              <div className="w-[130px] h-[130px] mb-4">
                <img
                  src={mmlogo}
                  alt="Mind Map Generator Icon"
                  className="w-full h-full object-contain rounded-full shadow-md transition-transform duration-700 transform hover:scale-110 hover:rotate-[360deg]"
                />
              </div>
              <div className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                Popular
              </div>
              <h3 className="mt-4 text-lg leading-6 font-semibold text-gray-900">
                Mind Map Generator
              </h3>
              <p className="mt-2 text-base text-gray-500">
                Create detailed mind maps with ease to enhance your
                brainstorming sessions.
              </p>
              <a
                href="/"
                className="mt-4 text-indigo-600 hover:text-indigo-900 inline-flex items-center font-semibold transition-colors duration-300"
              >
                Learn more
                <svg
                  className="ml-2 w-5 h-5 transition-transform transform hover:translate-x-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M12.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L16.586 10 12.293 5.707a1 1 0 010-1.414z" />
                  <path d="M6 10a1 1 0 011-1h9.586l-4.293-4.293a1 1 0 111.414-1.414l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L16.586 11H7a1 1 0 01-1-1z" />
                </svg>
              </a>
            </div>

            {/* Feature 3 */}
            <div className="relative bg-white rounded-lg p-8 transition-transform transform hover:scale-105 hover:shadow-2xl flex flex-col items-center text-center shadow-lg border border-gray-200">
              <div className="w-[130px] h-[130px] mb-4">
                <img
                  src={tslogo}
                  alt="Scenario Generator Icon"
                  className="w-full h-full object-contain rounded-full shadow-md transition-transform duration-700 transform hover:scale-110 hover:rotate-[360deg]"
                />
              </div>
              <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                New
              </div>
              <h3 className="mt-4 text-lg leading-6 font-semibold text-gray-900">
                Scenario Generator
              </h3>
              <p className="mt-2 text-base text-gray-500">
                Generate realistic scenarios to test your ideas and strategies
                effectively.
              </p>
              <a
                href="/"
                className="mt-4 text-indigo-600 hover:text-indigo-900 inline-flex items-center font-semibold transition-colors duration-300"
              >
                Learn more
                <svg
                  className="ml-2 w-5 h-5 transition-transform transform hover:translate-x-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M12.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L16.586 10 12.293 5.707a1 1 0 010-1.414z" />
                  <path d="M6 10a1 1 0 011-1h9.586l-4.293-4.293a1 1 0 111.414-1.414l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L16.586 11H7a1 1 0 01-1-1z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Pricing = () => {
  const [selectedPlan, setSelectedPlan] = useState("");

  return (
    <div className="px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-20">
      <div className="max-w-xl mb-10 md:mx-auto sm:text-center lg:max-w-2xl md:mb-12">
        <p className="inline-block px-3 py-px mb-4 text-xs font-semibold tracking-wider text-teal-900 uppercase rounded-full bg-teal-500 shadow-md">
          Our Pricing
        </p>
        <h2 className="max-w-lg mb-6 text-4xl font-bold leading-none tracking-tight text-gray-900 sm:text-5xl md:mx-auto">
          <span className="relative inline-block">
            <svg
              viewBox="0 0 52 24"
              fill="currentColor"
              className="absolute top-0 left-0 z-0 hidden w-32 -mt-8 -ml-20 text-blue-gray-100 lg:w-32 lg:-ml-28 lg:-mt-10 sm:block"
            >
              <defs>
                <pattern id="pattern" x="0" y="0" width=".135" height=".30">
                  <circle cx="1" cy="1" r=".7" />
                </pattern>
              </defs>
              <rect fill="url(#pattern)" width="52" height="24" />
            </svg>
            <span className="relative">Transparent</span>
          </span>{" "}
          pricing. Pay as you grow.
        </h2>
        <p className="text-lg text-gray-700 md:text-xl">
          Choose the plan that fits your needs and scale effortlessly as you
          grow.
          {/* Unleash the Fury of the Ambiguity Killer: Master the Art of Mind Mapping and Conquer Test Scenarios with Unmatched Precision Transform chaos into clarity and dominate your workflow with a powerful tool that sharpens your focus and ignites your creativity. */}
        </p>
      </div>

      <div className="grid max-w-md gap-10 row-gap-5 lg:max-w-screen-lg sm:row-gap-10 lg:grid-cols-3 xl:max-w-screen-lg sm:mx-auto">
        {/* Start Card */}
        <div
          className={`flex flex-col justify-between p-8 transition-all duration-300 rounded-lg shadow-lg sm:items-center hover:shadow-2xl transform hover:-translate-y-1 ${selectedPlan === "Start" ? "bg-teal-100 border-2 border-teal-600" : "bg-white border border-gray-200"}`}
          onMouseEnter={() => setSelectedPlan("Start")}
          onMouseLeave={() => setSelectedPlan("")}
        >
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-800">Start</div>
            <div className="flex items-center justify-center mt-2">
              <div className="mr-1 text-5xl font-bold text-teal-600">Free</div>
            </div>
            <div className="mt-2 space-y-2">
              <div className="text-gray-600">10 Invocations</div>
              <div className="text-gray-600">Basic Support</div>
              <div className="text-gray-600">Community Access</div>
            </div>
          </div>
          <div>
            <a
              href="/"
              className="inline-flex items-center justify-center w-full h-12 px-6 mt-6 font-medium tracking-wide text-white transition duration-200 bg-teal-600 rounded-lg shadow-md hover:bg-teal-700 focus:shadow-outline focus:outline-none transform hover:scale-105"
            >
              Start for free
            </a>
            <p className="max-w-xs mt-4 text-xs text-gray-600 sm:text-sm sm:text-center sm:max-w-sm sm:mx-auto">
              Begin your journey with us today!
            </p>
          </div>
        </div>

        {/* Pro Card */}
        <div
          className={`relative flex flex-col justify-between p-8 transition-all duration-300 rounded-lg shadow-lg sm:items-center hover:shadow-2xl transform hover:-translate-y-1 ${selectedPlan === "Pro" ? "bg-gradient-to-r from-purple-100 to-purple-300 border-2 border-purple-600" : "bg-white border-4 border-transparent"}`}
          onMouseEnter={() => setSelectedPlan("Pro")}
          onMouseLeave={() => setSelectedPlan("")}
        >
          <div className="absolute inset-x-0 top-0 flex justify-center -mt-3">
            <div className="inline-block px-3 py-1 text-xs font-medium tracking-wider text-white uppercase rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg">
              Most Popular
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-800">Pro</div>
            <div className="flex items-center justify-center mt-2">
              <div className="mr-1 text-5xl font-bold text-purple-600">N/A</div>
              <div className="text-gray-700">/ mo</div>
            </div>
            <div className="mt-2 space-y-2">
              <div className="text-gray-600">N/A Invocations</div>
              <div className="text-gray-600">Premium Support</div>
              <div className="text-gray-600">24/7 Access</div>
            </div>
          </div>
          <div>
            <a
              href="/"
              className="inline-flex items-center justify-center w-full h-12 px-6 mt-6 font-medium tracking-wide text-white transition duration-200 rounded-lg shadow-md bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-600 focus:shadow-outline focus:outline-none transform hover:scale-105"
            >
              Buy Pro
            </a>
            <p className="max-w-xs mt-4 text-xs text-gray-600 sm:text-sm sm:text-center sm:max-w-sm sm:mx-auto">
              Ideal for growing teams and projects.
            </p>
          </div>
        </div>

        {/* Business Card */}
        <div
          className={`flex flex-col justify-between p-8 transition-all duration-300 rounded-lg shadow-lg sm:items-center hover:shadow-2xl transform hover:-translate-y-1 ${selectedPlan === "Business" ? "bg-red-100 border-2 border-red-600" : "bg-white border border-gray-200"}`}
          onMouseEnter={() => setSelectedPlan("Business")}
          onMouseLeave={() => setSelectedPlan("")}
        >
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-800">Business</div>
            <div className="flex items-center justify-center mt-2">
              <div className="mr-1 text-5xl font-bold text-red-600">N/A</div>
              <div className="text-gray-700">/ mo</div>
            </div>
            <div className="mt-2 space-y-2">
              <div className="text-gray-600">N/A Invocations</div>
              <div className="text-gray-600">Priority Support</div>
              <div className="text-gray-600">Dedicated Account Manager</div>
            </div>
          </div>
          <div>
            <a
              href="/"
              className="inline-flex items-center justify-center w-full h-12 px-6 mt-6 font-medium tracking-wide text-white transition duration-200 bg-gray-800 rounded-lg shadow-md hover:bg-gray-900 focus:shadow-outline focus:outline-none transform hover:scale-105"
            >
              Buy Business
            </a>
            <p className="max-w-xs mt-4 text-xs text-gray-600 sm:text-sm sm:text-center sm:max-w-sm sm:mx-auto">
              Perfect for established businesses.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Nav = () => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    // Fetch the logo from the API
    const fetchLogo = async () => {
      try {
        const response = await getLogo("logo.png"); // Pass the image name you need
        console.log(response, "blob");

        if (response) {
          setLogoUrl(response); // Set the logo URL to state if the API is successful
        } else {
          setLogoUrl(null); // If no logo URL is returned, fall back to the default logo
        }
      } catch (error) {
        console.error("Error fetching logo:", error);
        setLogoUrl(null); // Fallback to default logo if there's an error
      }
    };

    fetchLogo(); // Call the API when the component mounts
  }, []);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const navigate = useNavigate();

  const showSignIn =
    location.pathname === "/";
  //  console.log(logoUrl,'dfdf');

  return (
    <div style={{ backgroundColor: "white" }} className="relative z-20">
      <div
        className="px-4 py-5 mx-auto sm:max-w-xl md:max-w-full md:px-24 lg:px-8"
        style={{ height: "100px" }}
      >
        <div className="relative flex items-center justify-between h-full">
          <div className="flex items-center">
            <a
              aria-label="Company"
              title="Company"
              className="inline-flex items-center mr-8"
            >
              <div className="flex items-center justify-center lg:flex hidden z-10 cursor-pointer" onClick={(e) => {
                    e.preventDefault();
                    window.location.href =
                      `${ONBOARDING_URL}`;
                  }}>
                <img
                  // src={logoUrl || logo2}
                  src={logo2}
                  alt="Logo"
                  className="h-16 w-16 lg:h-[40px] lg:w-[40px] mr-4"
                />
              </div>
              <span className="ml-2 text-3xl font-bold tracking-wide text-gray-100 uppercase cursor-pointer" onClick={(e) => {
                    e.preventDefault();
                    window.location.href =
                      `${ONBOARDING_URL}`;
                  }}>
                <span className="text-black">Quali</span>
                <span style={{ color: "#DE3840FF" }}>zen</span>
              </span>
            </a>
            <ul className="flex items-center hidden space-x-8 lg:flex">
              {/* <li>
                <a
                  aria-label="Our product"
                  title="Our product"
                  className="font-medium tracking-wide text-gray-100 transition-colors duration-200 hover:text-teal-accent-400"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsModalOpen(true);
                  }}
                >
                  Product
                </a>
              </li>
              <li>
                <a
                  aria-label="Features"
                  title="Features"
                  className="font-medium tracking-wide text-gray-100 transition-colors duration-200 hover:text-teal-accent-400"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsModalOpen(true);
                  }}
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  aria-label="Pricing"
                  title="Pricing"
                  className="font-medium tracking-wide text-gray-100 transition-colors duration-200 hover:text-teal-accent-400"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsPricingModalOpen(true);
                  }}
                >
                  Pricing
                </a>
              </li> */}
              <li>
                <a
                  aria-label="About Qualizen"
                  title="About Qualizen"
                  className="font-medium text-xl tracking-wide transition-colors duration-200 hover:text-teal-accent-400 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href =
                      `${BASE_URL}/help/help.html`;
                  }}
                >
                  About Qualizen
                </a>
              </li>
              <li>
                <a
                  aria-label="FAQ"
                  title="FAQ"
                  className="font-medium text-xl tracking-wide transition-colors duration-200 hover:text-teal-accent-400 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href =
                      `${BASE_URL}/FAQ/index.html`;
                  }}
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>
          <ul className="flex items-center space-x-8 lg:flex">
            {showSignIn && (
              <li>
                <Button
                  label="Sign in"
                  size="small"
                  onClick={() =>
                    (window.location.href = `${LOGIN_URL}`)
                  }
                  className="h-12 px-6 font-medium tracking-wide text-white transition duration-200 bg-red-600 rounded-lg shadow-md hover:bg-red-500 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-opacity-50"
                />
              </li>
            )}
            {/* {showSignIn && (
              <li className="hidden lg:block">
                <Button
                  label="Register"
                  size="small"
                  onClick={() => navigate("/sign-up")}
                  className="h-12 px-6 font-medium tracking-wide text-white transition duration-200 bg-red-600 rounded-lg shadow-md hover:bg-red-500 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-opacity-50"
                />
              </li>
            )} */}
          </ul>
        </div>
      </div>

      {/* PrimeReact Full-Width Modal */}
      <Dialog
        visible={isModalOpen}
        onHide={() => setIsModalOpen(false)}
        header="Product Features"
        style={{ width: "100vw" }}
        breakpoints={{ "960px": "100vw" }}
      >
        <Feature />
      </Dialog>
      {/* PrimeReact Full-Width Modal */}
      <Dialog
        visible={isPricingModalOpen}
        onHide={() => setIsPricingModalOpen(false)}
        header="Product Pricing"
        style={{ width: "100vw" }}
        breakpoints={{ "960px": "100vw" }}
      >
        <Pricing />
      </Dialog>
    </div>
  );
};

export default Nav;

// export const Pricing = () => {
//   return (
//     <div className="px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-20">
//       <div className="max-w-xl mb-10 md:mx-auto sm:text-center lg:max-w-2xl md:mb-12">
//         <div>
//           <p className="inline-block px-3 py-px mb-4 text-xs font-semibold tracking-wider text-teal-900 uppercase rounded-full bg-teal-500">
//             Our Pricing
//           </p>
//         </div>
//         <h2 className="max-w-lg mb-6 text-4xl font-bold leading-none tracking-tight text-gray-900 sm:text-5xl md:mx-auto">
//           <span className="relative inline-block">
//             <svg
//               viewBox="0 0 52 24"
//               fill="currentColor"
//               className="absolute top-0 left-0 z-0 hidden w-32 -mt-8 -ml-20 text-blue-gray-100 lg:w-32 lg:-ml-28 lg:-mt-10 sm:block"
//             >
//               <defs>
//                 <pattern
//                   id="7e5e8ff8-1960-4094-a63a-2a0c0f922d69"
//                   x="0"
//                   y="0"
//                   width=".135"
//                   height=".30"
//                 >
//                   <circle cx="1" cy="1" r=".7" />
//                 </pattern>
//               </defs>
//               <rect
//                 fill="url(#7e5e8ff8-1960-4094-a63a-2a0c0f922d69)"
//                 width="52"
//                 height="24"
//               />
//             </svg>
//             <span className="relative">Transparent</span>
//           </span>{' '}
//           pricing. Pay as you grow.
//         </h2>
//         <p className="text-base text-gray-700 md:text-lg">
//           Discover plans that scale with your needs, ensuring flexibility and support at every stage.
//         </p>
//       </div>
//       <div className="grid max-w-md gap-10 row-gap-5 lg:max-w-screen-lg sm:row-gap-10 lg:grid-cols-3 xl:max-w-screen-lg sm:mx-auto">
//         {/* Start Card */}
//         <div className="flex flex-col justify-between p-8 transition-shadow duration-300 bg-gradient-to-b from-white to-gray-100 border border-gray-200 rounded-lg shadow-lg sm:items-center hover:shadow-2xl transform hover:-translate-y-1">
//           <div className="text-center">
//             <div className="text-lg font-semibold text-gray-800">Start</div>
//             <div className="flex items-center justify-center mt-2">
//               <div className="mr-1 text-5xl font-bold text-teal-600">Free</div>
//             </div>
//             <div className="mt-2 space-y-2">
//               <div className="text-gray-600">10 Invocations</div>
//               <div className="text-gray-600">Basic Support</div>
//               <div className="text-gray-600">Community Access</div>
//             </div>
//           </div>
//           <div>
//             <a
//               href="/"
//               className="inline-flex items-center justify-center w-full h-12 px-6 mt-6 font-medium tracking-wide text-white transition duration-200 bg-teal-600 rounded-lg shadow-md hover:bg-teal-700 focus:shadow-outline focus:outline-none"
//             >
//               Start for free
//             </a>
//             <p className="max-w-xs mt-4 text-xs text-gray-600 sm:text-sm sm:text-center sm:max-w-sm sm:mx-auto">
//               Begin your journey with us today!
//             </p>
//           </div>
//         </div>

//         {/* Pro Card */}
//         <div className="relative flex flex-col justify-between p-8 transition-shadow duration-300 bg-white border-4 border-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-lg sm:items-center hover:shadow-2xl transform hover:-translate-y-1">
//           <div className="absolute inset-x-0 top-0 flex justify-center -mt-3">
//             <div className="inline-block px-3 py-1 text-xs font-medium tracking-wider text-white uppercase rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
//               Most Popular
//             </div>
//           </div>
//           <div className="text-center">
//             <div className="text-lg font-semibold text-gray-800">Pro</div>
//             <div className="flex items-center justify-center mt-2">
//               <div className="mr-1 text-5xl font-bold text-purple-600">N/A</div>
//               <div className="text-gray-700">/ mo</div>
//             </div>
//             <div className="mt-2 space-y-2">
//               <div className="text-gray-600">N/A Invocations</div>
//               <div className="text-gray-600">Premium Support</div>
//               <div className="text-gray-600">24/7 Access</div>
//             </div>
//           </div>
//           <div>
//             <a
//               href="/"
//               className="inline-flex items-center justify-center w-full h-12 px-6 mt-6 font-medium tracking-wide text-white transition duration-200 rounded-lg shadow-md bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-600 focus:shadow-outline focus:outline-none"
//             >
//               Buy Pro
//             </a>
//             <p className="max-w-xs mt-4 text-xs text-gray-600 sm:text-sm sm:text-center sm:max-w-sm sm:mx-auto">
//               Ideal for growing teams and projects.
//             </p>
//           </div>
//         </div>

//         {/* Business Card */}
//         <div className="flex flex-col justify-between p-8 transition-shadow duration-300 bg-gradient-to-b from-white to-gray-100 border border-gray-200 rounded-lg shadow-lg sm:items-center hover:shadow-2xl transform hover:-translate-y-1">
//           <div className="text-center">
//             <div className="text-lg font-semibold text-gray-800">Business</div>
//             <div className="flex items-center justify-center mt-2">
//               <div className="mr-1 text-5xl font-bold text-red-600">N/A</div>
//               <div className="text-gray-700">/ mo</div>
//             </div>
//             <div className="mt-2 space-y-2">
//               <div className="text-gray-600">N/A Invocations</div>
//               <div className="text-gray-600">Priority Support</div>
//               <div className="text-gray-600">Dedicated Account Manager</div>
//             </div>
//           </div>
//           <div>
//             <a
//               href="/"
//               className="inline-flex items-center justify-center w-full h-12 px-6 mt-6 font-medium tracking-wide text-white transition duration-200 bg-gray-800 rounded-lg shadow-md hover:bg-gray-900 focus:shadow-outline focus:outline-none"
//             >
//               Buy Business
//             </a>
//             <p className="max-w-xs mt-4 text-xs text-gray-600 sm:text-sm sm:text-center sm:max-w-sm sm:mx-auto">
//               Perfect for established businesses.
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
