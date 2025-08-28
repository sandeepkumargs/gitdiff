import React from 'react';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { FaArrowRight } from 'react-icons/fa'; // For an icon on the button
import { motion } from 'framer-motion'; // For animations

const HomePage: React.FC = () => {
    const navigate = useNavigate();

    const handleLoginNow = () => {
        navigate('/login'); // Navigate to the login page
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100">
            <motion.div
                className="flex flex-col items-center p-6 md:p-12"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="w-full max-w-4xl bg-white shadow-2xl p-8 rounded-3xl border border-gray-300 text-center">
                    <div className="mb-8">
                        <motion.h1
                            className="text-5xl font-bold mb-4 text-gray-800"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            Thank You for Registering!
                        </motion.h1>
                        <motion.p
                            className="text-xl text-gray-600 mb-8"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            Get started with AI agents and unlock advanced testing capabilities.
                        </motion.p>
                    </div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                    >
                        <Button
                            label="Login Now"
                            className="w-full py-3 bg-blue-600 text-white border-none rounded-lg hover:bg-blue-700 transition-colors transform hover:scale-105 flex items-center justify-center"
                            onClick={handleLoginNow}
                            icon={<FaArrowRight className="ml-2 text-lg" />}
                            iconPos="right"
                        />
                    </motion.div>
                </Card>
            </motion.div>
        </div>
    );
};

export default HomePage;
