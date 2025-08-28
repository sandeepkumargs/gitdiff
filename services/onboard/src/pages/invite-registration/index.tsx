import React, { useState, useRef } from 'react';
import Lottie from 'lottie-react';
// @ts-ignore
import officeIllustration5 from '../../assets/officeIllustration5.json';
import { Toast } from 'primereact/toast';
import { useNavigate } from 'react-router-dom';
import { registerOrganization } from '../../services/service'; // Adjust path if needed
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { Chips } from 'primereact/chips';

const InviteRegistration: React.FC = () => {
    const navigate = useNavigate();
    const toast = useRef<Toast>(null);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        role: '', // New field: Role
        interests: [], // New field: Interests (array for Chips)
        agreeToTerms: false,
    });

    const [errors, setErrors] = useState({
        firstName: '',
        lastName: '',
        email: '',
        role: '', // Validation for role
        agreeToTerms: '',
    });

    const validateForm = () => {
        let valid = true;
        const newErrors: any = {
            firstName: '',
            lastName: '',
            email: '',
            role: '',
            agreeToTerms: '',
        };

        if (formData.firstName.trim() === '') {
            newErrors.firstName = 'First name is required';
            valid = false;
        }
        if (formData.lastName.trim() === '') {
            newErrors.lastName = 'Last name is required';
            valid = false;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
            valid = false;
        }
        if (formData.role.trim() === '') {
            newErrors.role = 'Role is required';
            valid = false;
        }
        if (!formData.agreeToTerms) {
            newErrors.agreeToTerms = 'You must agree to the terms';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleChipsChange = (e: any) => {
        setFormData({ ...formData, interests: e.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            if (toast.current) {
                toast.current.show({
                    severity: 'error',
                    summary: 'Validation Failed',
                    detail: 'Please fill in all required fields.',
                });
            }
            return;
        }

        const payload = {
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            role: formData.role, // Include role in payload
            interests: formData.interests.join(','), // Convert interests array to comma-separated string
        };

        try {
            // @ts-ignore
            const response = await registerOrganization(payload); // Assuming the same API function is used
            console.log('Registration successful:', response);

            if (toast.current) {
                toast.current.show({
                    severity: 'success',
                    summary: 'Registration Successful',
                    detail: 'Your account has been created successfully!',
                });
            }

            // Pass user data and navigate 
            navigate('/register', {
                state: {
                    email: formData.email,
                    firstName: payload.first_name,
                    role: payload.role, // Pass the role
                    interests: payload.interests, // Pass the interests
                },
            });
        } catch (error) {
            console.error('Error during registration:', error);

            if (toast.current) {
                toast.current.show({
                    severity: 'error',
                    summary: 'Registration Failed',
                    detail: 'Something went wrong. Please try again.',
                });
            }
        }
    };

    return (
        <div>
            <Toast ref={toast} />

            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <form
                    className="w-full max-w-lg bg-white p-4 rounded-lg shadow-lg"
                    onSubmit={handleSubmit}
                >
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Join the Team!
                    </h2>

                    {/* First Name */}
                    <div className="mb-3">
                        <label className="block text-gray-700 text-sm font-semibold mb-1" htmlFor="firstName">
                            First Name
                        </label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            placeholder="First Name"
                            value={formData.firstName}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-lg text-gray-700 focus:outline-none ${errors.firstName ? 'border-red-500' : 'focus:border-indigo-500'}`}
                        />
                        {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                    </div>

                    {/* Last Name */}
                    <div className="mb-3">
                        <label className="block text-gray-700 text-sm font-semibold mb-1" htmlFor="lastName">
                            Last Name
                        </label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            placeholder="Last Name"
                            value={formData.lastName}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-lg text-gray-700 focus:outline-none ${errors.lastName ? 'border-red-500' : 'focus:border-indigo-500'}`}
                        />
                        {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                    </div>

                    {/* Email */}
                    <div className="mb-3">
                        <label className="block text-gray-700 text-sm font-semibold mb-1" htmlFor="email">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="example.email@gmail.com"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-lg text-gray-700 focus:outline-none ${errors.email ? 'border-red-500' : 'focus:border-indigo-500'}`}
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>

                    {/* Role Input */}
                    <div className="mb-3">
                        <label className="block text-gray-700 text-sm font-semibold mb-1" htmlFor="role">
                            Role
                        </label>
                        <input
                            type="text"
                            id="role"
                            name="role"
                            placeholder="e.g., Developer, Designer"
                            value={formData.role}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-lg text-gray-700 focus:outline-none ${errors.role ? 'border-red-500' : 'focus:border-indigo-500'
                                }`}
                        />
                        {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
                    </div>

                    {/* Interests Input (Chips) */}
                    <div className="mb-3">
                        <label className="block text-gray-700 text-sm font-semibold mb-1" htmlFor="interests">
                            Interests
                        </label>
                        <Chips
                            id="interests"
                            name="interests"
                            value={formData.interests}
                            onChange={handleChipsChange}
                            className="w-full"
                            placeholder="Enter your interests separated by commas"
                        />
                        </div>

{/* Terms & Conditions */}
<div className="mb-3">
    <label className="flex items-center">
        <input
            type="checkbox"
            name="agreeToTerms"
            checked={formData.agreeToTerms}
            onChange={handleChange}
            className={`form-checkbox ${errors.agreeToTerms ? 'border-red-500' : ''}`}
        />
        <span className="ml-2">Agree to terms and conditions</span>
    </label>
    {errors.agreeToTerms && <p className="text-red-500 text-xs mt-1">{errors.agreeToTerms}</p>}
</div>

{/* Submit Button */}
<button
    type="submit"
    className="w-full bg-orange-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-75"
>
    SIGN UP
</button>
</form>

{/* Lottie Illustration */}
<div className="mt-8 max-w-lg mx-auto h-64">
<Lottie
    animationData={officeIllustration5}
    loop={true}
    className="w-full h-full"
/>
</div>
</div>
</div>
);
};

export default InviteRegistration;