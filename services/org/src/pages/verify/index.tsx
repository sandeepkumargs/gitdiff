import React, { useRef, useState } from 'react';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import { useLocation, useNavigate } from 'react-router-dom';
import demo1 from '../../assets/demo1.png';
import { motion } from 'framer-motion';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { loginUser } from '../services/service';

const VerifyLogin: React.FC = () => {
  const toast = useRef<Toast>(null);
  const location = useLocation();
  const email = location.state;
  const navigate = useNavigate();
  const [otp, setOtp] = useState<string>(''); // Use string instead of String
  
  const handleLogin = async () => {
    const payload = { email, otp };

    try {
        
        const response = await loginUser(payload);

        if (response.access_token && response.refresh_token) {
            // Store tokens in localStorage
            localStorage.setItem('access_token', response.access_token);
            localStorage.setItem('refresh_token', response.refresh_token);

            toast.current?.show({
                severity: 'success',
                summary: 'Login Successful',
                detail: 'You have logged in successfully',
                life: 3000
            });

            navigate('/dashboard'); // Redirect to the dashboard or another page
        } else {
            toast.current?.show({
                severity: 'error',
                summary: 'Login Failed',
                detail: 'An unexpected error occurred. Please try again.',
                life: 3000
            });
        }
    } catch (error) {
        toast.current?.show({
            severity: 'error',
            summary: 'Login Error',
            detail: 'An error occurred during login. Please try again.',
            life: 3000
        });
        console.error('Login error:', error);
    }
};

  return (
    <div className="min-h-screen relative flex justify-center items-center bg-gray-100 overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={demo1}
          alt="Background"
          className="w-full h-full object-cover brightness-75"
        />
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </div>

      <div className="relative z-10 flex flex-col justify-center items-center p-6 md:p-12">
        {/* Toast Component */}
        <Toast ref={toast} />

        {/* Heading */}
        <div className="text-center mb-12">
          <motion.h1
            className="text-5xl font-bold text-white mb-3 drop-shadow-lg"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            
          </motion.h1>
        </div>

        {/* Verify Card */}
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-white shadow-2xl p-8 rounded-2xl border border-gray-300">
            <h2 className="text-3xl font-bold text-center mb-6">Verify Your Email</h2>
            <div className="space-y-6">
            
              <div>
              <span className="p-float-label">
                <InputText
                  id="otp"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 transition-shadow shadow-sm hover:shadow-md"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder=" "
                />
                <label htmlFor="otp" className="text-gray-600">Enter your OTP</label>
              </span>
            </div>

              {/* Verify Button */}
              <div className="text-center">
                <Button
                  label="Verify Email"
                  className="w-full py-3 bg-blue-600 text-white border-none rounded-lg hover:bg-blue-700 transition-colors transform hover:scale-105"
                  onClick={handleLogin}
                />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default VerifyLogin;