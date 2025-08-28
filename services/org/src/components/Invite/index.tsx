// src/components/Invite.tsx
import React, { useState, useContext } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { RadioButton } from 'primereact/radiobutton';
import { Button } from 'primereact/button';
import { registerUser } from '../../pages/services/service'; 
import { motion } from 'framer-motion';
import { AppContext } from '../../routing/appContext';

const Invite: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  //@ts-ignore
  const { data } = useContext(AppContext);

  const portfolioid = data.portfolioDetails?.id;
  const projectid = data.projectDetails?.id;
  
  const handleInviteClick = () => {
    setVisible(true);
  };

  const handleSave = async () => {
    if (!email || !selectedOption) {
      alert('Please provide an email and select a scope.');
      return;
    }

    setLoading(true); // Start loading spinner

    const token = localStorage.getItem('refresh_token');  // Retrieve the token from localStorage or any other source
    if (!token) {
      alert('Authorization token is missing');
      setLoading(false);
      return;
    }

    try {
        
      const result = await registerUser(email, selectedOption, token, portfolioid, projectid);
      
      console.log('Registration successful:', result);
      alert('Invite Sent successfully!');
      setVisible(false);
    } catch (error) {
      console.error('Error registering user:', error);
      alert('Failed to register user. Please try again.');
    } finally {
      setLoading(false); // Stop loading spinner
    }
  };

  const handleCancel = () => {
    setVisible(false);
  };

  return (
    <>
      <Button label="Invite" onClick={handleInviteClick} className="bg-blue-900 text-white p-3 rounded-md shadow-md hover:bg-blue-800 transition-colors" />
      <Dialog header="Invite User" visible={visible} style={{ width: '30vw' }} onHide={handleCancel}>
        <div className="p-field">
          <label htmlFor="email" className="block mb-2">Email</label>
          <InputText id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email" className="w-full" />
        </div>

        <div className="p-field mt-4">
          <label className="block mb-2">Select one:</label>
          <div className="flex flex-column gap-8">
            <div className="flex items-center">
              <RadioButton 
                inputId="organisation" 
                name="option" 
                value="organisation" 
                onChange={(e) => setSelectedOption(e.value)} 
                checked={selectedOption === 'organisation'} 
              />
              <label htmlFor="organisation" className="ml-2">Organisation</label>
            </div>
            <div className="flex items-center">
              <RadioButton 
                inputId="portfolio" 
                name="option" 
                value="portfolio" 
                onChange={(e) => setSelectedOption(e.value)} 
                checked={selectedOption === 'portfolio'} 
              />
              <label htmlFor="portfolio" className="ml-2">Portfolio</label>
            </div>
            <div className="flex items-center">
              <RadioButton 
                inputId="project" 
                name="option" 
                value="project" 
                onChange={(e) => setSelectedOption(e.value)} 
                checked={selectedOption === 'project'} 
              />
              <label htmlFor="project" className="ml-2">Project</label>
            </div>
          </div>
        </div>

        <div className="p-d-flex justify-content-end mt-4">
          <Button label={loading ? 'Sending Invite...' : 'Invite'} onClick={handleSave} className="p-button-primary mr-2" disabled={loading} />
          <Button label="Cancel" onClick={handleCancel} className="p-button-secondary" />
        </div>
      </Dialog>
    </>
  );
};

export default Invite;
