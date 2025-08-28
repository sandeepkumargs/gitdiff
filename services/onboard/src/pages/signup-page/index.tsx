import React, { useState, useRef, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import { registerOrganization } from '../../services/service';
import demo1 from '../../assets/demo1.png';
import loadingGif from '../../assets/loading.gif'; // Your loading GIF
import { useNavigate } from 'react-router-dom';
import loadingBg from '../../assets/loadingbg.jpg'

interface FormErrors {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    phone?: string;
    organisation?: string;
}

const SignUp: React.FC = () => {
    // Form state
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [phone, setPhone] = useState<string>('');
    const [organisation, setOrganisation] = useState<string>('');

    const [loading, setLoading] = useState<boolean>(false);
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [loadingText, setLoadingText] = useState<string>('Training you to squash ambiguities...');
    const toast = useRef<Toast>(null);
    const navigate = useNavigate();

    // Validation function
    const validateForm = (): boolean => {
        const errors: FormErrors = {};

        if (!firstName) errors.firstName = 'First name is required';
        if (!lastName) errors.lastName = 'Last name is required';
        if (!email) errors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Email is invalid';
        // if (!password) errors.password = 'Password is required';
        if (!phone) errors.phone = 'Phone number is required';
        if (!organisation) errors.organisation = 'Organisation name is required';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Form submission handler
    const handleSubmit = async (): Promise<void> => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        const payload = {
            first_name: firstName,
            last_name: lastName,
            email,
            password,
            phone,
            organisation,
        };

        try {
            const response = await registerOrganization(payload);
            toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Registration successful!', life: 3000 });
            navigate('/welcome');
        } catch (err) {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Registration failed. Please try again.', life: 3000 });
        } finally {
            setLoading(false);
        }
    };

    // Effect for alternating loading text
    useEffect(() => {
        let textIndex = 0;
        const texts = [
            'Training you to squash ambiguities...',
            'Sharpening your visuals to visualize stories...'
        ];

        const interval = setInterval(() => {
            setLoadingText(texts[textIndex]);
            textIndex = (textIndex + 1) % texts.length;
        }, 2000); // Switch text every 2 seconds

        return () => clearInterval(interval); // Cleanup interval on unmount
    }, []);

    return (
        <div className="min-h-screen relative bg-gray-50">
            <Toast ref={toast} />

            {/* Loading Screen */}
            {loading && (
                <div className="fixed inset-0 bg-white z-50 flex flex-col justify-center items-center">
                    <img src={loadingGif} alt="Loading..." className="w-100 h-64" />
                    <h2 className="mt-4 text-2xl font-semibold text-red-900 animate-pulse">{loadingText}</h2>
                </div>
            )}

            {/* Background image */}
            <div className="absolute inset-0 opacity-30">
                <img
                    src={demo1}
                    alt="Background"
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="flex flex-col lg:flex-row min-h-screen relative">
                {/* Left Section */}
                <div className="flex-1 flex flex-col justify-center items-start p-6 sm:p-10 z-10">
                    {/* <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-900 text-center sm:text-left">Qualizen</h1> */}
                    <h2 className="mt-2 text-xl sm:text-2xl md:text-3xl font-semibold text-orange-500 text-center sm:text-left">
                        Leveraging the power of AI Agents for QA
                    </h2>
                    <div className="mt-6 flex justify-center sm:justify-start">
                        <img
                            src={demo1}
                            alt="Illustration"
                            className="w-56 sm:w-72 md:w-96 h-56 sm:h-72 md:h-96 object-cover"
                        />
                    </div>
                </div>

                {/* Right Section with Card */}
                <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 z-10 relative">
                    {/* Card on top */}
                    <Card className="w-full max-w-xl sm:max-w-2xl bg-gray-100 shadow-md p-6 relative z-20">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 text-center">Register Your Organization</h2>

                        <div className="grid grid-cols-1 gap-4 md:gap-8 w-full">
                            <div className="p-float-label">
                                <InputText
                                    id="firstName"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className={`w-full ${formErrors.firstName ? 'p-invalid' : ''}`}
                                />
                                <label htmlFor="firstName">First Name</label>
                                {formErrors.firstName && <small className="p-error">{formErrors.firstName}</small>}
                            </div>
                            <div className="p-float-label">
                                <InputText
                                    id="lastName"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className={`w-full ${formErrors.lastName ? 'p-invalid' : ''}`}
                                />
                                <label htmlFor="lastName">Last Name</label>
                                {formErrors.lastName && <small className="p-error">{formErrors.lastName}</small>}
                            </div>
                            <div className="p-float-label">
                                <InputText
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`w-full ${formErrors.email ? 'p-invalid' : ''}`}
                                />
                                <label htmlFor="email">Email</label>
                                {formErrors.email && <small className="p-error">{formErrors.email}</small>}
                            </div>
                            {/* <div className="p-float-label">
                                <InputText 
                                    id="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    type="password"
                                    className={`w-full ${formErrors.password ? 'p-invalid' : ''}`} 
                                />
                                <label htmlFor="password">Password</label>
                                {formErrors.password && <small className="p-error">{formErrors.password}</small>}
                            </div> */}
                            <div className="p-float-label">
                                <InputText
                                    id="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className={`w-full ${formErrors.phone ? 'p-invalid' : ''}`}
                                />
                                <label htmlFor="phone">Phone No.</label>
                                {formErrors.phone && <small className="p-error">{formErrors.phone}</small>}
                            </div>
                            <div className="p-float-label">
                                <InputText
                                    id="organisation"
                                    value={organisation}
                                    onChange={(e) => setOrganisation(e.target.value)}
                                    className={`w-full ${formErrors.organisation ? 'p-invalid' : ''}`}
                                />
                                <label htmlFor="organisation">Organisation Name</label>
                                {formErrors.organisation && <small className="p-error">{formErrors.organisation}</small>}
                            </div>
                            <div>
                                <Button
                                    label="Register Organization"
                                    className="w-full"
                                    onClick={handleSubmit} disabled={loading} /> </div> </div> </Card> </div> </div> </div>);
};

export default SignUp;
