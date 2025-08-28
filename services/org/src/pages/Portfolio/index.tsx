import React, { useState, useEffect, useContext } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Chips } from 'primereact/chips';
import { useNavigate, useLocation } from 'react-router-dom'; // Import useLocation
import { fetchPortfolios, addPortfolio as addPortfolioService, registerUser, fetchProjectsByPortfolioId, getUser } from '../services/service'; // Import the service
import { AppContext } from '../../routing/appContext';
import { Dropdown } from 'primereact/dropdown';
import { Skeleton } from 'primereact/skeleton';
import { InputTextarea } from 'primereact/inputtextarea';
import Lottie from 'react-lottie'
import loadingAnimation from '../../assets/loading.json'
import { Sidebar } from 'primereact/sidebar';

interface Portfolio {
  id: string;
  name: string;
  description: string;
  projectCount: number;
  credits: number;
  tags: string[];
}

interface Project {
  id: string;
  name: string;
  description: string;
}

interface InviteData {
  email: string,
  portfolio_id: string,
  project_id: string,
  type: string,
  read_write_access: boolean
}

const Portfolio: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { data, setData } = useContext(AppContext);

  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newPortfolioName, setNewPortfolioName] = useState('');
  const [newPortfolioDescription, setNewPortfolioDescription] = useState('');
  const [newPortfolioProjectCount, setNewPortfolioProjectCount] = useState(0);
  const [newPortfolioCredits, setNewPortfolioCredits] = useState('');
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [newPortfolioTags, setNewPortfolioTags] = useState<string[]>([]);
  const [addMemberDialog, setAddMemberDialog] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    name: '',
    description: '',
    credits: '',
    tags: '',
  });
  const [inviteData, setInviteData] = useState<InviteData>({
    email: "",
    portfolio_id: selectedPortfolio,
    project_id: selectedProject,
    type: "",
    read_write_access: true
  });
  const [myRole, setMyRole] = useState<string>("");

  const loadPortfolios = async () => {
    try {
      const data = await fetchPortfolios();
      setPortfolios(data);
    } catch (error) {
      console.error('Failed to load portfolios', error);
    }
  };

  useEffect(() => {
    loadPortfolios();
  }, []);

  useEffect(() => {
    console.log("Updated portfolios:", portfolios);
  }, [portfolios]); // Runs when portfolios changes



  useEffect(() => {
    const user = async () => {
      try {
        const data = await getUser();
        setMyRole(data);
      } catch (error) {
        console.error('Failed to user details', error);
      }
    }
    user();
  }, []);

  useEffect(() => {
    const state = location.state as { portfolioId?: string };
    if (state && state.portfolioId) {
      // console.log('Portfolio ID from state:', state.portfolioId);
      // Handle additional actions based on portfolioId from state
    }
  }, [location.state]);

  useEffect(() => {
    const fetchProjects = async () => {
      if (selectedPortfolio !== 'All') {
        try {
          const fetchedProjects = await fetchProjectsByPortfolioId(selectedPortfolio);
          setProjects(fetchedProjects);
        } catch (error) {
          console.error('Failed to load projects', error);
        }
      } else {
        setProjects([]);
      }
    };
    fetchProjects();
  }, [selectedPortfolio]);

  // console.log(myRole,'rolla');

  // console.log(portfolios,'ppt');

  const addPortfolio = async () => {
    // Validation
    const errors = {
      name: !newPortfolioName ? 'Name is required.' : '',
      description: !newPortfolioDescription ? 'Description is required.' : '',
      credits: newPortfolioCredits <= 0 ? 'Credits should be greater than 0.' : '',
      tags: newPortfolioTags.length === 0 ? 'At least one tag is required.' : '',
    };

    setValidationErrors(errors);

    const hasErrors = Object.values(errors).some((error) => error !== '');

    if (hasErrors) {
      return; // Prevent submission if validation fails
    }

    const newPortfolio = {
      name: newPortfolioName,
      description: newPortfolioDescription,
      tags: newPortfolioTags,
      credits: newPortfolioCredits,
    };

    try {
      await addPortfolioService(newPortfolio);
      loadPortfolios();
      

      const updatedPortfolio: Portfolio = {
        id: myRole.default_portfolio_id, // Temporary ID
        name: newPortfolioName,
        description: newPortfolioDescription,
        projectCount: newPortfolioProjectCount,
        credits: newPortfolioCredits,
        tags: newPortfolioTags,
      };

      setPortfolios([...portfolios, updatedPortfolio]);
      clearFormFields();
    } catch (error) {
      console.error('Failed to add portfolio:', error);
    }
  };

  const clearFormFields = () => {
    setNewPortfolioName('');
    setNewPortfolioDescription('');
    setNewPortfolioProjectCount(0);
    // setNewPortfolioCredits();
    setNewPortfolioTags([]);
    setIsModalVisible(false);
  };

  const handlePortfolioClick = (portfolio: Portfolio) => {
    setData({
      ...data,
      portfolioDetails: portfolio,
    });
    navigate('/dashboard/project', {
      state: portfolio,
    });
  };

  const handleInviteDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInviteData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setSelectedPortfolio(value)
  };

  const handleAccessLevelChange = (access: boolean) => {
    setInviteData((prevData) => ({
      ...prevData,
      read_write_access: access,
    }));
  };

  const loadingOptions = {
    loop: true,
    autoplay: true,
    animationData: loadingAnimation,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  const handleInvite = async () => {
    if (!inviteData.email) {
      alert('Please provide an email');
      return;
    }

    setLoading(true); // Start loading spinner

    const token = localStorage.getItem('refresh_token');
    if (!token) {
      alert('Authorization token is missing');
      setLoading(false);
      return;
    }

    try {
      const result = await registerUser(
        inviteData.email,
        token,
        inviteData.portfolio_id,
        projects[0].id,
        'portfolio',
        true
      );
      console.log('Registration successful:', result);
      alert('Invite sent successfully!');
      setAddMemberDialog(false);
    } catch (error) {
      console.error('Error registering user:', error);
      alert('Failed to register user. Please try again.');
    } finally {
      setLoading(false); // Stop loading spinner
    }
  };


  return (
    <div className="p-8 bg-grey-500 mt-6 max-w-full mx-auto">
      <div className="App" >
        <div>
          <div className='flex w-full'>
            <h1 className="text-2xl font-bold mb-4">Portfolio Overview</h1>
            {/* <Button label={loading ? 'Sending Invite...' : 'Add Members'} icon="pi pi-plus" className="p-button-primary ml-auto" style={{ backgroundColor: '#1E3A8A', color: 'white' }}
            size='small' onClick={() => setAddMemberDialog(true)} /> */}
          </div>

  {portfolios?.length > 0 ? (
    <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 p-6">
      {portfolios.map((portfolio) => (
        <div
          key={portfolio.id}
          className="group relative transform transition-all duration-300 ease-in-out hover:scale-105 bg-white bg-opacity-80 backdrop-blur-lg border border-gray-200 rounded-3xl shadow-lg hover:shadow-2xl overflow-hidden cursor-pointer"
          onClick={() => handlePortfolioClick(portfolio)}
        >
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-red-100 opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>

          {/* Portfolio Content */}
          <div className="relative p-6">
            <h5 className="text-xl font-extrabold text-gray-800 group-hover:text-red-600 transition-colors">
              {portfolio.name.length > 40 ? `${portfolio.name.substring(0, 40)}...` : portfolio.name}
            </h5>
            <p className="text-sm text-gray-700 mt-2 group-hover:text-gray-900 transition-colors">
              {portfolio.description.length > 100 ? `${portfolio.description.substring(0, 100)}...` : portfolio.description}
            </p>
            {/* <p className="text-gray-500 mt-4 flex items-center">
              <i className="pi pi-folder-open mr-2"></i>
              Projects: {portfolio.projectCount}
            </p> */}
          </div>

          {/* Animated Line */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500 group-hover:h-1 transition-all duration-300"></div>
        </div>
      ))}

      {/* Add Portfolio Card */}
      {myRole.org_admin !== false && (
        <div
          className="relative transform transition-all duration-300 ease-in-out hover:scale-105 bg-white bg-opacity-80 backdrop-blur-lg border border-dashed border-gray-300 rounded-3xl shadow-md hover:shadow-xl p-6 flex flex-col items-center justify-center cursor-pointer overflow-hidden"
          onClick={() => setIsModalVisible(true)}
        >
          {/* Floating Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-transparent to-gray-50 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>

          {/* Plus Icon */}
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 text-red-600 rounded-full shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300">
            <span className="text-3xl font-bold">+</span>
          </div>

          {/* Add Text */}
          <h5 className="text-lg font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
            Add New Portfolio
          </h5>
        </div>
      )}
      </div>
    </>
  ) : (
    <div className="flex justify-center items-center">
        <Lottie options={loadingOptions} height={150} width={150} />
    </div>
  )}



          {/* Add Portfolio Dialog */}
          <Sidebar
  visible={isModalVisible}
  position="right"
  onHide={() => setIsModalVisible(false)}
  className="p-sidebar-lg"
  style={{
    width: '700px',
    height: '700px',
    borderTopLeftRadius: '20px',
    borderBottomLeftRadius: '20px',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(6px)',
  }}
>
  <div className="px-8">
    {/* Close Button */}
    <button
      className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 p-2 rounded-full"
      onClick={() => setIsModalVisible(false)}
      aria-label="Close Sidebar"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>

    {/* Header */}
    <div className="flex items-center mb-6">
      <h3 className="text-2xl font-semibold text-gray-900">Add Portfolio</h3>
    </div>

    {/* Form Content */}
    <div className="p-fluid space-y-6">
      <div className="field">
        <label className="block text-sm font-medium text-gray-500">Portfolio Name</label>
        <InputText
          value={newPortfolioName}
          onChange={(e) => setNewPortfolioName(e.target.value)}
          placeholder="Enter portfolio name..."
          className={`w-full mt-1 ${validationErrors.name && 'p-invalid'}`}
          inputClassName="text-lg font-semibold text-gray-800"
          autoFocus
        />
        {validationErrors.name && <small className="p-error">{validationErrors.name}</small>}
      </div>

      <div className="field">
        <label className="block text-sm font-medium text-gray-500">Portfolio Description</label>
        <InputTextarea
          value={newPortfolioDescription}
          onChange={(e) => setNewPortfolioDescription(e.target.value)}
          placeholder="Describe portfolio..."
          rows={4}
          autoResize
          className={`w-full mt-1 ${validationErrors.description && 'p-invalid'}`}
          inputClassName="text-lg font-semibold text-gray-800"
        />
        {validationErrors.description && <small className="p-error">{validationErrors.description}</small>}
      </div>

      <div className="field">
        <label className="block text-sm font-medium text-gray-500">Credits</label>
        <InputText
          type="number"
          value={newPortfolioCredits.toString()}
          onChange={(e) => setNewPortfolioCredits(parseInt(e.target.value, 10))}
          placeholder="Enter credits..."
          className={`w-full mt-1 ${validationErrors.credits && 'p-invalid'}`}
          inputClassName="text-lg font-semibold text-gray-800"
        />
        {validationErrors.credits && <small className="p-error">{validationErrors.credits}</small>}
      </div>

      <div className="field">
        <label className="block text-sm font-medium text-gray-500">Tags</label>
        <Chips
          value={newPortfolioTags || []}
          onChange={(e) => setNewPortfolioTags(e.value || [])}
          placeholder="Add tags..."
          className={`w-full mt-1 ${validationErrors.tags && 'p-invalid'}`}
          style={{
            border: '1px solid #D1D5DB',
            borderRadius: '0.375rem',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
          }}
          onKeyDown={(e) => {
            if (e.key === 'Tab') {
              e.preventDefault();
              const value = e.currentTarget.value.trim();
              if (value) {
                setNewPortfolioTags((prevTags) => [...prevTags, value]);
                e.currentTarget.value = '';
              }
            }
          }}
        />
        {validationErrors.tags && <small className="p-error">{validationErrors.tags}</small>}
      </div>

      <div className="flex justify-center mt-8">
        <button
          style={{ backgroundColor: "#BA0000", color: "white" }}
          onClick={addPortfolio}
          className="text-md p-button-success p-3 w-[20%] bg-red-800 rounded-md text-white hover:bg-red-700 transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  </div>
</Sidebar>
          <Dialog
            visible={addMemberDialog}
            style={{
              width: '600px', // Reduced width to make it more compact
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              padding: '20px',
              backgroundColor: '#fff',
            }}
            header="Invite New Member"
            modal
            onHide={() => setAddMemberDialog(false)}
          >
            <div style={{ padding: '15px' }}>
              {/* Email Input */}
              <div style={{ marginBottom: '16px' }}>
                <label
                  htmlFor="email"
                  style={{
                    fontWeight: '600',
                    marginBottom: '6px',
                    fontSize: '14px',
                    color: '#333',
                    display: 'block',
                  }}
                >
                  Email
                </label>
                <InputText
                  id="email"
                  name="email"
                  value={inviteData.email}
                  onChange={handleInviteDataChange}
                  placeholder="Enter email"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    fontSize: '14px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
                  }}
                />
              </div>

              {/* Portfolio Dropdown */}
              <div style={{ marginBottom: '16px' }}>
                <label
                  htmlFor="portfolio_id"
                  style={{
                    fontWeight: '600',
                    marginBottom: '6px',
                    fontSize: '14px',
                    color: '#333',
                    display: 'block',
                  }}
                >
                  Select Portfolio
                </label>
                <Dropdown
                  id="portfolio_id"
                  name="portfolio_id"
                  value={selectedPortfolio}
                  // value={inviteData.portfolio_id}
                  options={[{ label: 'Select Portfolio', value: '' }, ...portfolios.map((p) => ({ label: p.name, value: p.id }))]}
                  onChange={handleInviteDataChange}
                  placeholder="Select Portfolio"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    fontSize: '14px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
                  }}
                />
              </div>

              {/* Access Level - Only show if invite type is "user" */}
              {inviteData.type === 'user' && (
                <div style={{ marginBottom: '16px' }}>
                  <label
                    style={{
                      fontWeight: '600',
                      marginBottom: '6px',
                      fontSize: '14px',
                      color: '#333',
                      display: 'block',
                    }}
                  >
                    Access Level
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <RadioButton
                        name="accessLevel"
                        value={false}
                        checked={!inviteData.read_write_access}
                        onChange={() => handleAccessLevelChange(false)}
                      />
                      <label style={{ marginLeft: '8px', fontSize: '14px', color: '#333' }}>Read Only</label>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <RadioButton
                        name="accessLevel"
                        value={true}
                        checked={inviteData.read_write_access}
                        onChange={() => handleAccessLevelChange(true)}
                      />
                      <label style={{ marginLeft: '8px', fontSize: '14px', color: '#333' }}>Read Write</label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
              <Button
                label="Cancel"
                icon="pi pi-times"
                onClick={() => setAddMemberDialog(false)}
                style={{
                  backgroundColor: '#f5f5f5',
                  borderColor: '#ddd',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  color: '#555',
                  fontWeight: '600',
                  transition: 'background-color 0.3s ease',
                  fontSize: '14px',
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = '#f0f0f0')}
                onMouseLeave={(e) => (e.target.style.backgroundColor = '#f5f5f5')}
              />
              <Button
                label={loading ? 'Sending Invite...' : 'Invite'}
                icon="pi pi-check"
                onClick={() => handleInvite()}
                style={{
                  backgroundColor: '#007ad9',
                  borderColor: '#007ad9',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  color: '#fff',
                  fontWeight: '600',
                  transition: 'background-color 0.3s ease',
                  fontSize: '14px',
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = '#005bb5')}
                onMouseLeave={(e) => (e.target.style.backgroundColor = '#007ad9')}
              />
            </div>
          </Dialog>
        </div>
      </div>

    </div>
  );
};

export default Portfolio;
