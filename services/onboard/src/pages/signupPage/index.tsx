import React, { useState, useRef } from "react";
import { Button } from "primereact/button";
import { Stepper } from "primereact/stepper";
import { StepperPanel } from "primereact/stepperpanel";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";
import { Carousel } from "react-responsive-carousel";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Cookies from "js-cookie";

import { Card } from "primereact/card";

import {
  CheckCircle2,
  CircleDot,
  FileCheck,
  Settings,
  UserCheck,
} from "lucide-react";
//@ts-ignore
import officeIllustration5 from "../../assets/officeIllustration5.json";
import officeIllustration6 from "../../assets/officeIllustration6.json";
import { Toast } from "primereact/toast"; // Import PrimeReact Toast
import { useNavigate } from "react-router-dom";
import { registerOrganization } from "../../services/service"; // Import your API function
import { completeProfile } from "../../services/service";
import { sendOtp } from "../../services/service"; // Import the single API function
import "primereact/resources/themes/saga-blue/theme.css"; // Add PrimeReact CSS
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import Lottie from "lottie-react";
import logo2 from "../../assets/logo2.png";

const SignUp: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [role, setRole] = useState<string>("");
  const [domain, setDomain] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [teamSize, setTeamSize] = useState<string>("");
  const [orgName, setOrgName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isCustomFieldVisible, setIsCustomFieldVisible] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const toastRef = useRef<Toast>(null);
  const navigationState = useLocation().state;
  
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

  const [options, setOptions] = useState([
    { label: "Test Automation", value: "Test Automation" },
    { label: "Performance Testing", value: "Performance Testing" },
    { label: "Load Testing", value: "Load Testing" },
    { label: "Others...", value: "custom" },
  ]);

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
  const steps = [
    {
      header: "Profile",
      icon: <UserCheck className="h-6 w-6" />,
      content: "Complete your account information",
    },
    {
      header: "Information",
      icon: <Settings className="h-6 w-6" />,
      content: "Set your preferences and settings",
    },
    {
      header: "Overview",
      icon: <FileCheck className="h-6 w-6" />,
      content: "Review and confirm your details",
    },
  ];

  const nextStep = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const prevStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const navigate = useNavigate();
  const toast = useRef<Toast>(null); // Reference for Toast notifications
  const stepperRef = useRef(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    accountType: "",
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    agreeToTerms: "",
    role: "",
    domain: "",
    interests: "",
    teamSize: "",
    orgName: "",
  });

  const validateFields = () => {
    let valid = true;
    const newErrors: any = {
      firstName: "",
      lastName: "",
      email: "",
      accountType: "",
      role: "",
      domain: "",
      interests: "",
      teamSize: "",
      orgName: "",
    };

    if (activeStep === 0) {
      if (formData.firstName.trim() === "") {
        newErrors.firstName = "First name is required";
        valid = false;
      }
      if (formData.lastName.trim() === "") {
        newErrors.lastName = "Last name is required";
        valid = false;
      }
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Please enter a valid email";
        valid = false;
      }
      if (formData.accountType.trim() === "") {
        newErrors.accountType = "Account type is required";
        valid = false;
      }
    } else if (activeStep === 1) {
      if (role.trim() === "") {
        newErrors.role = "Role is required";
        valid = false;
      }
      if (domain.length === 0) {
        newErrors.domain = "At least one domain must be selected";
        valid = false;
      }
      if (interests.length === 0) {
        newErrors.interests = "At least one interest must be selected";
        valid = false;
      }
      if (formData.accountType === "Team" && teamSize.trim() === "") {
        newErrors.teamSize = "Team size is required for team accounts";
        valid = false;
      }
      if (orgName.trim() === "") {
        newErrors.orgName = "Organization name is required";
        valid = false;
      }
    }

    setErrors(newErrors);
    console.log(newErrors);
    return valid;
  };

  const handleNextStep = () => {
    if (validateFields()) {
      nextStep();
    }
  };

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

  const handleInterestChange = (e) => {
    const selectedValues = e.value;

    if (selectedValues.includes("custom")) {
      setIsCustomFieldVisible(true); // Show the custom input field
    } else {
      setIsCustomFieldVisible(false); // Hide the custom input field if "Others" is deselected
    }

    // Update selected interests
    setInterests(selectedValues.filter((value) => value !== "custom"));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const texts = [
    "Assisting you to squash ambiguities...",
    "Sharpening your visuals to visualize stories...",
    "Preparing your team for seamless collaboration...",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check for form validation
    if (!validateFields()) {
      if (toast.current) {
        toast.current.show({
          severity: "error",
          summary: "Validation Failed",
          detail: "Please fill in all required fields.",
        });
      }
      return;
    }

    // Create payload to send to the API
    const user_information_payload = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      is_individual: formData.accountType === "Individual", // Set true if accountType is 'Individual'
    };

    const org_information_payload = {
      email: formData.email,
      role,
      domain,
      interests,
      team_size: teamSize,
      org_name: orgName.trim(),
      subscriptions: "Mind Maps",
    };

    const otp_payload = {
      email: formData.email,
      otp: parseInt("1234", 10),
    };

    try {
      // Call the registerOrganization API function with the payload
      //@ts-ignore
      const email = formData.email // Replace this with actual email input

      // Store email in cookies (valid across different ports)
      Cookies.set("userEmail", email, { expires: 1, path: "/" });
    
      console.log("Email stored in cookies:", email);
      const user_response = await registerOrganization(
        user_information_payload,
      );
      console.log("Registration successful:", user_response);

      if (toast.current) {
        toast.current.show({
          severity: "success",
          summary: "Registration Successful",
          detail: "Your account has been created successfully!",
          life: 3000,
        });
      }
      setLoading(true);

      const otp_response = await sendOtp(otp_payload);
      console.log("OTP Verified:", otp_response);



      const org_response = await completeProfile(org_information_payload);

      if (org_response?.message) {
        // toastRef.current?.show({
        //   severity: "success",
        //   summary: "Success",
        //   detail: "Profile completed successfully!",
        // });
        window.location.href = `${LOGIN_URL}`;
      } else {
        throw new Error(org_response.message);
      }


      // if (toast.current) {
      //   toast.current.show({
      //     severity: "success",
      //     summary: "OTP Verified",
      //     detail: "OTP verification was successful!",
      //   });
      // }
    } catch (error: any) {
      console.error("Error during registration:", error);
try {
  // Call the registerOrganization API function with the payload
  //@ts-ignore
  const user_response = await registerOrganization(user_information_payload);
  console.log("Registration successful:", user_response);

  if (toast.current) {
    toast.current.show({
      severity: "success",
      summary: "Registration Successful",
      detail: "Your account has been created successfully!",
      life: 3000,
    });
  }

  // Wait for 500ms before the next call
  await new Promise(resolve => setTimeout(resolve, 500));

  setLoading(true);

  const otp_response = await sendOtp(otp_payload);
  console.log("OTP Verified:", otp_response);

  // if (toast.current) {
  //   toast.current.show({
  //     severity: "success",
  //     summary: "OTP Verified",
  //     detail: "OTP verification was successful!",
  //   });
  // }

  // Wait for 500ms before the next call
  await new Promise(resolve => setTimeout(resolve, 500));

  const org_response = await completeProfile(org_information_payload);

  if (org_response?.message) {
    // toastRef.current?.show({
    //   severity: "success",
    //   summary: "Success",
    //   detail: "Profile completed successfully!",
    // });

    // Redirect to the given URL after profile completion
    window.location.href = `${LOGIN_URL}`;
  } else {
    throw new Error(org_response.message);
  }
} catch (error) {
  console.error("Error in registration process:", error);
  if (toast.current) {
    toast.current.show({
      severity: "error",
      summary: "Error",
      detail: error.message || "Something went wrong!",
    });
  }
}

      // Extract backend error message if available
      let errorMessage =
        error.response?.data?.detail || "An unexpected error occurred.";

      // Remove error codes (like "400: ") from the message if present
      errorMessage = errorMessage.replace(/^\d+:\s*/, "");

      // Check if the error message indicates the user needs to complete their profile
      if (errorMessage === "Complete Your Profile") {
        if (toast.current) {
          toast.current.show({
            severity: "warn",
            summary: "Action Required",
            detail: "Complete Your Profile",
            life: 3000,
          });
        }
      } else {
        // Show the error message in a toast
        if (toast.current) {
          toast.current.show({
            severity: "error",
            summary: "Registration Failed",
            detail: errorMessage, // Show the actual backend error message
            life: 3000,
          });
        }
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-screen">
      {/* Toast for notifications */}
      <Toast ref={toast} />

      {/* Left Black Section */}
      <div className="hidden md:flex w-1/2 h-full flex-col justify-center items-center bg-black">
        <motion.div
          className="text-center text-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <img src={logo2} alt="Logo" className="w-64 h-64 mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Quali<span className="text-red-600">zen</span></h1>
        </motion.div>
      </div>
    
      <div className="w-full md:w-1/2 h-full flex flex-col justify-center items-center bg-white">
      {loading ? (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white bg-opacity-90">
          <Lottie
            animationData={officeIllustration6}
            loop
            className="w-80 h-80 md:w-96 md:h-96"
          />
          <div className="mt-6 space-y-2 text-center">
            {texts.map((text, index) => (
              <p key={index} className="text-lg md:text-xl font-semibold text-gray-700">
                {text}
              </p>
            ))}
          </div>
        </div>
        ) : (
        <>
          <div className="flex items-center justify-between max-w-4xl mx-auto mb-8 flex-wrap">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center mb-4 md:mb-0">
                {/* Step Indicator */}
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 bg-white transition-all duration-300 mb-2
                          ${index <= activeStep ? "border-red-600 text-red-600" : "border-gray-300 text-gray-400"}`}
                  >
                    {index < activeStep ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : index === activeStep ? (
                      <CircleDot className="h-6 w-6" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <span className="text-sm font-medium">{step.header}</span>
                </div>

                {/* Connecting Line */}
                {index < steps.length - 1 && (
                  <div className="flex-grow flex items-center">
                    <div
                      className={`h-0.5 w-full transition-all duration-300
                            ${index < activeStep ? "h-0.5 w-full min-w-[80px] bg-red-600 transition-all duration-300" : "h-0.5 w-full min-w-[80px] bg-gray-300 transition-all duration-300"}`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="relative w-full max-w-lg min-h-[600px]">
            {/* First Card */}
            <div
              className={`bg-white rounded-lg p-6 transition-all duration-300 ${activeStep === 0 ? "opacity-100 visible" : "opacity-0 invisible absolute top-0 left-0 right-0"}`}
            >
              <form className="w-full" onSubmit={handleSubmit}>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Start with your free account today
                </h2>

                <div className="mb-3">
                  <label
                    className="block text-gray-700 text-lg font-semibold mb-1"
                    htmlFor="firstName"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg text-gray-700 focus:outline-none ${errors.firstName ? "border-red-500" : "focus:border-indigo-500"}`}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div className="mb-3">
                  <label
                    className="block text-gray-700 text-lg font-semibold mb-1"
                    htmlFor="lastName"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg text-gray-700 focus:outline-none ${errors.lastName ? "border-red-500" : "focus:border-indigo-500"}`}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.lastName}
                    </p>
                  )}
                </div>

                <div className="mb-3">
                  <label
                    className="block text-gray-700 text-lg font-semibold mb-1"
                    htmlFor="email"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="example.email@gmail.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg text-gray-700 focus:outline-none ${errors.email ? "border-red-500" : "focus:border-indigo-500"}`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                <div className="mb-3">
                  <label className="block text-gray-700 text-lg font-semibold mb-1">
                    Account Type
                  </label>
                  <div className="flex items-center space-x-4">
                    <label className="flex text-lg items-center">
                      <input
                        type="radio"
                        name="accountType"
                        value="Individual"
                        checked={formData.accountType === "Individual"}
                        onChange={handleChange}
                        className="form-radio"
                      />
                      <span className="ml-2">Individual</span>
                    </label>
                    <label className="flex text-lg items-center">
                      <input
                        type="radio"
                        name="accountType"
                        value="Team"
                        checked={formData.accountType === "Team"}
                        onChange={handleChange}
                        className="form-radio"
                      />
                      <span className="ml-2">Team</span>
                    </label>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      className={`form-checkbox ${errors.agreeToTerms ? "border-red-500" : ""}`}
                    />
                    <span className="ml-2">Agree to terms and conditions</span>
                  </label>
                  {errors.agreeToTerms && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.agreeToTerms}
                    </p>
                  )}
                </div>
              </form>
            </div>

            {/* Second Card */}
            <div
              className={`bg-white rounded-lg p-6 transition-all duration-300 ${activeStep === 1 ? "opacity-100 visible" : "opacity-0 invisible absolute top-0 left-0 right-0"}`}
            >
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Fields */}
                <div className="w-full">
                  <label
                    className="block text-lg font-medium text-gray-700 mb-1"
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
                    className="w-full border border-gray-300 rounded-md shadow-sm"
                    style={{ width: window.innerWidth > 768 ? "100%" : "100%" }}
                  />
                  {errors.role && (
                    <p className="text-red-500 text-xs mt-1">{errors.role}</p>
                  )}
                </div>

                <div className="w-full">
                  <label
                    className="block text-lg font-medium text-gray-700 mb-1"
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
                    className="w-full border border-gray-300 rounded-md shadow-sm"
                    style={{ width: window.innerWidth > 768 ? "100%" : "100%" }}
                  />
                  {errors.domain && (
                    <p className="text-red-500 text-xs mt-1">{errors.domain}</p>
                  )}
                </div>

                <div className="w-full">
                  <label
                    className="block text-lg font-medium text-gray-700 mb-1"
                    htmlFor="interests"
                  >
                    Interests
                  </label>
                  <div className="h-12 w-full overflow-y-auto">
                    <MultiSelect
                      id="interests"
                      value={interests}
                      options={options}
                      onChange={handleInterestChange}
                      placeholder={<span className="text-gray-400">e.g. Test Automation, Performance Testing</span>}
                      className="w-full border border-gray-300 rounded-md shadow-sm"
                      style={{ width: window.innerWidth > 768 ? "100%" : "100%", height:"100%" }}
                      display="chip"
                    />
                  </div>

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
                        className="w-full px-3 py-2 border rounded-lg text-gray-700 focus:outline-none"
                      />
                    </div>
                  )}

                  {errors.interests && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.interests}
                    </p>
                  )}
                </div>

                {formData?.accountType === "Team" && (
                  <div className="w-full">
                    <label
                      className="block text-lg font-medium text-gray-700 mb-1"
                      htmlFor="team-size"
                    >
                      Team Size
                    </label>
                    <Dropdown
                      id="team-size"
                      style={{width:"100%"}}
                      value={teamSize}
                      options={teamSizeOptions}
                      onChange={(e) => setTeamSize(e.value)}
                      placeholder="Select"
                      className="w-full border border-gray-300 rounded-md shadow-sm"
                    />
                    {errors.teamSize && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.teamSize}
                      </p>
                    )}
                  </div>
                )}

                <div className="w-full">
                  <label
                    className="block text-lg font-medium text-gray-700 mb-1"
                    htmlFor="org-name"
                  >
                    Organization Name
                  </label>
                  <InputText
                    id="org-name"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g. Tech Corp"
                    className="w-full border border-gray-300 rounded-md shadow-sm"
                  />
                  {errors.orgName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.orgName}
                    </p>
                  )}
                </div>
              </form>
            </div>

            {/* Third Card - Overview */}
            <div
              className={`bg-white rounded-lg p-6 transition-all duration-300 ${activeStep === 2 ? "opacity-100 visible" : "opacity-0 invisible absolute top-0 left-0 right-0"}`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-6">
                  <p className="font-semibold text-lg">
                    Personal Information:
                  </p>
                  <p className="text-sm">First Name: {formData.firstName}</p>
                  <p className="text-sm">Last Name: {formData.lastName}</p>
                  <p className="text-sm">Email: {formData.email}</p>
                  <p className="text-sm">
                    Account Type: {formData.accountType}
                  </p>
                </div>
                <div className="space-y-6">
                  <p className="font-semibold text-lg">
                    Professional Information:
                  </p>
                  <p className="text-sm">Role: {role}</p>
                  <p className="text-sm">
                    Domain/Industry: {domain.join(", ") || "Not Selected"}
                  </p>
                  <p className="text-sm">
                    Interests: {interests.join(", ") || "Not Selected"}
                  </p>
                  {formData?.accountType === "Team" && (
                    <p className="text-sm">Team Size: {teamSize}</p>
                  )}
                  <p className="text-sm">Organization Name: {orgName}</p>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6 flex-wrap px-6">
              <button
                onClick={() => {
                  if (activeStep === 0) {
                    window.history.back();
                  } else {
                    prevStep();
                  }
                }}
                className={`px-6 py-2 rounded-md flex items-center gap-2 bg-white border-2 border-red-600 text-red-600 hover:bg-red-50`}
              >
                Previous
              </button>
              {activeStep === steps.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 rounded-md flex items-center gap-2 bg-red-600 text-white"
                >
                  Start Using Qualizen!
                </button>
              ) : (
                <button
                  onClick={handleNextStep}
                  disabled={activeStep === steps.length - 1}
                  className={`px-6 py-2 rounded-md flex items-center gap-2
                      ${activeStep === steps.length - 1 ? "bg-gray-300 cursor-not-allowed" : "bg-red-600 text-white hover:bg-red-700"}`}
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </>
      )}
      </div>
    </div>
  );
};

export default SignUp;

