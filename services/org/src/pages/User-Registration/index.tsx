import React, { useState, useRef, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion'; // Import Framer Motion
import { Chips } from 'primereact/chips';
import { Dropdown } from 'primereact/dropdown';
import logo2 from "../../assets/logo2.png";
import logo3 from "../../assets/logo2.jpeg";

const BASE_URL = process.env.BASE_URL

const Registration: React.FC = () => {
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [phone, setPhone] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [role, setRole] = useState<string>('');
    const [newProjectRole, setNewProjectRole] = useState<string | null>(null);
      const [customRoleValue, setCustomRoleValue] = useState("");
    const [isCustomRoleFieldVisible, setIsCustomRoleFieldVisible] =
    useState(false);
const roles = [
  'QA Analyst',
  'Software Tester',
  'Test Engineer',
  'Test Automation Engineer',
  'Performance Tester',
  'Security Tester',
  'Usability Tester', 
  // Add other tester roles as needed
];
    const [interest, setInterest] = useState<string>('');

    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false); // Add loading state
    const toast = useRef<Toast>(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const tokenParam = query.get('token');
        setToken(tokenParam);
    }, [location.search]);

    const handleRegister = async () => {
        if (!token) {
            toast.current?.show({
                severity: 'error',
                summary: 'Registration Error',
                detail: 'Token is missing. Please check your link and try again.',
                life: 3000
            });
            return;
        }

        setLoading(true); // Set loading to true when starting registration

        const payload = {
            first_name: firstName,
            last_name: lastName,
            email: email,
            org_id: token,
            role: newProjectRole,
            interests: interest,
        };

        try {
            const response = await fetch(`${BASE_URL}/auth/api/v2/inviteRegister`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Registration Successful',
                    detail: 'You have registered successfully',
                    life: 3000
                });
                navigate('/login', {state : email}); // Redirect to login page after registration
            } else {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Registration Failed',
                    detail: data.message || 'An unexpected error occurred. Please try again.',
                    life: 3000
                });
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Registration Error',
                detail: 'An error occurred during registration. Please try again.',
                life: 3000
            });
            console.error('Registration error:', error);
        } finally {
            setLoading(false); // Set loading to false after registration completes
        }
    };

    const handleCustomRoleEntry = () => {
        if (customRoleValue.trim() !== "") {
          setNewProjectRole(customRoleValue);
          setCustomRoleValue(""); // Reset input
          setIsCustomRoleFieldVisible(false); // Hide input after adding
        }
      };

    return (
        <div className="w-screen h-screen flex">
            {/* Background image */}
      {/* Left Section - Hidden on Mobile */}
      <div className="hidden md:flex w-1/2 h-full flex-col justify-center items-center bg-black">
        <motion.div
          className="text-center text-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <img src={logo2} alt="Logo" className="w-64 h-64 mb-6" />
          <h1 className="text-5xl font-bold mb-3">Quali<span style={{color: "red" }}>zen</span></h1>
        </motion.div>
      </div>

      <div
    className={`h-full flex flex-col justify-center items-center bg-white p-4 ${
      window.innerWidth < 768 ? "w-full" : "w-1/2"
    }`}
    >
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex md:hidden">
          <motion.h1
                        className="text-5xl font-bold text-black mb-3 drop-shadow-lg"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
<img src={logo3} alt="Logo" className="w-16 h-16" />
                    </motion.h1>
            
          </div>
        
            <motion.div 
                className="relative z-10 flex flex-col justify-center items-center p-6 md:p-12"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                {/* Toast Component */}
                <Toast ref={toast} />
                {/* <div className="text-center mb-4">
                    <motion.h1
                        className="text-5xl font-bold text-black mb-3 drop-shadow-lg"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                      <span className="ml-2 text-4xl font-bold tracking-wide text-gray-100 uppercase">
                <span className='text-black'>Quali</span>
                <span style={{ color: "#DE3840FF" }}>Zen</span>
              </span>
                    </motion.h1>
                </div> */}
                {/* Heading */}
                {/* <div className="text-center mb-12">
                    <motion.h1 
                        className="text-5xl font-bold text-white drop-shadow-lg"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                    >
                        
                    </motion.h1>
                    <motion.h2 
                        className="text-2xl font-semibold text-orange-300"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        Create Your Account
                    </motion.h2>
                </div> */}

                {/* Registration Card */}
                <motion.div 
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <Card className="w-full max-w-md bg-white shadow-2xl p-8 rounded-2xl border border-gray-300">
                        <h2 className="text-3xl font-bold text-center mb-6">Create Your Account</h2>
                        <div className="space-y-6">
                            {/* First Name Input */}
                            <div>
                                <span className="p-float-label">
                                    <InputText 
                                        id="firstName" 
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 transition-shadow shadow-sm hover:shadow-md" 
                                        value={firstName} 
                                        onChange={(e) => setFirstName(e.target.value)} 
                                        placeholder=" "
                                    />
                                    <label htmlFor="firstName" className="text-gray-600">First Name</label>
                                </span>
                            </div>

                            {/* Last Name Input */}
                            <div>
                                <span className="p-float-label">
                                    <InputText 
                                        id="lastName" 
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 transition-shadow shadow-sm hover:shadow-md" 
                                        value={lastName} 
                                        onChange={(e) => setLastName(e.target.value)} 
                                        placeholder=" "
                                    />
                                    <label htmlFor="lastName" className="text-gray-600">Last Name</label>
                                </span>
                            </div>

                            {/* Role Input */}
                            <div className="p-float-label"> 
                            <Dropdown
  id="role"
  value={newProjectRole}
  options={[
    ...roles,
    { label: "Add Custom Role...", value: "custom" }, // Custom Option Example
  ]}
  onChange={(e) => {
    if (e.value === "custom") {
      setIsCustomRoleFieldVisible(true);
      setNewProjectRole(null)
      setRole(null); // Reset selection to show placeholder
    } else {
      setRole(e.value);
      setNewProjectRole(e.value)
      setIsCustomRoleFieldVisible(false);
    }
  }}
  placeholder={role || "Select a Role"}
  style={{
    width: "100%",
    border: "1px solid #D1D5DB",
    borderRadius: "0.375rem",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
  }}
  panelClassName="shadow-lg"
/>

{isCustomRoleFieldVisible && (
                    <div className="mt-6 flex items-center gap-2">
                      <input
                        type="text"
                        value={customRoleValue}
                        onChange={(e) => setCustomRoleValue(e.target.value)}
                        placeholder="Type your custom domain"
                        style={{
                          flex: "1",
                          padding: "0.5rem",
                          border: "1px solid #D1D5DB",
                          borderRadius: "0.375rem",
                        }}
                      />
                      <button
                        onClick={handleCustomRoleEntry}
                        style={{ backgroundColor: "#BA0000", color: "white" }}
                        className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-green-600 focus:outline-none"
                        title="Save custom domain"
                      >
                        Add
                      </button>
                    </div>
                  )}


  {/* <label htmlFor="role" className="text-gray-600">Role</label>  */}
</div>
                            {/* Interest Input */}
                            <div>
  <label htmlFor="interests" className="text-gray-600">Interests</label>
  <Chips
  id="interests"
  value={interest}
  onChange={(e) => setInterest(e.value)}
  placeholder="Enter Tab to Add"
  separator=","  
  onKeyDown={(e) => {
    if (e.key === "Tab") {
      e.preventDefault(); // Prevent tabbing to the next field
      if (e.target.value.trim()) {
        setInterest([...interest, e.target.value.trim()]);
        e.target.value = ""; // Clear input after adding
      }
    }
  }}
/>

</div>


                            {/* Email Input */}
                            <div>
                                <span className="p-float-label">
                                    <InputText 
                                        id="email" 
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 transition-shadow shadow-sm hover:shadow-md" 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)} 
                                        placeholder=" "
                                    />
                                    <label htmlFor="email" className="text-gray-600">Email</label>
                                </span>
                            </div>

                            {/* Register Button */}
                            <Button 
                                label={loading ? "Registering..." : "Register"} 
                                className={`w-full py-3 ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white border-none rounded-lg transition-colors transform ${loading ? '' : 'hover:scale-105'}`}
                                onClick={handleRegister} 
                                disabled={loading} // Disable the button while loading
                            >
                                {loading && <i className="pi pi-spin pi-spinner"></i>} {/* PrimeIcons spinner */}
                            </Button>
                        </div>
                    </Card>
                </motion.div>
            </motion.div>
            </div>
        </div>
    );
};

export default Registration;
