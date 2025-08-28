import React from "react";
import Lottie from "lottie-react";
import animationData from "../../assets/404_animation.json";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-6">
      <div className="w-96 sm:w-[32rem]">
        <Lottie animationData={animationData} loop={true} />
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mt-4">Oops! Page Not Found</h1>
      <p className="text-gray-600 mt-2">The page you're looking for doesn't exist or has been moved.</p>
      <button 
        onClick={() => navigate("/")}
        className="mt-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all"
      >
        Go Back Home
      </button>
    </div>
  );
};

export default NotFound;
