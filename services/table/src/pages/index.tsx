import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import Tutorial from "../components/Tutorial/Tutorial.tsx";

import "../App.css";

import "primereact/resources/primereact.min.css";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import { APIOptions, PrimeReactProvider } from "primereact/api";
import Tailwind from "primereact/passthrough/tailwind";
import "primeicons/primeicons.css";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { Dropdown } from "primereact/dropdown";
import { Stepper } from "primereact/stepper";
import { StepperPanel } from "primereact/stepperpanel";
import Lottie from "react-lottie";
import loadingAnimation from "../../src/assets/loading.json";

// import { useNavigate } from 'react-router-dom';
// @ts-ignore
import {
  getUserStories,
  addUserStory,
  processAllUserStories,
  generateTestScenario,
} from "../services/services.js"; // Import your service functions
import { nanoid } from "nanoid";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import { ProgressBar } from "primereact/progressbar";
// import igs_logo from '../../assets/IGS_LOGO.png';

import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { twMerge } from "tailwind-merge";

interface Ambiguity {
  ambi_val: string;
  status: boolean;
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
}
//@ts-ignore
export default function demo({
  setRowClicked,
  AppName,
  projectid,
  projectDetails,
  selectedUserStory,
  path,

  rowClicked,
  newAppName,
}) {
  const stepperRef = useRef(null);
  const [userStories, setUserStories] = useState<UserStoryData[]>([]);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [userStory, setUserStory] = useState<string>("");
  const [context, setContext] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [processing, setProcessing] = useState<boolean>(false);
  const [selectedProducts, setSelectedProducts] = useState<UserStoryData[]>([]);
  const [dots, setDots] = useState<string>(".");
  const [error, setError] = useState(null);
  const [ac, setAC] = useState<string>("");
  const [items, setItems] = useState<string[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [tutorialRun, setTutorialRun] = useState(false);
  const [tutorialRun2, setTutorialRun2] = useState(false);
  const [tutorialRun3, setTutorialRun3] = useState(false);

  const [userStoryError, setUserStoryError] = useState<string>("");
  // const [contextError, setContextError] = useState('');
  const [page, setPage] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [isPolling, setIsPolling] = useState(true);

  const [globalFilter, setGlobalFilter] = useState('');

  const onRowClick = (rowIndex: any) => {
    if (AppName == "Test Scenarios" || AppName == "Mind Maps") {
      // if(userStories[rowIndex].process_status.ambiguity_checker == "refined" || userStories[rowIndex].process_status.test_scenarios == "processed")
      {
        setRowClicked(true);
        selectedUserStory(userStories[rowIndex] || null);
      }
      
    }
    // else if (AppName == "Ambiguity Checker" && userStories[rowIndex].process_status?.ambiguity_checker == "new" ) {
    //   setRowClicked(false);
    //   toast.current?.show({
    //     severity: "info",
    //     summary: "Please Process Your Story First",
    //     detail: "Select The CheckBox and Click on Process To generate Ambiguities First",
    //     life: 5000,
    //   });
    // }
     else {
      setRowClicked(true);
      selectedUserStory(userStories[rowIndex]);
    }
  };

  const onAmbClick = (rowIndex: number) => {
    if (AppName !== "Test Scenarios" || AppName !== "Mind Maps") {
      const updatedData = [...userStories];
      updatedData[rowIndex] = {
        ...updatedData[rowIndex],
        process_status: {
          ...updatedData[rowIndex].process_status,
          ambiguity_checker: "pending",
        },
      };

      setUserStories(updatedData);
      setRowClicked(true);
      selectedUserStory(updatedData[rowIndex]);
    }
  };

  const toast = useRef<Toast>(null);

  // useEffect(() => {
  //   if (userStories.length === 1) {
  //     setTutorialRun(true); // Start the tutorial if only one user story is present
  //   } else {
  //     setTutorialRun(false); // Don't run the tutorial if there are more or less than one user story
  //   }
  // }, [userStories]); 

  useEffect(() => {
    if (userStories.some((story) => story.process_status?.test_scenarios === "processing")) {
      setProcessing(true);
    } else {
      setProcessing(false); // Optional: Reset to false if no stories are processing
    }
  }, [userStories]); // Only runs when userStories changes
  

  useEffect(() => {
    const savedPage = localStorage.getItem("currentPage");
    if (savedPage) {
      setPage(parseInt(savedPage, 10));
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 5 ? prev + "." : "."));
    }, 500); // Adjust the speed of the animation (500ms in this case)
    return () => clearInterval(interval); // Clean up the interval on unmount
  }, []);

  const pollingRef = useRef<number>(2000); // Start with 2 seconds as the initial interval

  // Fetch data from the backend
  const fetchData = async () => {
    try {
      const data = await getUserStories(projectDetails.id);
      if (data == null) {
        setUserStories([]);
      } else {
        setUserStories(data);
        pollingRef.current = Math.min(pollingRef.current * 2, 30000);
      }
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error("Error fetching user stories:", err);
      setError("Error fetching data. Retrying...");
      // Exponentially increase polling interval (max 30 seconds)
      // Update polling interval (max 30s)
    } finally {
      setLoading(false);
    }
  };

  // Polling function with exponential backoff
  const poll = async () => {
    if (isPolling) {
      await fetchData(); // Fetch data

      // Retry polling after the current interval using updated pollingRef
      setTimeout(poll, pollingRef.current);
    }
  };

  useEffect(() => {
    // Start polling when component mounts
    poll();

    return () => {
      // Stop polling when the component unmounts
      setIsPolling(false);
    };
  }, [isPolling]);

  useEffect(() => {
    if (AppName === "Ambiguity Checker") {
      setTutorialRun2(false);
      setTutorialRun3(false);
    }
  
    if (AppName === "Test Scenarios") {
      setTutorialRun(false);
      setTutorialRun3(false);
    }
  
    if (AppName === "Mind Maps") {
      setTutorialRun(false);
      setTutorialRun2(false);
    }
  }, [AppName]);

  const filterUserStories = () => {
    let filteredStories = userStories;

    if (statusFilter) {
      filteredStories = filteredStories.filter((story) => {
        if (AppName === "Ambiguity Checker") {
          return story.process_status?.ambiguity_checker === statusFilter;
        } else if (AppName === "Test Scenarios") {
          return story.process_status.test_scenarios === statusFilter;
        }
        return false;
      });
    }

    if (searchTerm) {
      filteredStories = filteredStories.filter((story) =>
        story.story.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    return filteredStories;
  };

  const capitalizeFirstLetter = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1);



  const statusBodyTemplate = (rowData: UserStoryData, appName: string) => {
    // Define the status class based on the ambiguity checker status
    //@ts-ignore
    const statusClass =
      rowData.process_status.test_scenarios === "processed" &&
      appName === "Test Scenarios"
        ? "text-green-500"
        : rowData.process_status?.ambiguity_checker === "pending" &&
            appName === "Ambiguity Checker"
          ? "text-orange-500"
          : "text-green-500";
    return (
      <span className={`font-bold ${statusClass}`}>
        {rowData.status === "processing" ||
        rowData.status === "refining" ||
        rowData.process_status?.ambiguity_checker === "processing" ||
        rowData.process_status?.test_scenarios === "processing" ||
        rowData.process_status?.mind_maps === "processing" ||
        rowData.test_scenarios?.batch_status === "processing" ? (
          <>
            <p className="text-md font-bold">Processing{dots}</p>
            {/* <ProgressBar mode="indeterminate" /> */}
          </>
        ) : appName === "Ambiguity Checker" ? (
          capitalizeFirstLetter(rowData.process_status?.ambiguity_checker)
        ) : appName === "Test Scenarios" ? (
          capitalizeFirstLetter(rowData.process_status.test_scenarios)
        ) : appName === "Mind Maps" ? (
          capitalizeFirstLetter(rowData.process_status.mind_maps)
        ) : null}
      </span>
    );
  };

  const openDialog = () => {
    setShowDialog(true);
  };

  const hideDialog = () => {
    setShowDialog(false);
  };

  const handlePageChange = (event: any) => {
    setPage(event.page);
    localStorage.setItem("currentPage", event.page.toString());
  };

  const saveUserStory = async () => {
    if (validateFields()) {
      try {
        const sanitizedUserStory = userStory.replace(/\n/g, " ");
        const sanitizedContext = context.replace(/\n/g, " ");

        const newStory = {
          context: sanitizedContext,
          story: sanitizedUserStory,
          project_id: projectDetails.id,
          manual_acceptance_criteria: items,
        };

        await addUserStory(newStory);
        fetchData();
        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: "User Story Added Successfully",
          life: 3000,
        });
        hideDialog();
        setUserStory("");
        setContext("");
        setAC("");
        setItems([]);
      } catch (error) {
        console.error("Error saving user story:", error);
      }
    }
  };

  const handleProcessUserStories = async () => {
    // Check if any user stories are selected
    const storiesToSend =
      selectedProducts.length > 0
        ? selectedProducts.filter(
            (story) => story.process_status?.ambiguity_checker === "new",
          )
        : userStories.filter(
            (story) => story.process_status?.ambiguity_checker === "new",
          );

    // If no new stories are found, show a warning message
    if (storiesToSend.length === 0) {
      toast.current?.show({
        severity: "warn",
        summary: "No New Stories",
        detail: "There are no new user stories to process.",
        life: 3000,
      });
      return;
    }

    try { // Disable the button while processing
      toast.current?.show({
        severity: "info",
        summary: "Processing",
        detail: "Stories are being processed.",
        life: 3000,
      });

      // Initiate the POST request to process all user stories
      await processAllUserStories(storiesToSend);

      // After processing is completed, fetch updated data
      fetchData();
      // Show success message (optional)
      // toast.current.show({ severity: 'success', summary: 'Completed', detail: 'Processing completed successfully.', life: 3000 });
    } catch (e) {
      console.error("Error processing user stories:", e);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to process user stories.",
        life: 3000,
      });
    } finally {
      // setProcessing(false); // Enable the button after processing is complete
    }
  };

  const handleReprocess = async (userStory: UserStoryData) => {
    try {
      // setProcessing(true);
      toast.current?.show({
        severity: "info",
        summary: "Processing",
        detail: "Stories are being processed.",
        life: 3000,
      });
      await processAllUserStories([userStory]);
      fetchData();
      // setProcessing(false);
    } catch (e) {
      console.error("Error processing user stories:", e);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to process user stories.",
        life: 3000,
      });
    }
  };

  const handleProcessTestScenarios = async () => {
    // Check if any stories are selected

    const storiesToSend =
      selectedProducts.length > 0
        ? selectedProducts.map((story) => ({
            _id: story._id,
            story: story.story,
            context: story.context,
            acceptance_criteria: story.acceptance_criteria,
            project_id: story.project_id,
          }))
        : [];
        
    // const storiesToSend =
    //   selectedProducts.length > 0
    //     ? selectedProducts.map((story) => ({
    //         _id: story._id,
    //         story: story.story,
    //         context: story.context,
    //         acceptance_criteria: story.acceptance_criteria,
    //         project_id: story.project_id,
    //       }))
    //     : userStories.map((story) => ({
    //         _id: story._id,
    //         story: story.story,
    //         context: story.context,
    //         acceptance_criteria: story.acceptance_criteria,
    //         project_id: story.project_id,
    //       }));

    if (storiesToSend.length === 0) {
      toast.current?.show({
        severity: "warn",
        summary: "No New Stories",
        detail: "Please Select a User Story To Process.",
        life: 3000,
      });
      return;
    }

    if (storiesToSend.length >= 3) {
      toast.current?.show({
        severity: "warn",
        summary: "No New Stories",
        detail: "You Can Only Process Two User Stories at Once.",
        life: 3000,
      });
      return;
    }

    // Check if acceptance criteria is null for any story
    const validStoriesToSend = storiesToSend //.filter(story => story.acceptance_criteria !== null);

    if (validStoriesToSend.some((story) => story.process_status?.test_scenarios === "processing")) {
      toast.current?.show({
        severity: "warn",
        summary: "No Valid Stories",
        detail: "Story is Still in the Processing State.",
        life: 3000,
      });
      return;
    }    
    

    if (validStoriesToSend.length === 0) {
      toast.current?.show({
        severity: "warn",
        summary: "No Valid Stories",
        detail: "Selected User Story does not have any Acceptance Criteria.",
        life: 3000,
      });
      return;
    }

    try {
      // setProcessing(true); // Disable the button while processing
      toast.current?.show({
        severity: "info",
        summary: "Processing",
        detail: "Stories are being processed.",
        life: 3000,
      });

      // Initiate the POST request to process all user stories
      await generateTestScenario(validStoriesToSend);

      // After processing is completed, fetch updated data
      fetchData();
    } catch (e) {
      console.error("Error processing user stories:", e);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to process user stories.",
        life: 3000,
      });
    } finally {
      // setProcessing(false); // Enable the button after processing is complete
    }
  };

  const validateFields = () => {
    let isValid = true;

    if (!userStory.trim()) {
      setUserStoryError("User Story is required");
      isValid = false;
    } else if (userStory.trim().length < 10) {
      setUserStoryError("User Story must be at least 10 characters");
      isValid = false;
    } else {
      setUserStoryError("");
    }

    return isValid;
  };

  const handleAddItem = () => {
    if (ac.trim()) {
      setItems([...items, ac.trim()]);
      setAC(""); // Clear the input
    }
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

  const sortAmbiguityCount = () => {
    const newSortOrder = sortOrder === "asc" ? "desc" : "asc"; // Toggle sort order
    setSortOrder(newSortOrder); // Update sort order state

    // Sort the user stories based on ambiguity count
    const sortedStories = [...userStories].sort((a, b) => {
      const aCount = countAmbiguities(a.ambiguities);
      const bCount = countAmbiguities(b.ambiguities);
      return newSortOrder === "asc" ? aCount - bCount : bCount - aCount;
    });

    setUserStories(sortedStories); // Update the user stories state with sorted data
  };

  const loadingOptions = {
    loop: true,
    autoplay: true,
    animationData: loadingAnimation,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };


  // function countAmbiguities(ambiguities: any) {
  //   let counts = 0;
  //   for (const key in ambiguities) {
  //     if (ambiguities.hasOwnProperty(key)) {
  //       counts += ambiguities[key].length;
  //     }
  //   }
  //   return counts;
  // }

  function countAmbiguities(data: any, countDataField: string) {
  let counts = 0;

  // Check if the field is 'mind_maps'
  if (countDataField === "mind_maps" && data && typeof data === "object" && !Array.isArray(data)) {
    // Count the number of child objects in the mind_maps field
    counts = Object.keys(data).length; // Count the number of top-level child objects
  } else {
    // For all other cases (like 'ambiguities' or 'test_scenarios')
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        counts += data[key].length; // Count the length of arrays in other fields
      }
    }
  }

  return counts;
}


const toggleTutorial = () => {
  setTutorialRun((prev) => !prev); // Toggle the tutorial state
};

const toggleTutorial2 = () => {
  setTutorialRun2((prev) => !prev);
};

const toggleTutorial3 = () => {
  setTutorialRun3((prev) => !prev);
};


// Callback to handle when the tutorial ends
const handleTutorialEnd = () => {
  setTutorialRun(false); // Stop the tutorial once it's completed
  // Optionally, store in localStorage or perform other actions here
};
  

  let columnField = "ambiguities"; // Default for "/dashboard/ac/table"
  let columnHeader = "Ambiguity Count"; // Default for "/dashboard/ac/table"
  let countDataField = "ambiguities"

  if (path === "/dashboard/mm/table") {
    columnField = "mindmaps";
    columnHeader = "Mind Maps Count";
    countDataField = "mind_maps"

  } else if (path === "/dashboard/ts/table") {
    columnField = "testscenarios";
    columnHeader = "Scenario Count";
    countDataField = "test_scenarios"
  }

  const handleTutorialFinish = () => {
    console.log('Tutorial has finished or was skipped');
    setTutorialRun(false); // Optionally reset state when tutorial finishes
  };

  const handleTutorialFinish2 = () => {
    console.log('Tutorial has finished or was skipped');
    setTutorialRun2(false); // Optionally reset state when tutorial finishes
  };

  const handleTutorialFinish3 = () => {
    console.log('Tutorial has finished or was skipped');
    setTutorialRun3(false); // Optionally reset state when tutorial finishes
  };


  const tutorialSteps = [
    {
      target: ".story-add-button",
      content: "Enter your user stories here"
    },
    {
      target: ".user-story-body",
      content: "You have added your First User Story, You can View your Added User Stories Here",
      placement: "top",
    },
    {
      target: ".checkbox-body",
      content: "Then Select This Checkbox to Feed this User Story to Our Model So that it will generate some ambiguities.",
      placement: "top",
    },
    {
      target: ".process-button",
      content: "Then Click on this Process Button to Allow Our Model to Generate Some Ambiguities",
      placement: "top",
    },
    // {
    //   target: ".column-status",
    //   content: "This column displays the current status of the user story.",
    //   placement: "top",
    // },
  ];

  const tutorialSteps2 = [
    {
      target: ".status-body",
      content: "Your Status Changed To Pending",
      placement: "top",
    },
    {
      target: ".user-story-body",
      content: "Click on your User Story to View the Generated Ambiguities on your story",
      placement: "top"
    }
  ]

  const tutorialSteps3 = [
    {
      target: ".status-body",
      content: "Your Status Changed To Refined",
      placement: "top",
    },
    {
      target: ".user-story-body",
      content: "Click on your User Story to view Refined Version of your story along with Acceptance Criteria and Assumptions",
      placement: "top"
    }
  ]

  const tutorialSteps4 = [
    {
      target: ".checkbox-body",
      content: "Select This Checkbox to select this User Story to generate Test Scenarios",
      placement: "top",
    },
    {
      target: ".process-button",
      content: "Then Click on this Process Button to Allow Our Model to Generate Test Scenarios",
      placement: "top",
    },
    {
      target: ".user-story-body",
      content: "Click on your User Story to view The Model Generated Test Scenarios",
      placement: "top"
    }
  ]

  const mindMapsTutorial = [
    {
      target: ".user-story-body",
      content: "Click on your User Story to Open Mind Maps Creation Window",
      placement: "top"
    },
    {
      target: ".count-column",
      content: "This Shows the total number of mind maps generated",
      placement: "top"
    },
  ]

  return (
    <PrimeReactProvider
      value={{
        unstyled: false,
        pt: Tailwind,
        ptOptions: {
          mergeSections: true,
          mergeProps: true,
          classNameMergeFunction: twMerge,
        },
      }}
    >

      <div className="bg-[#f1f1f1] min-h-screen">
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Lottie options={loadingOptions} height={150} width={150} />
          </div>
        ) : (
          <>
            {userStories.length === 20000 ? (
              <div
                className="flex items-center justify-center h-full"
                style={{ minHeight: "calc(60vh - 4rem)" }}
              >
                <div className="flex flex-col items-center p-8 rounded-lg">
                  <p className="text-4xl font-bold mb-4">No data Present</p>
                  <p className="text-xl text-gray-600 mb-6">
                    (No User Stories Present)
                  </p>
                  <Button
                    label="Add"
                    size="small"
                    icon="pi pi-plus"
                    className="p-button-primary p-3 bg-indigo-800 rounded-md text-white"
                    onClick={openDialog}
                  />
                </div>
              </div>
            ) : (
              <>
                {/* <img src={igs_logo} className='h-[100px] w-[100px] absolute right-0 top-0 mr-[42px]' /> */}
                {tutorialRun && userStories[0]?.process_status?.ambiguity_checker === "pending" && (
  <Tutorial
    steps={tutorialSteps2}
    run={tutorialRun}
    onFinish={handleTutorialFinish}
  />
)}

{tutorialRun && userStories[0]?.process_status?.ambiguity_checker === "refined" && (
  <Tutorial
    steps={tutorialSteps3}
    run={tutorialRun}
    onFinish={handleTutorialFinish}
  />
)}

{tutorialRun &&
  (!userStories[0]?.process_status?.ambiguity_checker || 
   (userStories[0]?.process_status?.ambiguity_checker !== "pending" && 
    userStories[0]?.process_status?.ambiguity_checker !== "refined")) && (
    <Tutorial
      steps={tutorialSteps}
      run={tutorialRun}
      onFinish={handleTutorialFinish}
    />
  )}

{tutorialRun2 && AppName === "Test Scenarios" && (
  <Tutorial
    steps={tutorialSteps4}
    run={tutorialRun2}
    onFinish={handleTutorialFinish2}
  />
)}

{tutorialRun3 && AppName === "Mind Maps" && (
  <Tutorial
    steps={mindMapsTutorial}
    run={tutorialRun3}
    onFinish={handleTutorialFinish3}
  />
)}


                <div className="flex justify-between items-center mb-5">
                <div className="flex items-center w-full justify-between gap-16">
  <button
    style={{ backgroundColor: "#BA0000", color: "white" }}
    onClick={() => window.history.back()}
    className="text-xs p-button-success p-2 bg-indigo-800 rounded-md text-white whitespace-nowrap"
  >
    ← Go Back
  </button>

  <p className="text-md font-extrabold bg-blue-900 text-transparent bg-clip-text drop-shadow-lg mb-6 text-center w-full">
    {AppName === "Ambiguity Checker" ? "Kill Ambiguity Table : " : `${AppName} Table : `}
    {projectDetails.name.length > 40
      ? `${projectDetails.name.substring(0, 40)}...`
      : projectDetails.name}
  </p>
</div>


                  

                  <div className="flex space-x-4 justify-end">
                    {/* <Button
                      label="Add"
                      size="small"
                      icon="pi pi-plus"
                      style={{ backgroundColor: "#BA0000", color: "white" }}
                      onClick={openDialog}
                    /> */}
{/* {userStories.length <= 1 && (
 <button
 onClick={
  AppName === "Ambiguity Checker" 
    ? () => { 
        toggleTutorial(); 
        handleTutorialFinish2(); 
        handleTutorialFinish3(); 
      }
    : AppName === "Test Scenarios" 
    ? () => { toggleTutorial2(); handleTutorialFinish(); handleTutorialFinish3(); }
    : AppName === "Mind Maps" 
    ? () => { toggleTutorial3(); handleTutorialFinish2(); handleTutorialFinish(); }
    : undefined
}

 onMouseEnter={(e) => {
   e.target.style.transform = "scale(1.1)"; // Slight zoom-in effect on hover
   e.target.style.boxShadow = "0px 10px 20px rgba(0, 0, 0, 0.2)"; // Increase shadow depth
 }}
 onMouseLeave={(e) => {
   e.target.style.transform = "scale(1)"; // Revert zoom effect
   e.target.style.boxShadow = "0px 4px 8px rgba(0, 0, 0, 0.1)"; // Revert shadow
 }}
 className={`
   bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700
   text-white
   text-xl
   font-sans
   rounded-full
   w-20 h-20
   flex items-center justify-center
   text-3xl
   shadow-xl
   hover:scale-110
   hover:shadow-2xl
   transition-all duration-300
   focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50
   fixed bottom-8 right-8
   ring-offset-2
   active:scale-95
   animate-bounce
 `}
>
  Help
</button>


    )} */}
                    {/* <Button label="Download" icon="pi pi-save" className="p-button-success p-3 bg-indigo-800 rounded-md text-white" onClick={() => { downloadExcelDoc(sessionId) }} /> */}
                  </div>
                </div>
                {/* <div className="mb-4">
  <label className="text-gray-800 font-semibold mr-2">Filter by Status:</label>
  <Dropdown
    value={statusFilter}
    options = {AppName === "Ambiguity Checker" ? statusOptions : statusOptions2}
    onChange={(e) => setStatusFilter(e.value)}
    placeholder="Select Status"
    className="w-40"
  />
</div> */}
                {/* <div className="mb-4 w-96">
                  {" "}
                  <label className="text-gray-800 font-semibold mb-2 block">
                    Search User Stories:
                  </label>
                  <InputText
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by user story..."
                    className="border rounded-md p-2 w-full focus:ring focus:ring-blue-300"
                  />
                </div> */}

                <DataTable
                  value={filterUserStories()}
                  className="w-full h-full mb-4 border-b border-gray-200 rounded-lg shadow-sm"
                  paginator
                  filterDisplay="menu"
                  paginatorPosition="bottom"
                  rows={10}
                  first={page * 10}
                  onPage={handlePageChange}
                  // rowsPerPageOptions={[5, 10, 20]} // Options for rows per page
                  showGridlines
                  paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                  currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                  sortMode="multiple"
                >
                  {/* Checkbox Column for Selection */}
                  {path !== "/dashboard/mm/table" && (
                    <Column
  headerClassName="column-checkbox" 
  headerStyle={{
    textAlign: "center",
    fontWeight: "bold",
    fontSize: "14px",
    padding: "10px",
  }}
  className="w-[5%] text-center bg-gray-50 border-r-2 border-gray-200"
  pt={{
    headerContent: { className: "flex justify-center items-center" }, // Proper key for `.p-column-header-content`
  }}
  style={{
    width: "5%",
    padding: "10px",
  }}
  header={() => (
    <div className="flex justify-center items-center h-full w-full">
      <input
        type="checkbox"
        checked={selectedProducts.length === userStories?.length}
        onChange={(e) => {
          const isChecked = e.target.checked;
          setSelectedProducts(isChecked ? [...userStories] : []);
        }}
        className="h-5 w-5 border-gray-300 rounded-sm focus:ring-blue-500 checked:bg-blue-500 transition-all"
      />
    </div>
  )}
  body={(rowData) => (
    <div className="checkbox-body flex justify-center items-center">
      <input
        type="checkbox"
        id="checkbox-unique"
        checked={selectedProducts.some((item) => item._id === rowData._id)}
        onChange={(e) => {
          const isChecked = e.target.checked;
          setSelectedProducts((prevSelected) =>
            isChecked
              ? [...prevSelected, rowData]
              : prevSelected.filter((item) => item._id !== rowData._id)
          );
        }}
        className="h-5 w-5 border-gray-300 rounded-sm focus:ring-blue-500 checked:bg-blue-500 transition-all"
      />
    </div>
  )}
/>
                  )}

                  {/* User Story Column */}
                  <Column
    headerClassName="column-story"
    field="story"
    // header={<span className="text-gray-800 text-sm font-semibold">User Story</span>}
    header={() => (
      <div className="flex justify-between items-center gap-16">
          <div className="flex items-center gap-4">
              <p className="text-sm text-black">User Stories</p>
              <Button 
  icon="pi pi-plus" 
  size="small" // Ensures a small button size from PrimeReact
  className=" story-add-button p-button-rounded p-button-primary p-button-sm rounded-full w-[25px] h-[25px] flex items-center justify-center p-1" 
  tooltip="Add User Story"
  onClick={openDialog}
/>


          </div>

          {/* <InputText
  value={filterValue}
  onChange={(e) => setFilterValue(e.target.value)}
  placeholder="Search by name"
  className="p-inputtext-sm text-sm py-2 px-2 w-[350px]" // Adjust text size, padding, and width
  pt={{
      root: { className: "text-sm py-1 px-2 w-[300px]" }, // Fine-tune the size
  }}
/> */}

      </div>
  )}
    className="w-[40%]"
    style={{ width: "50%" }}
    filter
    filterPlaceholder="Search by User Story"
    filterMatchMode="startsWith" 
    body={(rowData, { rowIndex }) => (
      <span
        className={`user-story-body cursor-pointer text-sm text-black hover:underline ${
          rowData.status === "new" || rowData.status === "processing"
            ? "cursor-not-allowed text-gray-400"
            : ""
        }`}
        onClick={() => {
          const filteredRows = filterUserStories();
          const filteredRowIndex = filteredRows.findIndex(
            (item) => item._id === rowData._id
          );
          onRowClick(filteredRowIndex); // Trigger the click using the filtered index
        }}
      >
        {rowData.story.length > 40
          ? `${rowData.story.substring(0, 200)}...`
          : rowData.story}
      </span>
    )}
  />


                  {/* Ambiguity Count Column */}
                  <Column
  headerClassName="column-ambiguity"
  field={columnField}
  header={
    <span className="count-column text-sm text-gray-800 font-semibold cursor-pointer">
      {columnHeader} {/* Optional arrow indicator */}
    </span>
  }
  body={(rowData) => {
    const fieldData = rowData[countDataField];
    const ambiguityCount = countAmbiguities(fieldData, countDataField);
    const [isHovered, setIsHovered] = React.useState(false); // Track hover state

    return (
      <div
        className="relative flex items-center justify-center"
        onMouseEnter={() => setIsHovered(true)} // Show tooltip on hover
        onMouseLeave={() => setIsHovered(false)} // Hide tooltip when not hovering
      >
        {/* Ambiguity Count */}
        <span
          className={`text-gray-600 text-sm ${ambiguityCount > 0 ? "cursor-pointer" : ""}`}
          onClick={() => {
            if (
              path !== "/dashboard/mm/table" &&
              path !== "/dashboard/ts/table" &&
              ambiguityCount > 0
            ) {
              // Get the filtered rows and find the correct index
              const filteredRows = filterUserStories();
              const filteredRowIndex = filteredRows.findIndex(
                (item) => item._id === rowData._id
              );
              onAmbClick(filteredRowIndex); // Trigger the click with the filtered index
            }
          }}
        >
          {ambiguityCount}
        </span>

        {/* Tooltip */}
        {path !== "/dashboard/mm/table" && path !== "/dashboard/ts/table" && ambiguityCount > 0 && isHovered && (
          <div
            style={{
              position: "absolute",
              bottom: "125%",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              color: "#fff",
              padding: "5px 10px",
              borderRadius: "4px",
              fontSize: "12px",
              whiteSpace: "nowrap",
              zIndex: 10,
            }}
          >
            Click to view Ambiguities
          </div>
        )}
      </div>
    );
  }}
  className="w-[12%] text-center"
  // sortable
/>


                  {/* Source Column */}
                  <Column
                    field="source"
                    headerClassName="column-source" 
                    headerStyle={{ textAlign: 'center' }}
                    header={
                      <span className="text-gray-800 text-sm font-semibold text-center">
                        Source
                      </span>
                    }
                    // headerClassName="text-center"
                    body={(rowData) => (
                      <span className="text-gray-600 text-sm relative flex items-center justify-center">{rowData.source}</span>
                    )}
                    className="w-[8%]"
                  />

                  {/* Status Column */}
                  <Column
                    field="status"
                    headerClassName="column-status"
                    header={
                      <span className="story-status text-sm text-gray-800 font-semibold">
                        Status
                      </span>
                    }
                    body={(rowData: UserStoryData) => (
                      <div className="status-body text-sm flex items-center justify-between">
                        {statusBodyTemplate(rowData, AppName)}
                        {/* {rowData.status === "processed" &&
                          AppName === "Ambiguity Checker" && (
                            <button
  className="ml-2 p-2 text-black border border-white bg-transparent hover:bg-opacity-10 rounded-sm"
  onClick={() => handleReprocess(rowData)}
  title="Click to reprocess"
>
  <i className="pi pi-refresh"></i>
</button>

                          )} */}
                      </div>
                    )}
                    className="w-[15%] text-center"
                    style={{ width: "15%" }}
                  />
                </DataTable>

                <div className="flex space-x-4 justify-end">
                  {path !== "/dashboard/mm/table" && (
                    <Button
                      label="Process"
                      icon="pi pi-check"
                      className="process-button p-button-success p-3 bg-indigo-800 rounded-md ml-5 text-white"
                      size="small"
                      style={{ backgroundColor: "#BA0000", color: "white" }}
                      onClick={
                        AppName == "Ambiguity Checker"
                          ? handleProcessUserStories
                          : handleProcessTestScenarios
                      }
                      disabled={((AppName === "Test Scenarios" ? processing : false) || selectedProducts?.length === 0)}

                    />
                  )}
                </div>
              </>
            )}
          </>
        )}
        <Dialog
          header="Add User Story"
          visible={showDialog}
          maximizable
          style={{ width: "80%", height: "auto" }}
          onHide={() => {
            hideDialog();
          }}
          className="w-full md:w-1/2 rounded-lg shadow-lg"
        >
          <Stepper ref={stepperRef} style={{ flexBasis: "50rem" }}>
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
                  <p className="text-red-500 text-sm mt-1">{userStoryError}</p>
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
                  className="w-full p-inputtext p-component border focus:ring-2 focus:ring-indigo-500 p-4 h-80 rounded-lg shadow-sm text-gray-700"
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
                    style={{ backgroundColor: "#253985", fontWeight: "bold" }}
                    className="text-white px-6 py-4 rounded-r-lg shadow border border-indigo-800"
                  >
                    Add
                  </button>
                </div>
                <div
                  className="overflow-y-auto border p-4 rounded-lg shadow-inner bg-white"
                  style={{ height: "16rem", maxHeight: "22rem" }}
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
                              onChange={(e) => setEditingValue(e.target.value)}
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
                style={{ height: "22rem", maxHeight: "28rem" }}
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
        </Dialog>

        <Toast ref={toast} />
        {/* <Disclaimer /> */}
        </div>
      </div>
    </PrimeReactProvider>
  );
}

// Function to filter user stories based on selected status
// const filterUserStories = () => {
//   if (!statusFilter) return userStories;

//   return userStories.filter(story => {
//     if (AppName === "Ambiguity Checker") {
//       return story.process_status.ambiguity_checker === statusFilter;
//     } else if (AppName === "Test Scenarios") {
//       return story.process_status.test_scenarios === statusFilter;
//     }
//     return false; // If AppName doesn't match any known value, return false
//   });
// };

//   const statusBodyTemplate = (rowData: UserStoryData, appName: string) => {
//     // Define the status class based on the ambiguity checker status
//     //@ts-ignore
//     const statusClass =
//     rowData.process_status.test_scenarios === 'processed' && appName === 'Test Scenarios'
//       ? 'text-green-500'
//       : (rowData.process_status.ambiguity_checker === 'pending' && appName === 'Ambiguity Checker')
//       ? 'text-orange-500'
//       : 'text-green-500';
//   return (
//     <span className={`font-bold ${statusClass}`}>
//       {(rowData.status === 'processing' || rowData.status === 'refining') || rowData.process_status.ambiguity_checker === 'processing'
//         || rowData.process_status.test_scenarios === 'processing' || rowData.process_status.mind_maps === 'processing' ? (
//         <>
//           <p className='text-md'>Processing ....</p>
//           <ProgressBar mode="indeterminate" />
//         </>
//       ) : appName === 'Ambiguity Checker' ? (
//         rowData.process_status.ambiguity_checker
//       ) : appName === 'Test Scenarios' ? (
//         rowData.process_status.test_scenarios
//       ) : appName === 'Mind Maps' ? (
//         rowData.process_status.mind_maps
//       ) : null}
//     </span>
//   );
// };

// const onPageChange = (event: any) => {
//   setFirst(event.first);
//   setRows(event.rows);
// };
// const onPageChange = (event: any) => {
//   setFirst(event.first);
//   setRows(event.rows);
// };
