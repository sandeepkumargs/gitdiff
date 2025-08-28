import React, { useState, useEffect, useRef } from "react";
import { MultiSelect } from "primereact/multiselect";
import { Chips } from "primereact/chips";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import Lottie from "lottie-react";
import { completeProfile } from "../../services/service";
import { useLocation } from "react-router-dom";
import { Dropdown } from "primereact/dropdown";

import officeIllustration from "../../assets/officeIllustration.json";
import officeIllustration2 from "../../assets/officeIllustration2.json";
import officeIllustration3 from "../../assets/officeIllustration3.json";
import officeIllustration4 from "../../assets/officeIllustration4.json";
import officeIllustration6 from "../../assets/officeIllustration6.json"; // New animation for loading

const Info: React.FC = () => {
  const [role, setRole] = useState<string | null>(null);
  const [domain, setDomain] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [teamSize, setTeamSize] = useState<string>("");
  const [orgName, setOrgName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const navigationState = useLocation().state;
  const [isCustomFieldVisible, setIsCustomFieldVisible] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const toastRef = useRef<Toast>(null);

  const ONBOARDING_URL = process.env.ONBOARDING_URL
  const BASE_URL = process.env.BASE_URL
  const LOGIN_URL = process.env.LOGIN_URL

  const roleOptions = [
    { label: "Test Architect", value: "Test Architect" },
    { label: "Quality Engineer", value: "Quality Engineer" },
    { label: "Test Lead", value: "Test Lead" },
    { label: "Product Owner", value: "Product Owner" },
    { label: "Business Owner", value: "Business Owner" },
  ];

  const domainOptions = [
    { label: "Banking", value: "Banking" },
    { label: "FinTech", value: "FinTech" },
    { label: "Insurance", value: "Insurance" },
    { label: "HealthCare & Life Science", value: "HealthCare & Life Science" },
    { label: "Retail & eCommerce", value: "Retail & eCommerce" },
    { label: "IT Services", value: "IT Services" },
    { label: "OTT", value: "OTT" },
    { label: "Media & Entertainment", value: "Media & Entertainment" },
    { label: "Telecommunication", value: "Telecommunication" },
    { label: "Energy & Utilities", value: "Energy & Utilities" },
    {
      label: "Travel, Transport & Logistics",
      value: "Travel, Transport & Logistics",
    },
    {
      label: "Government & Public Sectors",
      value: "Government & Public Sectors",
    },
    { label: "Education (EdTech)", value: "Education (EdTech)" },
    {
      label: "Real Estate & Constructions",
      value: "Real Estate & Constructions",
    },
    { label: "Manufacturing", value: "Manufacturing" },
    { label: "Hospitality & Tourism", value: "Hospitality & Tourism" },
    {
      label: "Agriculture and Agribusiness",
      value: "Agriculture and Agribusiness",
    },
    { label: "Aerospace and Defense", value: "Aerospace and Defense" },
    {
      label: "Legal and Professional Services",
      value: "Legal and Professional Services",
    },
  ];

  const interestMappings: {
    [key: string]: { label: string; value: string }[];
  } = {
    "Test Architect": [
      { label: "Test Automation", value: "Test Automation" },
      { label: "Performance Testing", value: "Performance Testing" },
    ],
    "QA Engineer": [
      { label: "UI/UX Testing", value: "UI/UX Testing" },
      { label: "Security Testing", value: "Security Testing" },
    ],
    "Software Developer": [
      { label: "Unit Testing", value: "Unit Testing" },
      { label: "Code Review", value: "Code Review" },
    ],
    "Product Manager": [
      { label: "Product Strategy", value: "Product Strategy" },
      { label: "Roadmap Planning", value: "Roadmap Planning" },
    ],
  };

  const teamSizeOptions = [
    { label: "1-5", value: "1-5" },
    { label: "6-10", value: "6-10" },
    { label: "11-20", value: "11-20" },
    { label: "21+", value: "21+" },
  ];

  const animations = [
    { animationData: officeIllustration },
    { animationData: officeIllustration2 },
    { animationData: officeIllustration3 },
    { animationData: officeIllustration4 },
  ];

  const texts = [
    "Assisting you to squash ambiguities...",
    "Sharpening your visuals to visualize stories...",
    "Preparing your team for seamless collaboration...",
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % animations.length);
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [animations.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let errorMessages: string[] = [];

    if (!role) {
      errorMessages.push("Please select a role.");
    }
    if (!interests.length) {
      errorMessages.push("Please add at least one interest.");
    }
    if (!teamSize && !navigationState?.isIndividual) {
      errorMessages.push("Please select a team size.");
    }
    if (!orgName.trim()) {
      errorMessages.push("Please enter your organization name.");
    }

    if (errorMessages.length > 0) {
      errorMessages.forEach((message) => {
        toastRef.current?.show({
          severity: "error",
          summary: "Validation Error",
          detail: message,
        });
      });
      return;
    }

    const payload = {
      email: navigationState?.email,
      role,
      domain,
      interests,
      team_size: teamSize,
      org_name: orgName.trim(),
      subscriptions: navigationState?.subscriptions,
    };

    try {
      setLoading(true);
      const response = await completeProfile(payload);
      if (response?.message) {
        toastRef.current?.show({
          severity: "success",
          summary: "Success",
          detail: "Profile completed successfully!",
        });
        window.location.href = `${LOGIN_URL}`;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      toastRef.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to complete profile. Please try again later.",
      });
      console.error("Error during profile completion:", error);
    } finally {
      setLoading(false);
    }
  };

  const [options, setOptions] = useState([
    { label: "Test Automation", value: "Test Automation" },
    { label: "Performance Testing", value: "Performance Testing" },
    { label: "Load Testing", value: "Load Testing" },
    { label: "Others...", value: "custom" },
  ]);

  const handleCustomEntry = () => {
    if (!customValue.trim()) return; // Prevent empty entries
    const newOption = { label: customValue, value: customValue };

    // Add the custom value to the options and select it
    setOptions((prevOptions) => [...prevOptions, newOption]);
    setInterests((prevInterests) => [
      ...prevInterests.filter((i) => i !== "custom"),
      customValue,
    ]);
    setIsCustomFieldVisible(false); // Hide the custom input field
    setCustomValue(""); // Clear the custom input value
  };

  const handleChange = (e) => {
    const selectedValues = e.value;

    if (selectedValues.includes("custom")) {
      setIsCustomFieldVisible(true); // Show the custom input field
    } else {
      setIsCustomFieldVisible(false); // Hide the custom input field if "Others" is deselected
    }

    // Update selected interests
    setInterests(selectedValues.filter((value) => value !== "custom"));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault(); // Prevent default tab behavior
      const customValue = e.target.value.trim();
      handleCustomEntry(customValue);
      e.target.value = ""; // Clear the input after adding the custom value
    }
  };

  // const suggestedInterests = role ? interestMappings[role] || [] : [];

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-10">
      <Toast ref={toastRef} position="top-right" />

      {loading ? (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white bg-opacity-90">
          <Lottie
            animationData={officeIllustration6}
            loop
            className="w-96 h-96"
          />
          <div className="mt-6 space-y-2 text-center">
            {texts.map((text, index) => (
              <p key={index} className="text-xl font-semibold text-gray-700">
                {text}
              </p>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="w-2/3 flex justify-between">
            <Carousel
              selectedItem={activeIndex}
              onChange={setActiveIndex}
              autoPlay
              infiniteLoop
              showThumbs={false}
              showStatus={false}
              interval={10000}
              transitionTime={500}
              verticalSwipe="natural"
              stopOnHover={false}
              className="h-96"
              showArrows={false}
            >
              {animations.map((animation, index) => (
                <div key={index} className="flex justify-center h-full">
                  <Lottie
                    animationData={animation.animationData}
                    loop
                    className="h-3/4 w-3/4"
                  />
                </div>
              ))}
            </Carousel>
          </div>

          <div className="bg-white p-10 rounded-lg shadow-lg">
            <h1 className="text-5xl font-bold mb-4 text-gray-800">
              Welcome!{" "}
              <span className="text-blue-500">
                {navigationState?.firstName}
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              You are just one step away from getting started with{" "}
              <span className="text-orange-500 font-semibold">
                Requirement Analysis
              </span>
            </p>

            <form
              className="space-y-6 max-w-md"
              onSubmit={handleSubmit}
              style={{ width: "100%" }}
            >
              <div style={{ width: "100%" }}>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="role"
                >
                  Role
                </label>
                <Dropdown
                  id="role"
                  value={role}
                  options={roleOptions}
                  onChange={(e) => setRole(e.value)}
                  placeholder="Select"
                  style={{
                    width: "100%",
                    border: "1px solid #D1D5DB",
                    borderRadius: "0.375rem",
                    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                  }}
                />
              </div>

              <div style={{ width: "100%" }}>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="domain"
                >
                  Domain/Industry
                </label>
                <MultiSelect
                  id="domain"
                  value={domain}
                  options={domainOptions}
                  onChange={(e) => setDomain(e.value)}
                  placeholder="Select"
                  style={{
                    width: "100%",
                    border: "1px solid #D1D5DB",
                    borderRadius: "0.375rem",
                    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                  }}
                />
              </div>

              <div style={{ width: "100%" }}>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="interests"
                >
                  Interests
                </label>
                <MultiSelect
                  id="interests"
                  value={interests}
                  options={options}
                  onChange={handleChange}
                  placeholder="e.g. Test Automation, Performance Testing"
                  style={{
                    width: "100%",
                    border: "1px solid #D1D5DB",
                    borderRadius: "0.375rem",
                    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                  }}
                  display="chip"
                />

                {/* Conditional rendering for the custom input field */}
                {isCustomFieldVisible && (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={customValue}
                      onChange={(e) => setCustomValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault(); // Prevent form submission or other default actions
                          handleCustomEntry(); // Add custom value
                        }
                      }}
                      placeholder="Type your custom interest and press Enter"
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #D1D5DB",
                        borderRadius: "0.375rem",
                        marginTop: "0.5rem",
                      }}
                    />
                  </div>
                )}
              </div>

              {!navigationState?.isIndividual && (
                <div style={{ width: "100%" }}>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="team-size"
                  >
                    Team Size
                  </label>
                  <Dropdown
                    id="team-size"
                    value={teamSize}
                    options={teamSizeOptions}
                    onChange={(e) => setTeamSize(e.value)}
                    placeholder="Select"
                    style={{
                      width: "100%",
                      border: "1px solid #D1D5DB",
                      borderRadius: "0.375rem",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                </div>
              )}

              <div style={{ width: "100%" }}>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="org-name"
                >
                  Organization Name
                </label>
                <InputText
                  id="org-name"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. Tech Corp"
                  style={{
                    width: "100%",
                    border: "1px solid #D1D5DB",
                    borderRadius: "0.375rem",
                    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                  }}
                />
              </div>

              <Button
                type="submit"
                label="Get Started"
                style={{
                  width: "100%",
                  padding: "0.5rem 1rem",
                  fontSize: "1.125rem",
                  fontWeight: "600",
                  backgroundColor: "#2563EB",
                  color: "white",
                  borderRadius: "0.375rem",
                  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                  transition: "background-color 0.2s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "#1E40AF")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "#2563EB")
                }
              />
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default Info;

// import React, { useState, useEffect, useRef } from 'react';
// import { Dropdown } from 'primereact/dropdown';
// import { Chips } from 'primereact/chips';
// import { InputText } from 'primereact/inputtext';
// import { Button } from 'primereact/button';
// import { Toast } from 'primereact/toast';
// import { Carousel } from 'react-responsive-carousel';
// import "react-responsive-carousel/lib/styles/carousel.min.css";
// import Lottie from 'lottie-react';
// //@ts-ignore
// import officeIllustration from '../../assets/officeIllustration.json';
// //@ts-ignore
// import officeIllustration2 from '../../assets/officeIllustration2.json';
// //@ts-ignore
// import officeIllustration3 from '../../assets/officeIllustration3.json';
// //@ts-ignore
// import officeIllustration4 from '../../assets/officeIllustration4.json';
// //@ts-ignore
// import officeIllustration6 from '../../assets/officeIllustration6.json'; // New animation for loading
// import { completeProfile } from '../../services/service';
// import { useLocation } from 'react-router-dom';

// const Info: React.FC = () => {
//   const [role, setRole] = useState<string | null>(null);
//   const [domain, setDomain] = useState<string | null>(null);
//   const [interests, setInterests] = useState<string[]>([]);
//   const [teamSize, setTeamSize] = useState<string>("");
//   const [orgName, setOrgName] = useState<string>('');
//   const [loading, setLoading] = useState(false); // New loading state
//   const navigationState = useLocation().state;
//   const toastRef = useRef<Toast>(null);

//   const roleOptions = [
//     { label: 'Test Architect', value: 'Test Architect' },
//     { label: 'QA Engineer', value: 'QA Engineer' },
//     { label: 'Software Developer', value: 'Software Developer' },
//     { label: 'Product Manager', value: 'Product Manager' }
//   ];

//   const domainOptions = [
//     { label: 'HealthCare', value: 'HealthCare' },
//     { label: 'Agriculture', value: 'Agriculture' },
//     { label: 'Technology', value: 'Technology' },
//     { label: 'Gaming', value: 'Gaming' }
//   ];

//   const interestOptions = [
//     { label: 'Test Automation', value: 'Test Automation' },
//     { label: 'Performance Testing', value: 'Performance Testing' },
//     { label: 'UI/UX Testing', value: 'UI/UX Testing' },
//     { label: 'Security Testing', value: 'Security Testing' }
//   ];

//   const teamSizeOptions = [
//     { label: '1-5', value: '1-5' },
//     { label: '6-10', value: '6-10' },
//     { label: '11-20', value: '11-20' },
//     { label: '21+', value: '21+' }
//   ];

//   const animations = [
//     { animationData: officeIllustration },
//     { animationData: officeIllustration2 },
//     { animationData: officeIllustration3 },
//     { animationData: officeIllustration4 }
//   ];

//   const texts = [
//     'Assisting you to squash ambiguities...',
//     'Sharpening your visuals to visualize stories...',
//     'Preparing your team for seamless collaboration...'
//   ]; // New texts for the loading screen

//   const [activeIndex, setActiveIndex] = useState(0);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setActiveIndex((prevIndex) => (prevIndex + 1) % animations.length);
//     }, 5000); // 5 seconds interval

//     return () => {
//       clearInterval(interval);
//     };
//   }, [animations.length]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     // Basic validation checks
//     if (!role || role.trim() === '') {
//       toastRef.current?.show({
//         severity: 'error',
//         summary: 'Validation Error',
//         detail: 'Please select your role.',
//       });
//       return;
//     }

//     if (!interests.length) {
//       toastRef.current?.show({
//         severity: 'error',
//         summary: 'Validation Error',
//         detail: 'Please add at least one interest.',
//       });
//       return;
//     }

//     if (!teamSize && !navigationState?.isIndividual) {
//       toastRef.current?.show({
//         severity: 'error',
//         summary: 'Validation Error',
//         detail: 'Please select your team size.',
//       });
//       return;
//     }

//     if (!orgName || orgName.trim().length < 2) {
//       toastRef.current?.show({
//         severity: 'error',
//         summary: 'Validation Error',
//         detail: 'Organization name should be at least 2 characters long.',
//       });
//       return;
//     }

//     const email = navigationState?.email;
//     const subscriptions = navigationState?.subscriptions;

//     const payload = {
//       email,
//       role,
//       domain,
//       interests,
//       team_size: teamSize,
//       org_name: orgName.trim(),
//       subscriptions
//     };

//     try {
//       setLoading(true); // Show loading screend
//       const response = await completeProfile(payload);
//       if (response && response?.message != undefined) {
//         toastRef.current?.show({
//           severity: 'success',
//           summary: 'Success',
//           detail: 'Profile completed successfully!',
//         });
//         window.location.href = `${LOGIN_URL}`;
//       } else {
//         throw new Error(response.message);
//       }
//     } catch (error) {
//       toastRef.current?.show({
//         severity: 'error',
//         summary: 'Error',
//         detail: 'Failed to complete profile. Please try again later.',
//       });
//       console.error('Error during profile completion:', error);
//     } finally {
//       setLoading(false); // Hide loading screen
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-50 p-10">
//       <Toast ref={toastRef} position="top-right" />

//       {loading ? (
//         <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white bg-opacity-90">
//           <Lottie
//             animationData={officeIllustration6} // Loading Lottie animation
//             loop
//             className="w-96 h-96"
//           />
//           <div className="mt-6 space-y-2 text-center">
//             {texts.map((text, index) => (
//               <p key={index} className="text-xl font-semibold text-gray-700">
//                 {text}
//               </p>
//             ))}
//           </div>
//         </div>
//       ) : (
//         <>
//           {/* Existing form and carousel code here */}
//           <div className="w-2/3 flex justify-between">
//             <Carousel
//               selectedItem={activeIndex}
//               onChange={(index) => setActiveIndex(index)}
//               autoPlay
//               infiniteLoop
//               showThumbs={false}
//               showStatus={false}
//               interval={10000}
//               transitionTime={500}
//               verticalSwipe="natural"
//               stopOnHover={false}
//               className="h-96"
//               showArrows={false}
//             >
//               {animations.map((animation, index) => (
//                 <div key={index} className="flex justify-center h-full">
//                   <Lottie
//                     animationData={animation.animationData}
//                     loop={true}
//                     className="h-3/4 w-3/4"
//                   />
//                 </div>
//               ))}
//             </Carousel>
//           </div>

//           {/* Form */}
//           <div className="bg-white p-10 rounded-lg shadow-lg">
//             <h1 className="text-5xl font-bold mb-4 text-gray-800">
//               Welcome! <span className="text-blue-500">{navigationState?.firstName}</span>
//             </h1>
//             <p className="text-xl text-gray-600 mb-6">
//               You are just one step away from getting started with{' '}
//               <span className="text-orange-500 font-semibold">Requirement Analysis</span>
//             </p>

//             <form className="space-y-6 max-w-md" onSubmit={handleSubmit}>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="role">Role</label>
//                 <Dropdown
//                   id="role"
//                   value={role}
//                   options={roleOptions}
//                   onChange={(e) => setRole(e.value)}
//                   placeholder="Select"
//                   style={{width:"70%"}}
//                   className="w-full border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="domain">Domain</label>
//                 <Dropdown
//                   id="domain"
//                   value={domain}
//                   options={domainOptions}
//                   onChange={(e) => setDomain(e.value)}
//                   placeholder="Select"
//                   style={{width:"70%"}}
//                   className="w-full border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="interests">Interests</label>
//                 <Chips
//                   id="interests"
//                   value={interests}
//                   onChange={(e) => setInterests(e.value)}
//                   style={{width:"70%"}}
//                   placeholder="Add Interests (Press Tab to add)"
//                   className="w-full border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   onKeyDown={(e) => {
//                     if (e.key === 'Tab' && e.target.value.trim()) {
//                       e.preventDefault(); // Prevent tab focus switch
//                       setInterests([...interests, e.target.value]); // Add current value to interests
//                       e.target.value = ''; // Clear the input field after adding
//                     }
//                   }}
//                 />
//               </div>

//               {!navigationState?.isIndividual ? (
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="team-size">Size of Team</label>
//                   <Dropdown
//                     id="team-size"
//                     value={teamSize}
//                     options={teamSizeOptions}
//                     onChange={(e) => setTeamSize(e.value)}
//                     style={{width:"70%"}}
//                     placeholder="Select"
//                     className="w-full border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
//               ) : null}

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="org-name">Organization Name</label>
//                 <InputText
//                   type="text"
//                   id="org-name"
//                   value={orgName}
//                   style={{width:"70%"}}
//                   onChange={(e) => setOrgName(e.target.value)}
//                   className="w-full mt-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="Enter your organization name"
//                 />
//               </div>

//               <Button
//                 label="Get Started"
//                 icon="pi pi-arrow-right"
//                 className="w-full mt-6 p-button-rounded p-button-lg p-button-primary shadow-md transition-all duration-300 hover:shadow-lg"
//                 type="submit"
//               />
//             </form>

//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default Info;
