import React, { useState, useEffect, useContext } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchProjectsByPortfolioId, addProject, fetchPortfolios, registerUser, getUserRole, getUser } from '../services/service';
import { AppContext } from '../../routing/appContext';
import { Chips } from 'primereact/chips';
import { RadioButton } from 'primereact/radiobutton';
import Avatars from '../../components/Avatars/avatars';
import { Skeleton } from 'primereact/skeleton';
import { MultiSelect } from 'primereact/multiselect';
import Lottie from 'react-lottie'
import loadingAnimation from '../../assets/loading.json'
import { Sidebar } from 'primereact/sidebar';

interface Project {
  id: number;
  name: string;
  description: string;
}

interface Portfolio {
  id: string;
  name: string;
  description: string;
  projectCount: number;
  credits: number;
  tags: string[];
}
interface InviteData {
  email: string,
  portfolio_id: string,
  project_id: string,
  type: string,
  read_write_access: boolean
}

interface User {
  verified: boolean;
  is_individual: boolean;
  default_portfolio_id: string;
  first_name: string; // Assuming user has first_name
}

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = React.useRef<Toast>(null);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newProjectDomain, setNewProjectDomain] = useState<string | null>(null);
  const [newProjectPlatforms, setNewProjectPlatforms] = useState<string[]>([]);
  const [newProjectCredits, setNewProjectCredits] = useState<string>('');
  const [addMemberDialog, setAddMemberDialog] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data, setData } = useContext(AppContext);
  const portfolioDetails = location.state?.portfolioDetails || data?.portfolioDetails;
  const portfolioId = portfolioDetails?.id || portfolioDetails?.[0]?.id;
  
  const [selectedPortfolio, setSelectedPortfolio] = useState<string | undefined>(portfolioId);
  
  const [selectedProject, setSelectedProject] = useState<string>(data?.projectDetails.id);
  const [myRole, setMyRole] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);

  const [customDomainValue, setCustomDomainValue] = useState("");
  const [isCustomDomainFieldVisible, setIsCustomDomainFieldVisible] =
    useState(false);
  const [isCustomPlatformFieldVisible, setIsCustomPlatformFieldVisible] =
    useState(false);
  const [customPlatformValue, setCustomPlatformValue] = useState("");

  const [validationErrors, setValidationErrors] = useState({
    title: '',
    description: '',
    domain: '',
    platforms: '',
    credits: '',
  });

  const [inviteData, setInviteData] = useState<InviteData>({
    email: "",
    portfolio_id: selectedPortfolio,
    project_id: selectedProject,
    type: "",
    read_write_access: true
  });


  // Example domain options
  const domainOptions = [
    { label: 'Banking', value: 'Banking' },
    { label: 'FinTech', value: 'FinTech' },
    { label: 'Insurance', value: 'Insurance' },
    { label: 'HealthCare & Life Science', value: 'HealthCare & Life Science' },
    { label: 'Retail & eCommerce', value: 'Retail & eCommerce' },
    { label: 'IT Services', value: 'IT Services' },
    { label: 'OTT', value: 'OTT' },
    { label: 'Media & Entertainment', value: 'Media & Entertainment' },
    { label: 'Telecommunication', value: 'Telecommunication' },
    { label: 'Energy & Utilities', value: 'Energy & Utilities' },
    { label: 'Travel, Transport & Logistics', value: 'Travel, Transport & Logistics' },
    { label: 'Government & Public Sectors', value: 'Government & Public Sectors' },
    { label: 'Education (EdTech)', value: 'Education (EdTech)' },
    { label: 'Real Estate & Constructions', value: 'Real Estate & Constructions' },
    { label: 'Manufacturing', value: 'Manufacturing' },
    { label: 'Hospitality & Tourism', value: 'Hospitality & Tourism' },
    { label: 'Agriculture and Agribusiness', value: 'Agriculture and Agribusiness' },
    { label: 'Aerospace and Defense', value: 'Aerospace and Defense' },
    { label: 'Legal and Professional Services', value: 'Legal and Professional Services' }
  ];

  const platformOptions = [
    // { label: 'Web (M-Web and D-Web)', value: 'web' },
    { label: 'Android', value: 'android' },
    { label: 'iOS', value: 'ios' },
    { label: 'Android TV', value: 'android_tv' },
    { label: 'Apple TV', value: 'apple_tv' },
    { label: 'AFTV/AFS', value: 'aftv_afs' },
    { label: 'JIO STB', value: 'jio_stb' },
    { label: 'Samsung TV', value: 'samsung_tv' },
    { label: 'LG TV', value: 'lg_tv' },

    { label: 'Windows', value: 'windows' },
    { label: 'macOS', value: 'macos' },
    { label: 'Linux', value: 'linux' },
    { label: 'Web', value: 'web' },
    { label: 'PlayStation', value: 'playstation' },
    { label: 'Xbox', value: 'xbox' },
    { label: 'Nintendo Switch', value: 'nintendo_switch' },
    { label: 'Smart TV', value: 'smart_tv' },
  ];

  const loadingOptions = {
    loop: true,
    autoplay: true,
    animationData: loadingAnimation,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };


  const fetchUser = async () => {
    try {
      const fetchedUser = await getUser();
      if (fetchedUser) {
        setUser(fetchedUser);
      } else {
        console.warn("Fetched user is undefined or null.");
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null); // Ensure state consistency even if fetch fails
    }
  };
  
  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    const hasNavigated = sessionStorage.getItem("hasNavigated");

    if (user?.is_individual === false && !hasNavigated) {
      sessionStorage.setItem("hasNavigated", "true");
      navigate("/dashboard/portfolio");
    }
  }, [user, navigate]);
console.log(user?.is_individual,'hello')


  useEffect(() => {

    const loadPortfolios = async () => {
      try {
        const data = await fetchPortfolios();
        setPortfolios(data);
      } catch (error) {
        console.error('Failed to load portfolios', error);
      }
    };

    loadPortfolios();
  }, [portfolioDetails]);
  const fetchProjects = async () => {
    if (user === null) return; // Ensure user is available before proceeding

    try {
      setLoading(true);
      const id = user?.is_individual ? portfolios[0]?.id : portfolioId;
      
      if (id) {
        const fetchedProjects = await fetchProjectsByPortfolioId(id);
        setProjects(fetchedProjects);
      }
    } catch (err) {
      setError('Failed to fetch projects.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {  

  
    fetchProjects();
  }, [user, portfolios]); // Added `user` to dependencies
  


  // useEffect(() => {
  //   const fetchProjects = async () => {
  //     try {
  //       setLoading(true);
  //       if (portfolios[0]?.id) {
  //         // Call fetchProjectsByPortfolioId with the first portfolio's ID
  //         const fetchedProjects = await fetchProjectsByPortfolioId(portfolios[0]?.id);
  //         setProjects(fetchedProjects);
  //       }
  //     } catch (err) {
  //       setError('Failed to fetch projects.');
  //       console.error(err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   // Only fetch projects if portfolios[0]?.id exists
  //   fetchProjects();

  // }, [portfolios]); // Dependency array ensures the effect re-runs when portfolios changes


  useEffect(() => {
    const getCurrentRole = async () => {
      try {
        const role = await getUserRole(selectedProject, selectedPortfolio);
        setMyRole(role);
      } catch (error) {
        console.error('Failed to load portfolios', error);
      }
    }
    getCurrentRole()
  })

  const handleAddProject = async () => {
    const errors = {
      title: !newProjectTitle ? 'Title is required.' : '',
      description: !newProjectDescription ? 'Description is required.' : '',
      domain: !newProjectDomain ? 'Domain is required.' : '',
      platforms: newProjectPlatforms.length === 0 ? 'At least one platform is required.' : '',
      // credits: newProjectCredits <= 0 ? 'Credits should be greater than 0.' : '',
    };

    setValidationErrors(errors);

    const hasErrors = Object.values(errors).some((error) => error !== '');

    if (hasErrors) {
      toast.current?.show({ severity: 'warn', summary: 'Please fill in all required fields.', detail: 'We need these details to tune our model based on your project requirements.' });
      return;
    }

    const id = user?.is_individual ? portfolios[0]?.id : portfolioId;

    const newProject = {
      name: newProjectTitle,
      totalUserStories: 0,
      overall_status: 'new',
      domain: newProjectDomain,
      platform: newProjectPlatforms,
      credits: 100,
      // credits: newProjectCredits,
      portfolio_id: id as string,
      description: newProjectDescription,
    };
    

    try {
      await addProject(newProject);
      toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Project added successfully!' });

      // Clear input fields
      setNewProjectTitle('');
      setNewProjectDescription('');
      setNewProjectDomain(null);
      setNewProjectPlatforms([]);
      setNewProjectCredits(0);
      setIsModalVisible(false);

      // Refetch the projects to get the updated list
      fetchProjects();
    } catch (err) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to add project.' });
      console.error(err);
    }
  };

  // const fetchProjects = async () => {
  //   try {
  //     setLoading(true);
  //     if (portfolios[0]?.id) {
  //       // Call fetchProjectsByPortfolioId with the first portfolio's ID
  //       const fetchedProjects = await fetchProjectsByPortfolioId(portfolios[0]?.id);
  //       setProjects(fetchedProjects);
  //     }
  //   } catch (err) {
  //     setError('Failed to fetch projects.');
  //     console.error(err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleProjectClick = (project: Project) => {
    const proj = {
      name: project.name,
      description: project.description,
      id: project.id,
    };
    setData({
      ...data,
      projectDetails: proj,
    });
    navigate('/dashboard');
  };

  const handleInvite = async () => {
    if (!inviteData.email) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Please provide an email and select an invite type.', life: 3000 });
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
        true,
      );
      toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Invite sent successfully!', life: 3000 });
      setAddMemberDialog(false);
    } catch (error) {
      console.error('Error registering user:', error);
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to register user. Please try again.', life: 3000 });
    } finally {
      setLoading(false); // Stop loading spinner
    }
    setAddMemberDialog(false)
    setInviteData({
      email: "",
      portfolio_id: selectedPortfolio,
      project_id: selectedProject,
      type: "",
      read_write_access: true
    })
  };

  const handleInviteDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInviteData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCustomDomainEntry = () => {
    if (customDomainValue.trim() !== "") {
      setNewProjectDomain(customDomainValue);
      setCustomDomainValue(""); // Reset input
      setIsCustomDomainFieldVisible(false); // Hide input after adding
    }
  };

  const handleCustomPlatformEntry = () => {
    if (customPlatformValue.trim() !== "") {
      setNewProjectPlatforms([...newProjectPlatforms, customPlatformValue]);
      setCustomPlatformValue(""); // Reset input
      setIsCustomPlatformFieldVisible(false); // Hide input after adding
    }
  };

  const handleAccessLevelChange = (access: boolean) => {
    setInviteData((prevData) => ({
      ...prevData,
      read_write_access: access,
    }));
  };

  const handleCancelAddMember = () => {
    setAddMemberDialog(false)
    setInviteData({
      email: "",
      portfolio_id: selectedPortfolio,
      project_id: selectedProject,
      type: "",
      read_write_access: true
    })
  }

  return (
    <div className="bg-[#f1f1f1] min-h-screen mx-auto">
      <Toast ref={toast} />
      <div className="App">
        <div>
        <div className={`flex ${window.innerWidth < 768 ? 'justify-center' : 'justify-end'} items-center w-full p-4`}>
            {/* <h1 className="text-2xl font-bold mb-4"><span style={{ color: "#f16729" }}>{portfolioDetails.name} </span>Projects</h1> */}
            {myRole && myRole === 'user' || myRole === 'read write user' || myRole === 'read only user' ? null : (
              <div className='flex gap-6'>
                <Avatars project_id='' portfolio_id={portfolioId} />
                {!user?.is_individual && user && (
                  <Button size="small" label={loading ? 'Sending Invite...' : 'Add Members'} icon="pi pi-plus" style={{ backgroundColor: '#1E3A8A', color: 'white' }}
                    onClick={() => setAddMemberDialog(true)} />
                )}
              </div>
            )}
          </div>
          {loading && (<div className="flex justify-center items-center">
            <Lottie options={loadingOptions} height={150} width={150} />
          </div>)}
          {/* {!loading && error && <p className="p-error">{error}</p>} */}
          {!loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 p-6">
              {projects.filter((project) => project.name !== "Default Project").map((project) => (
                <div
                  key={project.id}
                  className="group relative transform transition-all duration-300 ease-in-out hover:scale-105 bg-white bg-opacity-80 backdrop-blur-lg border border-red-200 rounded-3xl shadow-lg hover:shadow-2xl overflow-hidden cursor-pointer"
                  onClick={() => handleProjectClick(project)}
                >
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-red-100 opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>

                  {/* Project Content */}
                  <div className="relative p-6">
                    <h5 className="text-xl font-extrabold text-gray-800 group-hover:text-red-600 transition-colors">
                      {project.name.length > 40 ? `${project.name.substring(0, 40)}...` : project.name}
                    </h5>
                    <p className="text-sm text-gray-700 mt-2 group-hover:text-gray-900 transition-colors">
                      {project.description.length > 100 ? `${project.description.substring(0, 100)}...` : project.description}
                    </p>
                  </div>

                  {/* Animated Line */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500 group-hover:h-1 transition-all duration-300"></div>
                </div>
              ))}

              {/* Add Project Card */}
              {!(myRole && (myRole === 'user' || myRole === 'read write user' || myRole === 'read only user')) && (
                <div
                  className="relative transform transition-all duration-300 ease-in-out hover:scale-105 bg-white bg-opacity-80 backdrop-blur-lg border border-dashed border-gray-300 rounded-3xl shadow-md hover:shadow-xl p-6 flex flex-col items-center justify-center cursor-pointer overflow-hidden"
                  onClick={() => setIsModalVisible(true)}
                >
                  {/* Floating Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-transparent to-gray-50 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Plus Icon */}
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 text-red-600 rounded-full shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-3xl font-bold flex items-center justify-center h-full">+</span>
                  </div>

                  {/* Add Text */}
                  <h5 className="text-lg font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                    Add New Project
                  </h5>
                </div>
              )}
            </div>
          )}

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
                <h3 className="text-2xl font-semibold text-gray-900">Add New Project</h3>
              </div>

              {/* Form Content */}
              <div className="p-fluid space-y-6">
                <div className="field">
                  <label className="block text-sm font-medium text-gray-500">Project Title</label>
                  <InputText
                    value={newProjectTitle}
                    onChange={(e) => setNewProjectTitle(e.target.value)}
                    placeholder="Enter project title..."
                    className={`w-full mt-1 ${validationErrors.title && 'p-invalid'}`}
                    inputClassName="text-lg font-semibold text-gray-800"
                  />
                  {validationErrors.title && <small className="p-error">{validationErrors.title}</small>}
                </div>

                <div className="field">
                  <label className="block text-sm font-medium text-gray-500">Project Description</label>
                  <InputTextarea
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    placeholder="Describe project..."
                    rows={4}
                    autoResize
                    className={`w-full mt-1 ${validationErrors.description && 'p-invalid'}`}
                    inputClassName="text-lg font-semibold text-gray-800"
                  />
                  {validationErrors.description && <small className="p-error">{validationErrors.description}</small>}
                </div>

                <div className="field">
                  <label className="block text-sm font-medium text-gray-500">Domain</label>
                  <Dropdown
                    value={newProjectDomain}
                    options={[
                      ...domainOptions,
                      { label: "Add Custom Domain...", value: "custom" },
                    ]}
                    onChange={(e) => {
                      if (e.value === "custom") {
                        setIsCustomDomainFieldVisible(true);
                        setNewProjectDomain(null); // Reset selection
                      } else {
                        setNewProjectDomain(e.value);
                        setIsCustomDomainFieldVisible(false);
                      }
                    }}
                    placeholder={newProjectDomain || "Select a domain"}
                    style={{
                      width: "100%",
                      border: "1px solid #D1D5DB",
                      borderRadius: "0.375rem",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                    }}
                    className={`w-full mt-1 ${validationErrors.domain && "p-invalid"}`}
                    panelClassName="shadow-lg"
                  />

                  {/* Show custom input field when 'Add Custom Domain...' is selected */}
                  {isCustomDomainFieldVisible && (
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="text"
                        value={customDomainValue}
                        onChange={(e) => setCustomDomainValue(e.target.value)}
                        placeholder="Type your custom domain"
                        style={{
                          flex: "1",
                          padding: "0.5rem",
                          border: "1px solid #D1D5DB",
                          borderRadius: "0.375rem",
                        }}
                      />
                      <button
                        onClick={handleCustomDomainEntry}
                        style={{ backgroundColor: "#BA0000", color: "white" }}
                        className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-green-600 focus:outline-none"
                        title="Save custom domain"
                      >
                        Add
                      </button>
                    </div>
                  )}
                  {validationErrors.domain && <small className="p-error">{validationErrors.domain}</small>}
                </div>

                <div className="field">
                  <div style={{ width: "100%" }}>
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      htmlFor="platforms"
                    >
                      Platforms
                    </label>
                    <MultiSelect
                      id="platforms"
                      value={newProjectPlatforms}
                      options={[
                        ...platformOptions,
                        { label: "Add Custom Platform...", value: "custom" },
                      ]}
                      onChange={(e) => {
                        if (e.value.includes("custom")) {
                          setIsCustomPlatformFieldVisible(true);
                          setNewProjectPlatforms(
                            e.value.filter((v) => v !== "custom"),
                          ); // Remove "custom" from selection
                        } else {
                          setNewProjectPlatforms(e.value);
                        }
                      }}
                      placeholder={
                        newProjectPlatforms.length > 0
                          ? newProjectPlatforms.join(", ")
                          : "Select platforms..."
                      }
                      className={`w-full mt-1 ${validationErrors.platforms && "p-invalid"}`}
                      display="chip"
                      style={{
                        width: "100%",
                        border: "1px solid #D1D5DB",
                        borderRadius: "0.375rem",
                        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                      }}
                      panelClassName="shadow-lg"
                    />

                    {/* Show custom input field when 'Add Custom Platform...' is selected */}
                    {isCustomPlatformFieldVisible && (
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          type="text"
                          value={customPlatformValue}
                          onChange={(e) => setCustomPlatformValue(e.target.value)}
                          placeholder="Type your custom platform"
                          style={{
                            flex: "1",
                            padding: "0.5rem",
                            border: "1px solid #D1D5DB",
                            borderRadius: "0.375rem",
                          }}
                        />
                        <button
                          onClick={handleCustomPlatformEntry}
                          style={{ backgroundColor: "#BA0000", color: "white" }}
                          className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-green-600 focus:outline-none"
                          title="Save custom platform"
                        >
                          Add
                        </button>
                      </div>
                    )}

                    {validationErrors.platforms && (
                      <small className="p-error">
                        {validationErrors.platforms}
                      </small>
                    )}
                  </div>
                </div>

                <div className="flex justify-center mt-8">
                  <button
                    style={{ backgroundColor: "#BA0000", color: "white" }}
                    onClick={handleAddProject}
                    className="text-md p-button-success p-3 w-[20%] bg-red-800 rounded-md text-white"
                  >
                    Save
                  </button>

                </div>
              </div>
            </div>
          </Sidebar>
          <Dialog
            visible={addMemberDialog}
            style={{ width: '100%', maxWidth: '600px' }}  // Ensuring max width but responsive to smaller screens
            header="Invite New Member"
            modal
            onHide={() => setAddMemberDialog(false)}
            className="p-fluid"
          >
            <div className="flex-col">
              <div className='mt-3'>
                <label htmlFor="email" className="p-d-block p-mb-2">Email</label>
                <InputText
                  id="email"
                  name="email"
                  value={inviteData.email}
                  onChange={handleInviteDataChange}
                  placeholder="Enter email"
                  className="p-inputtext p-component"
                  style={{ width: '100%' }}
                />
              </div>

              <div className='mt-3'>
                <label htmlFor="portfolio_id" className="p-d-block p-mb-2">Select Portfolio</label>
                <Dropdown
                  id="portfolio_id"
                  name="portfolio_id"
                  value={inviteData.portfolio_id}
                  options={[{ label: 'Select Portfolio', value: '' }, ...portfolios.map((p) => ({ label: p.name, value: p.id }))]}
                  onChange={e => handleInviteDataChange(e)}
                  placeholder="Select Portfolio"
                  className="p-dropdown p-component"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* Footer buttons */}
            <div className="w-full flex justify-center gap-10 mt-5">
              <Button
                label="Cancel"
                icon="pi pi-times"
                onClick={() => handleCancelAddMember()}
                style={{ backgroundColor: '#A6AEBF', color: 'white', width: "150px" }}
                size="small"
              />
              <Button
                label={loading ? 'Sending Invite...' : 'Invite'}
                icon="pi pi-check"
                onClick={() => handleInvite()}
                style={{ backgroundColor: '#1E3A8A', color: 'white', width: "150px" }}
                size='small'
              />
            </div>
          </Dialog>
        </div>
      </div>
    </div >
  );
};

export default Projects;
