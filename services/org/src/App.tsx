// src/ProjectDashboard.tsx
import './App.css';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AmbiguityApp from 'ambiguity/Ambiguity';
import MindMaps from 'mindmaps/mindmaps';
import TestScenarios from 'testscenarios/TestScenario';
import BreadcrumbComponent from './components/BreadCrumb';
import { getUser, getPortfolio, getProject, getProjectMetrics, fetchProjectsByPortfolioId, getUserRole, registerUser } from './pages/services/service';
import { AppContext } from './routing/appContext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { RadioButton } from 'primereact/radiobutton';
import Avatars from './components/Avatars/avatars';
import { InputOtp } from 'primereact/inputotp';
import { Tooltip } from 'primereact/tooltip';
import Tutorial from './components/Tutorial/Tutorial';
import Table from './components/Table/table';
import SideNav from './components/SideBar/Index';
import { useAuth } from './hooks/useAuth';
import Disclaimer from './components/Disclaimer';

interface Project {
  id: number;
  name: string;
  description: string;
}


interface ProjectDetails {
  id: string;
  name: string;
  description?: string;
}

interface PortfolioDetails {
  id: string;
  name: string;
  projectCount?: number;
}

interface Metrics {
  total_user_stories: number;
  total_ambiguities: number;
  total_test_scenarios: number;
  total_mind_maps: number;
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


const ProjectDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('AppContext must be used within an AppProvider');
  }
  const { data, setData } = context;
  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(
    data?.projectDetails
  );
  const [portfolioDetails, setPortfolioDetails] = useState<PortfolioDetails | null>(
    data?.portfolioDetails
  );
  const [projectMetrics, setProjectMetrics] = useState<Metrics | null>(null);
  const localStorageData = localStorage.getItem('appData');
  const appData = localStorageData ? JSON.parse(localStorageData) : {};
  const [appName, setAppname] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>(data?.portfolioDetails.id);
  const [selectedProject, setSelectedProject] = useState<string>(data?.projectDetails.id);
  const [inviteData, setInviteData] = useState<InviteData>({
    email: "",
    portfolio_id: selectedPortfolio,
    project_id: selectedProject,
    type: "",
    read_write_access: true
  });
  const [myRole, setMyRole] = useState<string>("");
  const [addMemberDialog, setAddMemberDialog] = useState<boolean>(false);
  const toast = useRef(null);
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [navigated, setNavigated] = useState(false);
  const [tutorialRun, setTutorialRun] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(false);

  // const [chartOptions, setChartOptions] = useState({});
  // const [chartSeries, setChartSeries] = useState([]);

  const isProjectEmpty = (project: Partial<ProjectDetails>): boolean => {
    // Check if all fields are empty or falsy
    return !project.id?.trim() && !project.name?.trim() && !project.description?.trim();
  };

  const isAppDataEmpty = (appData: any) => {
    return (
      Object.keys(appData.projectDetails || {}).length === 0 &&
      Object.keys(appData.portfolioDetails || {}).length === 0 &&
      Object.keys(appData.appName || {}).length === 0
    );
  };

  const fetchUser = async () => {
    const fetchedUser = await getUser(); // Fetch user data
    setUser(fetchedUser); // Set user in state
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    // Set tutorial run 2 to true when total_user_stories is exactly 1
    if (projectMetrics?.total_user_stories === 1) {
      setTutorialRun(true);
    }
  }, [projectMetrics]);

  // useEffect(() => {
  //   if (projectMetrics) {
  //     setChartOptions({
  //       chart: {
  //         type: 'radar',
  //         toolbar: {
  //           show: false
  //         }
  //       },
  //       labels: ['Kill Ambiguity', 'Mind Maps', 'Test Scenarios'],
  //       plotOptions: {
  //         radar: {
  //           size: 130,
  //           polygons: {
  //             strokeColors: '#e8e8e8',
  //             fill: {
  //               colors: ['#f8f8f8', '#fff']
  //             }
  //           }
  //         }
  //       },
  //       markers: {
  //         size: 4,
  //         colors: ['#fff'],
  //         strokeColors: ['#FF4560'],
  //         strokeWidth: 2
  //       },
  //       yaxis: {
  //         show: false
  //       },
  //       fill: {
  //         opacity: 0.3
  //       },
  //       colors: ['#FF4560']
  //     });

  //     setChartSeries([{
  //       name: 'Metrics',
  //       data: [
  //         projectMetrics.total_ambiguities || 0,
  //         projectMetrics.total_mind_maps || 0,
  //         projectMetrics.total_test_scenarios || 0
  //       ]
  //     }]);
  //   }
  // }, [projectMetrics]);

  // console.log(tutorialRun,'hello')


  // useEffect(() => {
  //   if (projects && projects.length === 1) {
  //     navigate("/dashboard/project");
  //   }
  // }, [projects, navigate]);

  // useEffect(() => {
  //   // Check if the user has already been navigated to /dashboard/project

  // }, [navigate]);

  // useEffect(() => {
  //   const timeout = setTimeout(() => {
  //     if (!sessionStorage.getItem("hasNavigatedToProject")) {
  //       navigate("/dashboard/project");
  //       sessionStorage.setItem("hasNavigatedToProject", "true");
  //     }
  //   }, 0);

  //   return () => clearTimeout(timeout);
  // }, [navigate]);


  useEffect(() => {


    const fetchProjects = async () => {
      try {
        setLoading(true);
        if (portfolioDetails) {
          const fetchedProjects = await fetchProjectsByPortfolioId(portfolioDetails.id);
          setProjects(fetchedProjects);
        }
      } catch (err) {
        setError('Failed to fetch projects.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [portfolioDetails]);


  useEffect(() => {
    if (isProjectEmpty(projectDetails)) {
      if (isAppDataEmpty(appData)) {
        // If appData is empty, fetch it from the API
        getUser()
          .then(response => {
            const { default_project_id, default_portfolio_id } = response || {};
            if (default_project_id && default_portfolio_id) {
              return Promise.all([
                getProject(default_project_id),
                getPortfolio(default_portfolio_id)
              ]);
            }
            return [null, null]; // Fallback
          })
          .then(([projectData, portfolioData]) => {
            if (projectData && portfolioData) {
              const fetchedAppData = {
                projectDetails: {
                  id: projectData._id,
                  name: projectData.name,
                  description: projectData.description || ''
                },
                portfolioDetails: {
                  id: portfolioData._id,
                  name: portfolioData.name,
                  projectCount: portfolioData.projectCount || 0
                },
                appName: {} // Add appName if necessary
              };

              // Store the fetched data in localStorage
              localStorage.setItem('appData', JSON.stringify(fetchedAppData));

              // Set the state with the fetched data
              setProjectDetails(fetchedAppData.projectDetails);
              setPortfolioDetails(fetchedAppData.portfolioDetails);

              // Update context if not coming from breadcrumb
              setData(prev => ({
                ...prev,
                projectDetails: fetchedAppData.projectDetails,
                portfolioDetails: fetchedAppData.portfolioDetails,
              }));
            }
          })
          .catch(err => {
            console.error("Failed to fetch user/project/portfolio data", err);
          });
      } else {
        // If appData exists and is not empty, use it
        setProjectDetails(appData.projectDetails);
        setPortfolioDetails(appData.portfolioDetails);
      }
    }
  }, [data, setData]);

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
  }, [])


  useEffect(() => {
    if (projectDetails) {
      getProjectMetrics(projectDetails.id).then(metricsData => {
        if (metricsData) {
          setProjectMetrics(metricsData)
        }
      })
    }
  }, [projectDetails])

  const handleTutorialFinish = () => {
    console.log('Tutorial has finished or was skipped');
    setTutorialRun(false); // Optionally reset state when tutorial finishes
  };
  const tutorialSteps = [
    // {
    //   target: ".requirements-card",
    //   content: "Your Entered User Story will appear here",
    //   placement: "bottom",
    // },
    {
      target: ".application-selection",
      content: "Select any of the available application to start interacting with your user story",
      placement: "top"
    }
  ]

  const handleNavigation = (path: string) => {
    navigate(path, { state: projectDetails });
  };

  const handleInviteDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInviteData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAccessLevelChange = (access: boolean) => {
    setInviteData((prevData) => ({
      ...prevData,
      read_write_access: access,
    }));
  };

  const invite_type = [
    { label: 'Project', value: 'project' },
    { label: 'User', value: 'user' },
  ];

  const handleInvite = async () => {
    if (!inviteData.email || !inviteData.type) {
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
        portfolioDetails.id,
        projectDetails.id,
        inviteData.type,
        inviteData.read_write_access
      );
      console.log('Registration successful:', result);
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

  const [isLogoutVisible, setIsLogOutVisible] = useState(false);
  const { logout } = useAuth();
  const handleLogout = () => {
    sessionStorage.clear();
    logout();
    setIsLogOutVisible(false);
    navigate("/");
  };


  return (
    <div className='bg-[#f1f1f1] min-h-screen'>

      <div className="px-6 bg-[#f1f1f1] relative">
        <div className="container mx-auto pt-1">
          <Table projectDetails={projectDetails} projectMetrics={projectMetrics} />
          {window.innerWidth < 768 && (
            <>
            <div className='flex justify-end items-center py-[15px]'>
              <button
                onClick={() => setIsLogOutVisible(true)}
                className="ml-auto w-12 h-12 flex items-center justify-center rounded-full bg-gray-200 text-black shadow-md hover:bg-[#BA0000] hover:text-white transition-all duration-300 active:scale-90"
              >
                <i className="pi pi-sign-out text-xl" />
              </button>



            </div>
            <Dialog
              visible={isLogoutVisible}
              onHide={() => setIsLogOutVisible(false)}
              header="Confirm Logout"
              className="w-full max-w-xs sm:max-w-sm md:max-w-md rounded-lg"
              footer={
                <div className="flex items-center justify-end gap-3">
                  <Button
                    label="Cancel"
                    onClick={() => setIsLogOutVisible(false)}
                    className="p-button-text text-gray-600 hover:text-gray-800"
                    size="small"
                  />
                  <Button
                    label="Logout"
                    onClick={handleLogout}
                    className="p-button-danger bg-red-500 hover:bg-red-600 text-white"
                    size="small"
                  />
                </div>
              }
            >
              <p className="text-gray-700 text-center text-sm sm:text-base">
                Are you sure you want to log out?
              </p>
            </Dialog>

          </>
          )}
        </div>

        {/* <div className='mt-6'></div> */}



        <Toast ref={toast} />
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
              <label htmlFor="type" className="p-d-block p-mb-2">Invite Type</label>
              <Dropdown
                id="type"
                name="type"
                value={inviteData.type}
                options={invite_type}
                onChange={handleInviteDataChange}
                placeholder="Select Invite Type"
                className="p-dropdown p-component"
                style={{ width: '100%' }}
              />
            </div>

            {inviteData.type === 'user' && (
              <div className='mt-3'>
                <div className="flex justify-start gap-5">
                  <div>
                    <RadioButton
                      name="accessLevel"
                      value={false}
                      checked={!inviteData.read_write_access}
                      onChange={() => handleAccessLevelChange(false)}
                      inputId="readOnly"
                    />
                    <label htmlFor="readOnly" className="p-ml-2">Read Only</label>
                  </div>
                  <div>
                    <RadioButton
                      name="accessLevel"
                      value={true}
                      checked={inviteData.read_write_access}
                      onChange={() => handleAccessLevelChange(true)}
                      inputId="readWrite"
                    />
                    <label htmlFor="readWrite" className="p-ml-2">Read Write</label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer buttons */}
          <div className="w-full flex justify-center gap-24 mt-5">
            <Button
              label="Cancel"
              icon="pi pi-times"
              onClick={() => handleCancelAddMember()}
              style={{ backgroundColor: '#A6AEBF', width: "150px" }}
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
      {/* <Disclaimer /> */}
    </div>
  );
};

export default ProjectDashboard;
