import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import { sendOtp } from '../../services/service'; // Import the single API function

const Register: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation(); // To access passed email
  const toast = useRef<Toast>(null);

  const [otp, setOtp] = useState<string>('');
  const [timer, setTimer] = useState<number>(30); // 30 seconds timer for resend OTP
  const [isResendActive, setIsResendActive] = useState<boolean>(false);
  const [email, setEmail] = useState<string>(location.state?.email || ''); // Get email from SignUp
  useEffect(() => {
    if (timer > 0) {
      const timeout = setTimeout(() => {
        setTimer(timer - 1);
      }, 1000);
      return () => clearTimeout(timeout);
    } else {
      setIsResendActive(true);
    }
  }, [timer]);

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtp(e.target.value);
  };

  const handleVerify = async () => {
    if (!otp || otp.length !== 4) {
      if (toast.current) {
        toast.current.show({
          severity: 'error',
          summary: 'Invalid OTP',
          detail: 'Please enter a valid 4-digit OTP.',
        });
      }
      return;
    }

    const payload = {
      email,
      otp: parseInt(otp, 10),
    };

    try {
      // Call the sendOtp function to verify OTP with the email and OTP
      //@ts-ignore
      const response = await sendOtp(payload);
      console.log('OTP Verified:', response);

      if (toast.current) {
        toast.current.show({
          severity: 'success',
          summary: 'OTP Verified',
          detail: 'OTP verification was successful!',
        });
      }
      // navigate('/suite', {state:{email, isIndividual:location.state?.isIndividual, firstName: location.state?.firstName}}); // Navigate after successful verification
      navigate('/info', { state: { subscriptions: {ambiguity_checkcer: true,
        mind_maps: true,
        test_scenarios: true,}, email, isIndividual:location.state?.isIndividual, firstName: location.state?.firstName } });
    } catch (error) {
      console.error('OTP verification failed:', error);

      if (toast.current) {
        toast.current.show({
          severity: 'error',
          summary: 'Verification Failed',
          detail: 'OTP verification failed. Please try again.',
        });
      }
    }
  };

  const handleResendOtp = async () => {
    try {
      //@ts-ignore
      await sendOtp(email); // Send OTP to the provided email
      setTimer(30); // Reset timer
      setIsResendActive(false); // Disable resend button
      if (toast.current) {
        toast.current.show({
          severity: 'info',
          summary: 'OTP Sent',
          detail: 'A new OTP has been sent to your email.',
        });
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      if (toast.current) {
        toast.current.show({
          severity: 'error',
          summary: 'Resend Failed',
          detail: 'Failed to resend OTP. Please try again later.',
        });
      }
    }
  };

  return (
    <div>
      <Toast ref={toast} />

      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 shadow-md rounded-md w-full max-w-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">One Last Step</h2>
          <p className="text-gray-600 mb-6">Verify your email</p>
          <p className="text-sm text-gray-500 mb-6">
            Enter the one-time password (OTP) sent to your email: <strong>{email}</strong>
          </p>
          <input
            type="text"
            placeholder="Enter your OTP here"
            value={otp}
            onChange={handleOtpChange}
            className="w-full p-3 border border-gray-300 rounded mb-4 focus:outline-none focus:border-indigo-500"
          />
          <div className="text-gray-500 text-sm mb-6">
            Resend in {timer}s{' '}
            {isResendActive && (
              <button
                onClick={handleResendOtp}
                className="ml-2 text-indigo-500 hover:underline focus:outline-none"
              >
                Resend OTP
              </button>
            )}
          </div>
          <button
            onClick={handleVerify}
            className="w-full bg-orange-500 text-white py-3 rounded hover:bg-orange-600 transition duration-200"
          >
            VERIFY
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
