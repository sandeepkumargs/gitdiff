import React, { useState } from 'react';
//@ts-ignore
import amblogo from '../../assets/amb-logo.jpg';
//@ts-ignore
import mmlogo from '../../assets/mm-logo.jpg';
//@ts-ignore
import tslogo from '../../assets/ts-logo.png';
import NavBar from '../../components/NavBar/index';
import suite_logo from '../../assets/suite_logo.png';
import { useLocation, useNavigate } from 'react-router-dom';

const Suite: React.FC = () => {
  const navigate = useNavigate();

  // State to manage subscriptions
  const [subscriptions, setSubscriptions] = useState({
    ambiguity_checkcer: false,
    mind_maps: false,
    test_scenarios: false,
  });

  const navigationState = useLocation().state

  // Function to handle card clicks
  const handleCardClick = (type: string) => {
    let newSubscriptions = { ...subscriptions }; // Create a new subscriptions object

    if (type === 'all') {
      newSubscriptions = {
        ambiguity_checkcer: true,
        mind_maps: true,
        test_scenarios: true,
      };
    } else if (type === 'ambiguity_killer') {
      newSubscriptions.ambiguity_checkcer = true;
    } else if (type === 'visualize_requirements') {
      newSubscriptions.mind_maps = true;
    } else if (type === 'generate_scenarios') {
      newSubscriptions.test_scenarios = true;
    }

    // Update the state with the new subscriptions
    setSubscriptions(newSubscriptions);

    // Navigate to the info page with the updated subscriptions state
    navigate('/info', { state: { subscriptions: newSubscriptions, email : navigationState.email, isIndividual: navigationState.isIndividual, firstName: navigationState?.firstName } });
  };

  return (
    <div className="bg-gray-50">
      <div className='py-[30px]'></div>
      {/* Top Section */}
      <div className="text-center mb-10">
        <p className="text-gray-700 text-lg font-semibold">
          <span className="mr-2">Try our products</span>
          <span className="text-orange-500">•</span>
          <span className="ml-2">Find new ways for Quality Engineering</span>
        </p>
      </div>

      {/* Featured Section */}
      <div className="px-8">
        <h2 className="text-3xl font-bold text-indigo-800 mb-6">Featured</h2>
        <div className="border-b border-gray-300 mb-6"></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Card 1 */}
          <div className="bg-white rounded-lg shadow-lg p-8 transition-transform transform hover:scale-105 hover:shadow-xl cursor-pointer"
            onClick={() => handleCardClick('ambiguity_killer')}
          >
            <div className="flex flex-col items-center">
              <div className="w-[100px] h-[100px] flex items-center justify-center mb-4">
                <img src={amblogo} alt="Ambiguity Killer Icon" className="w-full h-full object-contain" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Ambiguity Killer</h3>
              <p className="text-orange-500 mt-2 text-center">
                Analyze and resolve ambiguities for your user story
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-lg shadow-lg p-8 transition-transform transform hover:scale-105 hover:shadow-xl cursor-pointer"
            onClick={() => handleCardClick('visualize_requirements')}
          >
            <div className="flex flex-col items-center">
              <div className="w-[100px] h-[100px] flex items-center justify-center mb-4">
                <img src={mmlogo} alt="Visualize Requirements Icon" className="w-full h-full object-contain" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Visualize Requirements</h3>
              <p className="text-orange-500 mt-2 text-center">
                Enhance your QA process with mind maps
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-lg shadow-lg p-8 transition-transform transform hover:scale-105 hover:shadow-xl cursor-pointer"
            onClick={() => handleCardClick('generate_scenarios')}
          >
            <div className="flex flex-col items-center">
              <div className="w-[100px] h-[100px] flex items-center justify-center mb-4">
                <img src={tslogo} alt="Generate Scenarios Icon" className="w-full h-full object-contain" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Generate Scenarios</h3>
              <p className="text-orange-500 mt-2 text-center">
                Generate automated test scenarios for your requirements
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* All in one Section */}
      <div className="px-8 mt-16">
        <h2 className="text-3xl font-bold text-indigo-800 mb-6">All in One</h2>
        <div className="border-b border-gray-300 mb-6"></div>

        <div className="flex justify-center">
          {/* QualiZen Suite */}
          <div className="bg-white shadow-lg rounded-lg p-8 text-center transition-transform transform hover:scale-105 hover:shadow-xl cursor-pointer"
            onClick={() => handleCardClick('all')}
          >
            <div className="flex items-center justify-center mb-4">
              <div className="w-[100px] h-[100px] flex items-center justify-center ">
                {/* <img src={suite_logo} alt="QualiZen Suite Icon" className="w-full h-full object-contain" /> */}
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">
              Quali<span className="text-orange-500">Zen</span> Suite
            </h3>
            <p className="text-orange-500 mt-2 text-lg">
              One suite to cover all the Requirement Analysis
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Suite;
