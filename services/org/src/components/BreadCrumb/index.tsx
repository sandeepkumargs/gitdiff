import React, { useContext, useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { BreadCrumb } from "primereact/breadcrumb";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import Invite from "../Invite";
import DataSourceButton from "../data-source";
import { AppContext, useAppContext } from "../../routing/appContext";
import { FileUpload } from "primereact/fileupload";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Stepper } from "primereact/stepper";
import { StepperPanel } from "primereact/stepperpanel";
import Tutorial from "../Tutorial/Tutorial";
import Tippy from '@tippyjs/react';

const BASE_URL = process.env.BASE_URL

import {
  uploadExcel,
  fetchDataByProjectId,
  getUser,
  fetchProjectsByPortfolioId,
  fetchPortfolios,
  getProjectMetrics,
  getProject,
  getAllInvites,
  acceptInvite,
  getUserStories,
  exportToJira,
} from "../../pages/services/service";
import { Toast } from "primereact/toast";
import ExcelTemplate from "../DownloadExcel/ExcelTemplate";
import { Tabs, Tab, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import "./BreadcrumbComponent.css";
import { addUserStory } from "../../pages/services/service";
import { Sidebar } from "primereact/sidebar";
import { OverlayPanel } from "primereact/overlaypanel";
import { Badge } from "primereact/badge";
import { confirmDialog } from "primereact/confirmdialog";

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

interface Metrics {
  total_user_stories: number;
  total_ambiguities: number;
  total_test_scenarios: number;
  total_mind_maps: number;
}

interface BreadcrumbItem {
  label: string;
  url?: string;
}

interface User {
  verified: boolean;
  is_individual: boolean;
  default_portfolio_id: string;
}

interface UserStoryData {
  _id: string;
  context: string;
  story: string;
  status: string;
  ambiguities: {};
  refined_story: string;
  acceptance_criteria: string[];
  assumptions: string[];
  test_scenarios: {};
  process_status: {
      ambiguity_checker: string;
      mind_maps: string;
      test_scenarios: string;
  };
  mindmaps: [];
  source: string;
  project_id: string;
  ac_index: number;
}


type ShowToast = (options: {
  severity?: 'success' | 'info' | 'warn' | 'error';
  summary?: string;
  detail?: string;
  life?: number;
}) => void;

type Props = {
  showModal: boolean;
  setShowModal: (v: boolean) => void;
  // refreshData: boolean;
  // setRefreshData: (v: boolean) => void;
  showToast: ShowToast;                       // new prop
};

const BreadcrumbComponent: React.FC<Props> = ({
  showModal,
  setShowModal,
  // refreshData,
  // setRefreshData,
  showToast,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { data, setData } = useContext(AppContext);
  const [user, setUser] = useState<User | null>(null);
  // const [showModal, setShowModal] = useState(false);
  const [invites, setInvites] = useState<any[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [confirmAction, setConfirmAction] = useState<{ id: string; type: 'accept' | 'reject' } | null>(null);
  const op = useRef(null);
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const stepperRef = useRef(null);
  const toast = useRef<Toast>(null);
  const projectId = data.projectDetails?.id || "";
  const [appname, setAppname] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showExcelTemplateDialog, setShowExcelTemplateDialog] = useState(false);
  const [userStoryError, setUserStoryError] = useState<string>("");
  const [userStory, setUserStory] = useState<string>("");
  const [context, setContext] = useState<string>("");
  const [ac, setAC] = useState<string>("");
  const [items, setItems] = useState<string[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [projectMetrics, setProjectMetrics] = useState<Metrics | null>(null);
  const [totalMetrics, setTotalMetrics] = useState<number>(0);
  const [tutorialRun, setTutorialRun] = useState(false);
  const {refreshData, setRefreshData} = useAppContext();
  const [userStories, setUserStories] = useState<UserStoryData[]>([]);
  const [existingStories, setExistingStories] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingStory, setPendingStory] = useState(null);

  const getAppname = (path: string) => {
    switch (path) {
      case "/dashboard":
        return "Home";
      case "/dashboard/ac/table":
        return "Kill Ambiguity";
      case "/dashboard/mm/table":
        return "Mind Maps";
      case "/dashboard/ts/table":
        return "Test Scenarios";
      default:
        return null;
    }
  };

  const portfolioDetails = data?.portfolioDetails;
  // console.log(portfolioDetails, projectId);

  const tutorialSteps = [
    {
      target: ".data-source-btn",
      content: "Try Adding your User Stories Here",
      placement: "bottom",
    },
  ];

  const fetchData = async () => {
    try {
        const data = await getUserStories(projectId);
        if (data == null) {
            setUserStories([]);
        } else {
            setUserStories(data);
            setExistingStories(userStories.map((story) => story.story));
        }
        setError(null);
    } catch (err) {
        console.error("Error fetching user stories:", err);
        setError("Error fetching data. Retrying...");
    } finally {
        setLoading(false);
    }
};
  

  useEffect(() => {
    const name = getAppname(location.pathname);
    if (name) {
      setAppname(name);
      localStorage.setItem("selectedDropdownItem", name);
    }

    const fetchUser = async () => {
      const fetchedUser = await getUser();
      setUser(fetchedUser);
    };

    const fetchProjects = async () => {
      try {
        if (portfolioDetails) {
          const fetchedProjects = await fetchProjectsByPortfolioId(
            portfolioDetails.id,
          );
          setProjects(fetchedProjects);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchUser();
    fetchProjects();
  }, [location.pathname]);

  useEffect(() => {
      if (projects) {
        getProjectMetrics(data?.projectDetails?.id).then(metricsData => {
          if (metricsData) {
            setProjectMetrics(metricsData)
          }
        })
      }
    }, [data?.projectDetails?.id,projects])

    useEffect(() => {
      if (projectMetrics) {
        const total =
          (projectMetrics.total_user_stories || 0) +
          (projectMetrics.total_ambiguities || 0) +
          (projectMetrics.total_test_scenarios || 0) +
          (projectMetrics.total_mind_maps || 0);
        setTotalMetrics(total);
        if (total === 0) {
          setTutorialRun(true);
        }
      }
    }, [projectMetrics]);

    useEffect(() => {
      const name = getAppname(location.pathname);
      if (name) {
        setAppname(name); // Set appname if found from getAppname
        localStorage.setItem("selectedDropdownItem", name); // Store in localStorage
      } else {
        // If appname is not found from getAppname, use the fallback useEffect
        setAppname(""); // Or set any default value here
      }
  
      // Fetch user data
      const fetchUser = async () => {
        const fetchedUser = await getUser();
        setUser(fetchedUser);
      };
  
      // Fetch projects based on portfolioDetails (assuming it's passed)
      const fetchProjects = async () => {
        try {
          if (portfolioDetails) {
            const fetchedProjects = await fetchProjectsByPortfolioId(
              portfolioDetails.id,
            );
            setProjects(fetchedProjects);
          }
        } catch (err) {
          console.error(err);
        }
      };
  
      fetchUser();
      fetchProjects();
    }, [location.pathname]); // Run this effect on location.pathname change
  
    // Second useEffect to handle fallback setting of appname if it's not set already
    useEffect(() => {
      if (!appname) {
        // Set appname if it is not set by getAppname function
        if (location.pathname === "/dashboard/ac/checker" || location.pathname === "/dashboard/ac/table") {
          setAppname("Kill Ambiguity");
        } else if (location.pathname === "/dashboard/mm/viewer" || location.pathname === "/dashboard/mm/table") {
          setAppname("Mind Maps");
        } else if (location.pathname === "/dashboard/ts/generator" || location.pathname === "/dashboard/ts/table") {
          setAppname("Test Scenarios");
        } else {
          setAppname(""); // Default if no match
        }
      }
    }, [location.pathname, appname]);
    
    useEffect(() => {
      const fetchInvites = async () => {
        const response = await getAllInvites(); // Assuming getAllInvites is a function that returns the invites array
        setInvites(response);
  
        const pendingInvites = response.filter(invite => invite?.status === 'Pending');
        setPendingCount(pendingInvites?.length); // Set the count of pending invites
      };
  
      fetchInvites();
    }, []);
    
    const handleExport = async () => {
      try {
        setLoading(true);
        console.log("Starting Jira export for project:", projectId);
    
        const result = await exportToJira(projectId);
    
        toast.current?.show({
          severity: 'success',
          summary: 'Export Successful',
          detail: `Exported ${result.results.created + result.results.updated} stories to Jira`,
          life: 5000,
        });
    
        console.log("Export result:", result);
      } catch (error: any) {
        console.error("Error exporting to Jira:", error);
        toast.current?.show({
          severity: 'error',
          summary: 'Export Failed',
          detail: error?.message || 'Failed to export to Jira',
          life: 5000,
        });
      } finally {
        setLoading(false);
      }
    };

    const handleAcceptInvite = async (inviteId: string) => {
      try {
        // Call the acceptInvite function from the service
        const result = await acceptInvite(inviteId);
        console.log(result);  // Do something with the result if necessary
  
        // Remove the accepted invite from the list
        setInvites((prevInvites) => prevInvites.filter(invite => invite?._id !== inviteId));
        setPendingCount((prevCount) => prevCount - 1);  // Update pending count
      } catch (error) {
        console.error('Error accepting invite:', error);
        // Handle the error (maybe show a toast notification)
      }
    };
  
    const handleRejectInvite = (inviteId: string) => {
      // Handle the invite reject logic here
      setInvites(prevInvites => prevInvites.filter(invite => invite?._id !== inviteId));
      setPendingCount(prevCount => prevCount - 1);
    };
  
    const handleConfirmAction = () => {
      if (confirmAction?.type === 'accept') {
        handleAcceptInvite(confirmAction.id);
      } else if (confirmAction?.type === 'reject') {
        handleRejectInvite(confirmAction.id);
      }
      setConfirmAction(null); // Reset confirmation state
    };

  const breadcrumbItems = [
    ...(user?.is_individual || window.innerWidth < 768
      ? []
      : [
          {
            label: (
              <span className={window.innerWidth < 768 ? "text-xs" : "text-sm"}>
                {/* {data.portfolioDetails?.name || portfolioDetails?.name} */}
                Portfolio
              </span>
            ),
            url: "/dashboard/portfolio",
            className:
              location.pathname === "/dashboard/portfolio"
                ? "text-blue-500 font-bold"
                : "",
            command: () =>
              navigate("/dashboard/portfolio", { state: { portfolioDetails } }),
          },
        ]),
    {
      label: (<span className={window.innerWidth < 768 ? "text-xs" : "text-sm"}>Projects</span>),
      url: "/dashboard/project",
      className:
        location.pathname === "/dashboard/project"
          ? "text-blue-500 font-bold"
          : "",
      command: () =>
        navigate("/dashboard/project", {
          state: { portfolioDetails: data.portfolioDetails },
        }),
    },
    ...(location.pathname !== "/dashboard/project"
      ? [
          {
            label: (
              <Tippy
  interactive
  placement="top"
  content={
    <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 max-w-[1800px]">
      <h3 className="font-semibold text-sm text-gray-800 mb-2">
        {/* {data?.projectDetails?.name} */}
        Project Description
      </h3>
      <p className="text-gray-600 text-xs break-words">
        {data?.projectDetails?.description}
      </p>
    </div>
  }
>
  <span className={`cursor-pointer ${window.innerWidth < 768 ? "text-xs" : "text-sm"}`}>
    {window.innerWidth < 768
      ? data?.projectDetails?.name?.substring(0, 10) + "..."
      : data?.projectDetails?.name?.length > 40
        ? data?.projectDetails?.name?.substring(0, 40) + "..."
        : data?.projectDetails?.name}
  </span>
</Tippy>
            ) 
          },
        ]
      : []),
    {
      label: location.pathname === "/dashboard" ? null : <span className={window.innerWidth < 768 ? "text-xs" : "text-sm"}>{appname}</span>,
      className:
        location.pathname === "/dashboard" ||
        location.pathname === "/dashboard/ac/table" ||
        location.pathname === "/dashboard/mm/table" ||
        location.pathname === "/dashboard/mm/viewer" ||
        location.pathname === "/dashboard/ts/table" ||
        location.pathname === "/dashboard/ts/generator" ||
        location.pathname === "/dashboard/ac/checker"
          ? "text-blue-500 font-extrabold"
          : "",
      // command: appname === "Home" ? undefined : () => navigate(-1),
    },
  ].filter((item) => item.label).filter(item => location.pathname !== "/dashboard/portfolio");;
  
const onUpload = async (event: any) => {
  const file = event.files[0];
  if (file && projectId) {
    try {
      const result = await uploadExcel(file, projectId);
      console.log("File uploaded successfully:", result);
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "File uploaded successfully!",
        life: 3000,
      });
      setShowModal(false);
      setRefreshData(true);
      sessionStorage.setItem("refresh", "true");
      // window.location.reload();
    } catch (error) {
      console.error("Upload failed:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to upload the file. Please try again.",
        life: 3000,
      });
    }
  } else {
    console.error("No file selected or project ID missing");
    toast.current?.show({
      severity: "warn",
      summary: "Warning",
      detail: "No file selected or project ID missing.",
      life: 3000,
    });
  }
};

  const validateFields = () => {
    let isValid = true;

    // Validate user story
    if (!userStory.trim()) {
      setUserStoryError("User Story is required");
      isValid = false;
    } else if (userStory.trim().length < 10) {
      setUserStoryError("User Story must be at least 10 characters");
      isValid = false;
    } else {
      setUserStoryError("");
    }

    // Validate context
    // if (!context.trim()) {
    //   setContextError('Context is required');
    //   isValid = false;
    // } else {
    //   setContextError('');
    // }

    return isValid;
  };

      const saveUserStory = async () => {
        if (validateFields()) {
          try {
            const sanitizedUserStory = userStory.replace(/\n/g, " ");
            const sanitizedContext = context.replace(/\n/g, " ");
      
            const newStory = {
              context: sanitizedContext,
              story: sanitizedUserStory,
              project_id: data?.projectDetails.id,
              manual_acceptance_criteria: items,
            };
            await fetchData();
            const response = await addUserStory(newStory, false, existingStories);
      
            // If the API requires confirmation, show the dialog
            if (response.requiresConfirmation) {
              setPendingStory(newStory);
              setShowConfirmDialog(true);
              return;
            }
      
            // Success flow if no confirmation is needed
            handleSuccess();
          } catch (error) {
            handleError(error);
          }
        }
      };

           const handleConfirm = async () => {
              setShowConfirmDialog(false);
              try {
                await addUserStory(pendingStory, true);
                sessionStorage.setItem("refresh", "true");
                setRefreshData(true);
                handleSuccess();
              } catch (error) {
                handleError(error);
              }
            };
            
            const handleSuccess = () => {
              sessionStorage.setItem("refresh", "true");
              setRefreshData(true);
              // window.location.reload(); // fetchData();
              toast.current?.show({
                severity: "success",
                summary: "Success",
                detail: "User Story Added Successfully",
                life: 3000,
              });
              closeDialog();
              resetForm();
            };
            
            const handleError = (error) => {
              console.error("Error saving user story:", error);
              const detailMessage = error.similarTo
                  ? `Your User Story is Similar to: "${error.similarTo}"`
                  : error.message || "Something went wrong while saving the user story.";
          
              toast.current?.show({
                  severity: "error",
                  summary: "Cannot Add Requirement",
                  detail: detailMessage,
                  life: 5000,
              });
          };

            const resetForm = () => {
              setUserStory("");
              setContext("");
              setAC("");
              setItems([]);
            };

            const closeDialog = () => {
              setShowModal(false);
            };
      

  const handleAddItem = () => {
    if (ac.trim()) {
      setItems([...items, ac.trim()]);
      setAC(""); // Clear the input
    }
    console.log(setItems);
  };
  const handleDeleteItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleEditItem = (index: number) => {
    setEditingIndex(index);
    setEditingValue(items[index]);
  };

  const handleSaveEdit = (index: number) => {
    const updatedItems = [...items];
    updatedItems[index] = editingValue;
    setItems(updatedItems);
    setEditingIndex(null);
    setEditingValue("");
  };

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      const data = await fetchDataByProjectId(projectId);
      console.log("Fetched data:", data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false); // Stop the spinner
    }
  };

  const handleTutorialFinish = () => {
    // console.log('Tutorial has finished or was skipped');
    setTutorialRun(false); // Optionally reset state when tutorial finishes
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      <Toast ref={toast} />
{/* <Tutorial steps={tutorialSteps} run={tutorialRun} onFinish={handleTutorialFinish} /> */}
      <div className="flex justify-between items-center">
        <div className="flex items-center">
        <BreadCrumb
  model={breadcrumbItems}
  home={
    location.pathname === "/dashboard/project" || location.pathname === "/dashboard/portfolio"
      ? null // Do not render the home icon
      : {
          icon: "pi pi-home",
          url: "/dashboard",
          command: () =>
            navigate("/dashboard", {
              state: {
                portfolioDetails: data.portfolioDetails,
                fromBreadcrumb: true,
              },
            }),
        }
  }
  className="text-base text-gray-800 my-2"
  style={{ border: "none" }} // Inline CSS to remove border
/>
        </div>
        <div>
          {/* Show Tabs Button */}
          {!['/dashboard/project', '/dashboard/portfolio'].includes(location.pathname) && (
            <>
         {location.pathname === '/dashboard' && (
          <div className="flex justify-end items-center gap-6">
                  {/* {window.innerWidth >= 768 && ( */}
                    <i
                      className="pi pi-bell text-gray-700 text-xl cursor-pointer hover:text-gray-900 transition-colors relative"
                      onClick={(e) => op.current.toggle(e)}
                    >
                      {pendingCount > 0 && (
                        <Badge
                          value={pendingCount}
                          severity="danger"
                          className="absolute bottom-3 left-2 w-6 h-6 text-sm rounded-full flex items-center justify-center"
                        />
                      )}
                    </i>
                  {/* )} */}
      <OverlayPanel ref={op} className="p-6 bg-white rounded-2xl shadow-2xl max-w-lg mx-auto transition-all duration-300 ease-in-out transform">
        <div>
          {invites?.length === 0 ? (
            <p className="text-center text-gray-500 font-semibold">No pending invites.</p>
          ) : (
            invites?.map((invite) =>
              invite?.status === 'Pending' && (
                <div
                  key={invite?._id}
                  className="p-6 mb-6 border border-gray-200 rounded-2xl shadow-lg bg-gradient-to-r from-gray-50 via-gray-100 to-gray-200 hover:from-blue-50 hover:via-blue-100 hover:to-blue-200 transition-all duration-300 transform hover:scale-105"
                >
                  <div className="text-xl font-bold text-gray-800 mb-3">Pending Invite</div>
                  <div className="text-sm text-gray-700 space-y-3">
                    <div>
                      <strong className="text-gray-900">Email:</strong> {invite?.email}
                    </div>
                    <div>
                      <strong className="text-gray-900">Invited By:</strong> {invite?.invited_by}
                    </div>
                    <div>
                      <strong className="text-gray-900">Type:</strong> {invite?.type}
                    </div>
                    <div>
                      <strong className="text-gray-900">Status:</strong>
                      <span className="text-yellow-500 font-semibold">{invite?.status}</span>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-4 mt-4">
                    <Button
                      label="Accept"
                      icon="pi pi-check"
                      className="p-button-success p-button-outlined rounded-xl shadow-xl px-6 py-2 transition-all duration-300 transform hover:scale-105 hover:bg-green-500 hover:text-white focus:ring-4 focus:ring-green-300"
                      onClick={() => handleAcceptInvite(invite?._id)}
                    />
                  </div>
                </div>
              )
            )
          )}
        </div>
      </OverlayPanel>
        <button
          onClick={() => setShowModal(true)}
          style={{ backgroundColor: "#BA0000", color: "white", border: "none", borderRadius: "6px", padding: "0.5rem 0.5rem", cursor: "pointer" }}
          className="data-source-btn transition-all mr-4 ease-in-out"
        >
          {window.innerWidth < 768 ? (
            <span className="text-xs">Data Sources</span>
          ) : (
            <>
              <i className="pi pi-database"></i> <span className="text-xs">Data Sources</span>
            </>
          )}
        </button>
        <button
        onClick={handleExport}
        disabled={loading}
        style={{ 
          backgroundColor: "#BA0000", 
          color: "white", 
          border: "none", 
          borderRadius: "6px", 
          padding: "0.5rem 0.5rem", 
          cursor: "pointer",
          marginRight: "1rem"
        }}
        className="jira-export-btn transition-all ease-in-out"
      >
        {loading ? (
          <>
            <i className="pi pi-spinner pi-spin"></i>
            <span className="text-xs ml-2">Exporting...</span>
          </>
        ) : window.innerWidth < 768 ? (
          <span className="text-xs">Export to Jira</span>
        ) : (
          <>
            <i className="pi pi-upload"></i> <span className="text-xs">Export to Jira</span>
          </>
        )}
      </button>
        </div>
      )}
          {/* Show Download Data Button */}
          {/* <Button
            label="Download Result"
            icon="pi pi-download"
            style={{ backgroundColor: "#1E3A8A", color: "white" }}
            size="small"
            className="hover:bg-indigo-700 transition-all mr-4 ease-in-out"
            onClick={() => setShowDownloadDialog(true)}
            disabled={totalMetrics === 0}

          /> */}
          </>
          )}

          {/* Tabs Modal */}
            <Sidebar
  visible={showModal}
  position="right"
  onHide={() => setShowModal(false)}
  className="p-sidebar-lg"
  style={{
    width: '100%', // Make width responsive
    maxWidth: '750px', // Set a max width for larger screens
    height: '100vh',
    borderTopLeftRadius: '20px',
    borderBottomLeftRadius: '20px',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',  // Adjusted transparency (more transparent)
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
    backdropFilter: 'blur(8px)',
  }}
>
<Dialog
      visible={showConfirmDialog}
      onHide={() => setShowConfirmDialog(false)}
      header="Invalid Format"
      footer={
         <div className='flex items-center gap-4'>
           <Button label="No" icon="pi pi-times" onClick={() => setShowConfirmDialog(false)} className="p-button-text"
                             size='small' />
           <Button label="Yes" icon="pi pi-check" onClick={handleConfirm} autoFocus className="p-button-text"
                             size='small' />
         </div>
      }
    >
      <p>The requirement you entered does not appear to be in a valid format. Would you still like to proceed with adding it?</p>
    </Dialog>
            <Tabs>
              {/* TabList containing all tabs */}
              <TabList className="flex border-b-2 mb-4 gap-4">
                <Tab
                  className="tab-item py-3 px-6 cursor-pointer text-gray-700 hover:bg-red-200 rounded-lg transition-colors duration-200"
                  selectedClassName="bg-[#BA0000] text-white"
                >
                  Add Manual
                </Tab>
                <Tab
                  className="tab-item py-3 px-6 cursor-pointer text-gray-700 hover:bg-red-200 rounded-lg transition-colors duration-200"
                  selectedClassName="bg-[#BA0000] text-white"
                >
                  Jira Import
                </Tab>
                <Tab
                  className="tab-item py-3 px-6 cursor-pointer text-gray-700 hover:bg-red-200 rounded-lg transition-colors duration-200"
                  selectedClassName="bg-[#BA0000] text-white"
                >
                  Upload Excel
                </Tab>
              </TabList>
              <TabPanel>
                <Stepper ref={stepperRef} style={{ flexBasis: "50rem" }}   pt={{
    root: { style: { backgroundColor: 'transparent' } }, // Removes background color from the Stepper container
    stepper: { style: { backgroundColor: 'transparent' } }, // Removes background color from individual steps
    panelContainer: { style: { backgroundColor: 'transparent' } } // Removes background color from the panels
  }}>
                  <StepperPanel header="User Story">
                    <div className="flex flex-col w-full">
                      <label className="text-lg font-semibold text-gray-700 mb-2">
                        User Story
                      </label>
                      <textarea
                        style={{ height: "20rem" }}
                        placeholder="Enter user story here..."
                        value={userStory}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          setUserStory(e.target.value)
                        }
                        className={`w-full p-inputtext p-component border ${
                          userStoryError ? "border-red-500" : "border-gray-300"
                        } focus:ring-2 focus:ring-indigo-500 p-4 h-80 rounded-lg shadow-sm text-gray-700`}
                      />
                      {userStoryError && (
                        <p className="text-red-500 text-sm mt-1">
                          {userStoryError}
                        </p>
                      )}
                    </div>
                    <div className="flex pt-4 justify-end">
                      <Button
                        label="Next"
                        icon="pi pi-arrow-right"
                        iconPos="right"
                        onClick={() => stepperRef.current.nextCallback()}
                      />
                    </div>
                  </StepperPanel>

                  <StepperPanel header="Context">
                    <div className="flex flex-col w-full">
                      <label className="text-lg font-semibold text-gray-700 mb-2">
                        Context
                      </label>
                      <textarea
                        style={{ height: "20rem" }}
                        placeholder="Enter context here..."
                        value={context}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          setContext(e.target.value)
                        }
                        className={`w-full p-inputtext p-component border focus:ring-2 focus:ring-indigo-500 p-4 h-80 rounded-lg shadow-sm text-gray-700`}
                      />
                    </div>
                    <div className="flex justify-between items-center pt-4">
                      <Button
                        label="Back"
                        severity="secondary"
                        icon="pi pi-arrow-left"
                        onClick={() => stepperRef.current.prevCallback()}
                      />
                      <Button
                        label="Next"
                        icon="pi pi-arrow-right"
                        iconPos="right"
                        onClick={() => stepperRef.current.nextCallback()}
                      />
                    </div>
                  </StepperPanel>

                  <StepperPanel header="Acceptance Criteria">
                    <div className="flex flex-col w-full">
                      <label className="text-lg font-semibold text-gray-700 mb-2">
                        Acceptance Criteria
                      </label>
                      <div className="flex w-full mb-2">
                        <input
                          placeholder="Enter Acceptance Criteria here..."
                          value={ac}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setAC(e.target.value)
                          }
                          className="w-full p-inputtext p-component border focus:ring-2 focus:ring-indigo-500 p-4 rounded-l-lg shadow-sm text-gray-700"
                        />
                        <button
                          onClick={handleAddItem}
                          style={{
                            backgroundColor: "#BA0000",
                            fontWeight: "bold",
                          }}
                          className="text-white px-6 py-4 rounded-r-lg shadow border border-[#BA0000]"
                        >
                          Add
                        </button>
                      </div>
                      <div
                        className="overflow-y-auto border p-4 rounded-lg shadow-inner bg-white"
                        style={{ height: "16rem", maxHeight: "16rem" }}
                      >
                        <ul className="list-disc pl-5 space-y-2 text-gray-700">
                          {items.map((item, index) => (
                            <li
                              key={index}
                              className="flex items-center justify-between space-x-4"
                            >
                              {editingIndex === index ? (
                                <div className="flex-grow flex items-center">
                                  <InputText
                                    value={editingValue}
                                    onChange={(e) =>
                                      setEditingValue(e.target.value)
                                    }
                                    className="flex-grow"
                                  />
                                  <Button
                                    icon="pi pi-check"
                                    className="p-button-text text-green-500 ml-2"
                                    onClick={() => handleSaveEdit(index)}
                                    tooltip="Save"
                                  />
                                </div>
                              ) : (
                                <span className="flex-grow">{item}</span>
                              )}
                              <div className="flex space-x-2">
                                <Button
                                  icon="pi pi-pencil"
                                  className="p-button-text text-blue-500"
                                  onClick={() => handleEditItem(index)}
                                  tooltip="Edit"
                                />
                                <Button
                                  icon="pi pi-trash"
                                  className="p-button-text text-red-500"
                                  onClick={() => handleDeleteItem(index)}
                                  tooltip="Delete"
                                />
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-4">
                      <Button
                        label="Back"
                        severity="secondary"
                        icon="pi pi-arrow-left"
                        onClick={() => stepperRef.current.prevCallback()}
                      />
                      <Button
                        label="Next"
                        icon="pi pi-arrow-right"
                        iconPos="right"
                        onClick={() => stepperRef.current.nextCallback()}
                      />
                    </div>
                  </StepperPanel>

                  <StepperPanel header="Overview">
                    <div
                      className="overflow-y-auto border p-4 h-100 rounded-lg shadow-inner bg-white"
                      style={{ height: "22rem", maxHeight: "22rem" }}
                    >
                      {userStory && (
                        <div className="p-4 border rounded-lg bg-white shadow-sm mb-4">
                          <h3 className="text-xl font-semibold text-indigo-700 mb-2">
                            User Story
                          </h3>
                          <p className="text-gray-700">{userStory}</p>
                        </div>
                      )}
                          {userStoryError && (
      <p className="text-red-500 text-sm m-2">{userStoryError}</p>
    )}
                      {context && (
                        <div className="p-4 border rounded-lg bg-white shadow-sm mb-4">
                          <h3 className="text-xl font-semibold text-indigo-700 mb-2">
                            Context
                          </h3>
                          <p className="text-gray-700">{context}</p>
                        </div>
                      )}
                      {items.length > 0 && (
                        <div className="p-4 border rounded-lg bg-white shadow-sm">
                          <h3 className="text-xl font-semibold text-indigo-700 mb-2">
                            Acceptance Criteria
                          </h3>
                          <ul className="list-disc pl-5 space-y-2 text-gray-700">
                            {items.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {!userStory && !context && items.length === 0 && (
                        <div className="p-4 border rounded-lg bg-white shadow-sm text-center">
                          <p className="text-gray-500 italic">
                            No information available for overview.
                          </p>
                        </div>
                      )}
                      {/* Show userStoryError here */}
                    </div>
                    <div className="flex justify-between items-center pt-4">
                      <Button
                        label="Back"
                        severity="secondary"
                        icon="pi pi-arrow-left"
                        onClick={() => stepperRef.current.prevCallback()}
                      />
                      <Button
                        label="Save"
                        icon="pi pi-save"
                        onClick={saveUserStory}
                      />
                    </div>
                  </StepperPanel>
                </Stepper>
              </TabPanel>

              {/* TabPanel for Upload Excel */}
              {/* TabPanel for Jira Import */}
              <TabPanel>
                <div className="p-6 bg-white rounded-lg shadow-lg">
                  <DataSourceTabPanel showToast={showToast} />
                </div>
              </TabPanel>
              <TabPanel>
                <div className="p-6 rounded-lg shadow-md">
                  <div className="space-y-6">
                    {/* File Upload */}
                    <div className="border-b-2 pb-4">
                      <FileUpload
                        emptyTemplate={
                          <>
                            <p className="m-0 my-4 text-lg">
                              Your Excel file should be in the following format:
                            </p>

                            {/* Description */}
                            <p className="text-gray-700 mb-6">
                              Please ensure your Excel file contains the
                              required columns with the correct headers, as
                              shown below. The file should be in .xlsx format,
                              with the columns properly aligned for successful
                              processing.
                            </p>

                            <div className="flex items-center gap-4">
                              {/* Button to view Excel template */}
                              {/* <Button
                                label="Click To View Template"
                                icon="pi pi-file"
                                onClick={() => setShowExcelTemplateDialog(true)} // Open dialog for Excel template
                                className="bg-indigo-800 text-white hover:text-white border border-indigo-800 hover:bg-indigo-700 transition-colors"
                              /> */}

                              {/* Button to download Excel template */}
                              <Button
                                label="Download Template"
                                icon="pi pi-file"
                                onClick={() => {
                                  // Trigger the download by creating a hidden link
                                  const link = document.createElement("a");
                                  link.href =
                                    `${BASE_URL}/files/Template.xlsx`; // Replace with your file URL
                                  link.download = "template.xlsx"; // File name when downloaded
                                  link.click();
                                }}
                                className="bg-indigo-800 text-white hover:text-white border border-indigo-800 hover:bg-indigo-700 transition-colors"
                              />
                            </div>

                            {/* Instructions */}
                            <p className="text-gray-700 mt-6">
                              After ensuring that your file is in the correct
                              format, click the "Browse" button above to upload
                              it. If you're unsure about the format, feel free
                              to download the template below.
                            </p>
                          </>
                        }
                        name="file"
                        chooseLabel="Browse"
                        customUpload
                        uploadHandler={onUpload}
                        className="w-full"
                      />
                    </div>

                    {/* Show Excel Template Button */}
                  </div>
                </div>
              </TabPanel>


            </Tabs>
          </Sidebar>

          <Dialog
            header="Download Data"
            visible={showDownloadDialog}
            style={{ width: "50vw", borderRadius: "12px" }}
            onHide={() => setShowDownloadDialog(false)}
            className="shadow-xl bg-white"
          >
            <div className="p-6 bg-white rounded-lg shadow-lg">
              {/* Header */}
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Download Your Ambiguities, Mind Maps, and Test Scenarios
              </h2>

              {/* Description */}
              <p className="mb-4 text-gray-600 text-lg">
                Our platform provides you with the following resources in a
                convenient ZIP format:
              </p>

              <ul className="list-inside list-disc mb-6 text-gray-600">
                <li>Ambiguities for better clarification and tracking</li>
                <li>Mind Maps to enhance your brainstorming sessions</li>
                <li>Test Scenarios for refining your strategies</li>
              </ul>

              <p className="mb-6 text-gray-500">
                Once you download the ZIP file, simply unzip it to access the
                following:
              </p>

              <ul className="list-inside list-disc mb-6 text-gray-600">
                <li>
                  An Excel file containing all your ambiguities, mind maps, and
                  test scenarios
                </li>
                <li>
                  An image folder containing all the mind map images, linked to
                  the Excel sheet for easy reference
                </li>
              </ul>

              {/* Download Instructions */}
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm mb-6">
                <p className="text-gray-600">
                  Click the button below to download a ZIP file containing the
                  Excel file and the mind map images. After unzipping the file,
                  you'll be able to access the data and images, with all the
                  mind map images linked directly in the Excel sheet for
                  seamless integration.
                </p>
              </div>

              {/* Download Button */}
              <Button
                label={isLoading ? "Downloading..." : "Download Data"}
                icon={isLoading ? "pi pi-spin pi-spinner" : "pi pi-download"}
                style={{ backgroundColor: "#1E3A8A", color: "white" }}
                onClick={handleDownload}
                disabled={isLoading} // Disable button while loading
                className="w-auto mt-4 transition-all hover:shadow-xl focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </Dialog>

          {/* Excel Template Dialog */}
          <Dialog
            header="Excel Template"
            visible={showExcelTemplateDialog}
            style={{ width: "100vw", height: "100vh", margin: 0, padding: 0 }}
            onHide={() => setShowExcelTemplateDialog(false)}
            footer={null} // Optional: Remove footer if not needed
            className="overflow-hidden"
          >
            <ExcelTemplate />
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export function DataSourceTabPanel({showToast}) {
  const toastRef = useRef<Toast | null>(null);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      {/* Single Toast host mounted at this stable level */}
      <Toast ref={toastRef} position="top-right" />
      {/* Pass a function prop to trigger toasts */}
      <DataSourceButton showToast={showToast} />
    </div>
  );
}

export default BreadcrumbComponent;

