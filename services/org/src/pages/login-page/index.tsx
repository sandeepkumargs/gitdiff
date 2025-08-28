import React, { useState, useRef, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Toast } from "primereact/toast";
import { loginUser, sendOtp } from "../services/service";
import { useNavigate } from "react-router-dom";
import { ProgressSpinner } from "primereact/progressspinner";
import { motion } from "framer-motion";
import background from "../../assets/bg2.jpg";
import Lottie from "react-lottie";
import animationData from "../../assets/Animation.json";
import { InputMask } from "primereact/inputmask";
import { InputOtp } from "primereact/inputotp";
import logo2 from "../../assets/logo2.png";
import logo3 from "../../assets/logo2.jpeg";
import Cookies from "js-cookie";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false); // Loading state
  const toast = useRef<Toast>(null);
  const navigate = useNavigate();
  const hasRun = useRef(false);

  // localStorage.clear();

  useEffect(() => {
    if(hasRun.current) return;
    const emailFromCookie = Cookies.get("userEmail");

    if (emailFromCookie) {
      setEmail(emailFromCookie);
      sendOtpFromRegister(emailFromCookie).then(() => {
        // ✅ Clear cookie after OTP is sent
        Cookies.remove("userEmail");
      });
    }

    hasRun.current = true;
  }, []);



  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (buttonDisabled) {
      timer = setTimeout(() => {
        setButtonDisabled(false);
        setOtpSent(false);
      }, 300000); // 30 seconds
    }
    return () => clearTimeout(timer);
  }, [buttonDisabled]);

  const handleSendOtp = async () => {
    setLoading(true); // Start loading
    try {
      await sendOtp(email);
      toast.current?.show({
        severity: "success",
        summary: "OTP Sent",
        detail: "OTP has been sent to your email.",
        life: 3000,
      });
      setOtpSent(true);
      setButtonDisabled(true);
    } catch (error: any) {
      // Directly show the backend error message
      let errorMessage =
        error.response?.data?.detail || "An unexpected error occurred.";
      errorMessage = errorMessage.replace(/^\d+:\s*/, "");
      toast.current?.show({
        severity: "error",
        summary: "OTP Error",
        detail: errorMessage, // Show the actual backend error message
        life: 3000,
      });

      console.error("OTP sending error:", error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const sendOtpFromRegister = async (email) => {
    setLoading(true); // Start loading
    try {
      await sendOtp(email);
      toast.current?.show({
        severity: "success",
        summary: "OTP Sent",
        detail: "OTP has been sent to your email.",
        life: 3000,
      });
      setOtpSent(true);
      setButtonDisabled(true);
    } catch (error: any) {
      // Directly show the backend error message
      let errorMessage =
        error.response?.data?.detail || "An unexpected error occurred.";
      errorMessage = errorMessage.replace(/^\d+:\s*/, "");
      toast.current?.show({
        severity: "error",
        summary: "OTP Error",
        detail: errorMessage, // Show the actual backend error message
        life: 3000,
      });

      console.error("OTP sending error:", error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleLogin = async () => {
    const payload = { email, otp };

    try {
      const response = await loginUser(payload);

      if (response.access_token && response.refresh_token) {
        localStorage.setItem("access_token", response.access_token);
        localStorage.setItem("refresh_token", response.refresh_token);

        navigate("/dashboard/project");
        setTimeout(() => {
          window.location.reload();
        }, 200);
      } else {
        toast.current?.show({
          severity: "error",
          summary: "Login Failed",
          detail: "An unexpected error occurred. Please try again.",
          life: 3000,
        });
      }
    } catch (error: any) {
      // Extract the "detail" property from the error response
      let errorMessage =
        error.response?.data?.detail || "An unexpected error occurred.";

      // Remove the numeric code (if present) using regex
      errorMessage = errorMessage.replace(/^\d+:\s*/, ""); // Remove numbers followed by ": "

      toast.current?.show({
        severity: "error",
        summary: "Login Error",
        detail: errorMessage, // Display the cleaned error message
        life: 3000,
      });

      console.error("Login error:", error);
    }
  };

  // Handle Enter key press for sending OTP
  const handleKeyPressOtp = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !buttonDisabled) {
      handleSendOtp();
    }
  };

  // Handle Enter key press for Login
  const handleKeyPressLogin = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && otpSent) {
      handleLogin();
    }
  };

  const customInput = ({ events, props }) => (
    <input {...events} {...props} type="text" className="custom-otp-input" />
  );

  const LottieAnimation = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  return (
    <div className="w-screen h-screen flex">
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



      {/* Right Section */}
      <div
    className={`h-full flex flex-col justify-center items-center bg-white p-4 ${
      window.innerWidth < 768 ? "w-full" : "w-1/2"
    }`}
  >
  <div className="absolute top-6 left-1/2 -translate-x-1/2 flex md:hidden">
    <img src={logo3} alt="Logo" className="w-24 h-24" />
  </div>

        <Toast ref={toast} />

        <div className="absolute top-90 text-center flex flex-col justify-center items-center">
          <motion.h1
            className="text-4xl font-bold text-black mb-3 drop-shadow-lg"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ fontFamily: "Raleway, Sans-serif" }}
          >
            Sign In
          </motion.h1>

          {/* Description text */}
          <motion.p
            className="text-lg text-gray-600 mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{ fontFamily: "Raleway, Sans-serif" }}
          >
            Simplify your workflow and enhance your workflow with <br />
            <span className="font-bold text-black">Qualizen</span>. Get started
            now!
          </motion.p>

          <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-6 px-6"> {/* Added padding on x-axis */}
              {/* Email Input */}
              <div className="mt-20">
                <span className="p-float-label">
                  <InputText
                    id="email"
                    className="w-full p-3 border border-gray-300 transition-shadow shadow-sm hover:shadow-md"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder=" "
                    style={{
                      borderColor: "#ccc",
                      borderRadius: "50px",
                      padding: "10px",
                      boxShadow: "none",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#f16629";
                      e.target.style.boxShadow =
                        "0 0 0 3px rgba(241, 102, 41, 0.5)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#ccc";
                      e.target.style.boxShadow = "none";
                    }}
                    onMouseEnter={(e) => {
                      if (document.activeElement !== e.target) {
                        e.target.style.borderColor = "#f16629";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (document.activeElement !== e.target) {
                        e.target.style.borderColor = "#ccc";
                      }
                    }}
                    onKeyDown={handleKeyPressOtp}
                  />
                  <label htmlFor="email" className="text-gray-600">
                    Email
                  </label>
                </span>
              </div>

              {/* Send OTP Button */}
              {/* Send OTP Button (Only Show if Not Sent) */}
              {!buttonDisabled && !loading && (
                <div className="text-center">
                  <Button
                    label="Send OTP"
                    style={{
                      backgroundColor: "#1a2668",
                      color: "white",
                      border: "none",
                      borderRadius: "50px",
                      width: "100%",
                      padding: "10px 0",
                    }}
                    className="hover:bg-[#141b4d] transition-colors transform hover:scale-105 text-sm"
                    onClick={handleSendOtp}
                  />
                </div>
              )}

              {loading && (
                <div className="text-center">
                  <ProgressSpinner
                    style={{
                      width: "20px",
                      height: "20px",
                      marginRight: "8px",
                    }}
                    strokeWidth="4"
                    fill="rgba(0,0,0,0.1)"
                  />
                  <span className="text-sm text-gray-600">Sending OTP...</span>
                </div>
              )}

              {/* OTP Input and Login */}
              {otpSent && (
                <div className="space-y-6 mt-6 flex flex-col items-center justify-center">
                  <style scoped>
                    {`
                    .custom-otp-input {
                        width: 60px; /* Wider input field */
                        height: 60px; /* Taller input field */
                        font-size: 24px; /* Larger text */
                        border: none; /* Remove border */
                        appearance: none; /* Reset browser styles */
                        text-align: center; /* Center align text */
                        transition: all 0.3s; /* Smooth transition for effects */
                        background: transparent; /* Transparent background */
                        border-bottom: 2px solid var(--surface-500); /* Bottom border */
                        outline: none;
                    }

                    .custom-otp-input:focus {
                        outline: none; /* Remove focus outline */
                        border-bottom-color: var(--primary-color); /* Change border color on focus */
                    }

                    .custom-otp-input::placeholder {
                        color: var(--text-secondary); /* Placeholder text color */
                        opacity: 0.5; /* Light placeholder opacity */
                    }
                `}
                  </style>
                  <InputOtp
                    value={otp}
                    onChange={(e) => setOtp(e.value)}
                    numInputs={4}
                    inputTemplate={customInput}
                    // separator={<span>-</span>}
                  />
                  <Button
                    label="Login"
                    className="w-full"
                    onClick={handleLogin}
                    disabled={otp.length !== 4}
                    style={{ maxWidth: "18rem", marginTop: "1.5rem" }} // Wider button for balance
                  />
                </div>
              )}

              {/* Resend OTP Link */}
              {otpSent && (
                <div className="text-center mt-4">
                  <span className="text-gray-500">Did not receive OTP?</span>
                  <span
                    onClick={handleSendOtp}
                    className="text-[#f16629] cursor-pointer hover:underline ml-2"
                  >
                    Resend OTP
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
