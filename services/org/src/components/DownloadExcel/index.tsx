import { Button } from 'primereact/button';
import React from 'react';
import { fetchDataByProjectId } from '../../pages/services/service';

interface DownloadExcel {
    label: string;
    onClick: () => void;
    type?: 'button' | 'submit';  // Allows flexibility for form buttons
}

const DownloadExcel: React.FC<DownloadExcel> = ({ label, onClick, type = 'button' }) => {
    return (
        <Button
            type={type}
            onClick={onClick}
            className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-pink-300"
        >
            {label}
        </Button>
    );
};

export default DownloadExcel;