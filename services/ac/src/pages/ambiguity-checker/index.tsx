import React, { useState, ChangeEvent, useRef, useEffect } from "react";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { InputTextarea } from "primereact/inputtextarea";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css"; // Importing styles for the Tabs
import { Toast } from "primereact/toast";
import Joyride from "react-joyride";
import logo2 from "../../assets/logo2.jpeg"
// import igs_logo from '../../assets/IGS_LOGO.png';
// @ts-ignore
import { refineUserStory, processAllUserStories, getStory, updateStory, updateUserStory } from "../../services/services.js";
import { Dialog } from "primereact/dialog";
import { Tooltip } from "primereact/tooltip";
import { ProgressBar } from "primereact/progressbar";
import { PrimeReactProvider } from "primereact/api";
import Tailwind from "primereact/passthrough/tailwind";
import { twMerge } from "tailwind-merge";

import { jsPDF } from "jspdf";
import AmbiguitiesPanel from "../../components/AmbiguityPanel/index.tsx";
import ScoreBadge from "../../components/ScoreBadge/index.tsx";

interface LocationState {
  _id: string;
  story: string;
  context: string;
  status: string;
  ambiguities: Record<string, { val: string; status: boolean }[]>;
  acceptance_criteria: string[];
  manual_acceptance_criteria: string[];
  assumptions: string[];
  refined: string;
  sessionId: string;
  process_status: {
    ambiguity_checker: string;
    mind_maps: string;
    test_scenarios: string;
  };
}

const QuickScanner: React.FC<{ ambStory: LocationState | null }> = ({
  ambStory,
}) => {
  if (!ambStory) return null;

  const {
    _id,
    story: initialUserStory,
    context: initialContext,
    ambiguities: initialAmbiguities,
    acceptance_criteria,
    manual_acceptance_criteria,
    assumptions,
    refined: refinedStory,
    process_status,
  } = ambStory;

  const [context, setContext] = useState("");
  const [storyId, setStoryId] = useState("");
  const [refinedEvaluation, setRefinedEvaluation] = useState({});
  const [evaluationStatus, setEvaluationStatus] = useState<string>("");
  const [manualAcceptanceCriteria, setManualAcceptanceCriteria] = useState([]);
  const [userStory, setUserStory] = useState("");
  const [refinedStoryState, setRefinedStory] = useState("");
  const [data, setData] = useState<LocationState | null>(null);
  const [acceptanceCriteria, setAcceptanceCriteria] = useState([]);
  const [assumption, setAssumption] = useState([]);
  const [ambiguities, setAmbiguities] = useState({});
  const [newAmbiguity, setNewAmbiguity] = useState("");
  const [newAcceptanceCriteria, setNewAcceptanceCriteria] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [acEditing, setAcEditing] = useState<boolean | null>(false);
  const [assumptionsEditing, setAssumptionsEditing] = useState<boolean | null>(false);
  const [storyEditing, setStoryEditing] = useState<boolean | null>(false);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  const toast = useRef<any>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const cardTitleRef = useRef(null);
  const [tutorialRun, setTutorialRun] = useState(true);
  const [disableScrolling, setDisableScrolling] = useState(true);
  const [isAnyCheckboxSelected, setIsAnyCheckboxSelected] = useState(false);
  const [isAssumptionsExpanded, setIsAssumptionsExpanded] = useState(true);
  const [isAcceptanceCriteriaExpanded, setIsAcceptanceCriteriaExpanded] = useState(true);
  const [isRefinedStoryExpanded, setIsRefinedStoryExpanded] = useState(true);
  const [isUserStoryExpanded, setIsUserStoryExpanded] = useState(true);
  const pollingRef = useRef<number>(2000); // Initial interval set to 2 seconds
  const [isPolling, setIsPolling] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  // const [investScore, setInvestScore] = useState<number>();

  const [isCopied, setIsCopied] = useState(false);

  const toggleSection = (section) => {
    setVisibleSection(visibleSection === section ? null : section);
  };

  const handleRefine = async () => {
    const updatedAmbStory = {
      ...data,
      ambiguities: ambiguities, // Replace ambiguities with the updated state
    };

    toast.current.show({
      severity: "success",
      summary: "Success",
      detail: "Story Sent with the Ambiguities",
      life: 3000,
    });
    // window.history.back();
    try {
      await refineUserStory(updatedAmbStory);
      fetchData();
    } catch (error) {
      console.error("Failed to refine user story:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to generate Refined user story",
        life: 3000,
      });
      fetchData();
    }
  };

  const handleRetryRefine = async () => {
    toast.current.show({
      severity: "success",
      summary: "Success",
      detail: "Story Sent with the Ambiguities",
      life: 3000,
    });
    try {
      await refineUserStory(data);
      fetchData();
    } catch (error) {
      console.error("Failed to refine user story:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to generate Refined user story",
        life: 3000,
      });
      fetchData();
    }
  };

  const fetchData = async () => {
    try {
      const data = await getStory(_id);
      console.log("API Response:", JSON.stringify(data, null, 2)); // Debug API response

      if (data) {
        setManualAcceptanceCriteria(data?.manual_acceptance_criteria);
        setData(data);
        setUserStory(data.story || ""); // Use story
        setContext(data.context || "");
        setRefinedEvaluation(data?.refined_evaluation);
        setEvaluationStatus(data?.evaluation_status);
        setStoryId(storyId);

        setStatus(data?.process_status?.ambiguity_checker || "");
        setError(null);
      }

      // In fetchData function, replace the line where setAmbiguities is called
      if (data?.process_status?.ambiguity_checker === "pending") {
        setAmbiguities((prevAmbiguities) => {
          const newAmbiguities = data.ambiguities || {};

          return Object.entries(newAmbiguities).reduce((acc, [category, newItems]) => {
            // Keep previous ambiguities if they exist
            const prevCategoryItems = prevAmbiguities[category] || [];

            // Convert previous items into a Map for quick lookup
            const prevItemMap = new Map(
              prevCategoryItems.map((prevItem) => [prevItem.content, prevItem])
            );

            // Merge: Retain existing items, add new ones
            const mergedItems = [...prevCategoryItems];

            newItems.forEach((newItem: any) => {
              if (!prevItemMap.has(newItem.content)) {
                mergedItems.push({ ...newItem, status: false }); // Default status if new
              }
            });

            acc[category] = mergedItems;
            return acc;
          }, { ...prevAmbiguities }); // Preserve all previous categories
        });
      }


      if (data?.process_status?.ambiguity_checker === "refined") {
        setAcceptanceCriteria(data?.acceptance_criteria || []);
        setAssumption(data?.assumptions || []);
        setRefinedStory(data?.refined || "");
        // const score = await investScoringCheck(data?.refined || "")
        // setInvestScore(score?.output[0] === 0.9 ? 1 : score?.output[0]);
      }

      pollingRef.current = Math.min(pollingRef.current * 2, 30000);
    } catch (error) {
      console.error("Fetch error:", error);
      setError((error as Error).message);

      if (toast.current) {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to fetch data",
          life: 3000,
        });
      }
    }
  };

  // Polling function with exponential backoff
  const poll = async () => {
    if (isPolling) {
      await fetchData(); // Fetch data
      setTimeout(poll, pollingRef.current);
    }
  };

  // Start polling on component mount
  useEffect(() => {
    poll(); // Start polling

    return () => {
      // Stop polling when the component unmounts
      setIsPolling(false);
    };
  }, [isPolling]);

  console.log(data, 'new')
  useEffect(() => {
    if (status) {
      console.log("Status changed:", status);
      fetchData();
    }
  }, [status]);

  // const copyToClipboard = (text: string, index: number) => {
  //     navigator.clipboard.writeText(text).then(() => {
  //         setTimeout(() => setCopiedIndex(null), 2000); // Reset copied state after 2 seconds
  //     });
  //     setCopiedIndex(index); // Mark this item as copied
  // };

  const copyAllToClipboard = () => {
    const sections = [];

    if (userStory) {
      sections.push(`USER STORY:\n${userStory}`);
    }

    if (context) {
      sections.push(`CONTEXT:\n${context}`);
    }

    if (refinedStoryState) {
      sections.push(`REFINED USER STORY:\n${refinedStoryState}`);
    }

    if (acceptanceCriteria) {
      const criteriaList = acceptanceCriteria?.length > 0
        ? acceptanceCriteria?.map((c, i) => `${i + 1}. ${c}`).join('\n')
        : 'No Acceptance Criteria available';
      sections.push(`ACCEPTANCE CRITERIA:\n${criteriaList}`);
    }

    if (assumption) {
      const assumptionsList = assumption?.length > 0
        ? assumption.map((a, i) => `${i + 1}. ${a}`).join('\n')
        : 'No assumptions available';
      sections.push(`ASSUMPTIONS:\n${assumptionsList}`);
    }

    if (ambiguities && Object.keys(ambiguities).length > 0) {
      const ambiguitySections = Object.entries(ambiguities).map(([category, items]) => {
        const formattedItems = items.length > 0
          ? items.map((item, i) => `${i + 1}. ${item.val}`).join('\n')
          : 'No ambiguities in this category';

        return `CATEGORY: ${category.toUpperCase()}\n${formattedItems}`;
      });

      sections.push(`AMBIGUITIES:\n${ambiguitySections.join('\n\n')}`);
    } else {
      sections.push("AMBIGUITIES:\nNo ambiguities found.");
    }


    const textToCopy = sections.join('\n\n');

    navigator.clipboard.writeText(textToCopy).then(() => {
      if (toast.current) {
        toast.current.show({
          severity: "success",
          summary: "Copied",
          detail: "All data copied to clipboard!",
          life: 3000,
        });
      }
    }).catch((error) => {
      console.error('Copy failed:', error);
      if (toast.current) {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to copy to clipboard",
          life: 3000,
        });
      }
    });
  };

  const tutorialSteps = [
    {
      target: ".selectAllCheckBox",
      content:
        "Select This checkbox to consider all Ambiguities for Refinement of Story",
      placement: "top",
    },
    // {
    //   target: ".ambiguity-checkbox",
    //   content: "You can also individually Select Ambiguities you want to Consider For Refinement of Story",
    //   placement: "top"
    // },
    {
      target: ".refine-button",
      content:
        "Then Click on the Refine Button to Generate Refined User Story Based on your Selected Ambiguities",
      placement: "top",
    },
  ];

  const handleJoyrideCallback = (data: { status: string; index: number }) => {
    const { status, index } = data;

    // Turn off tutorial when finished or skipped
    if (status === "finished" || status === "skipped") {
      setTutorialRun(false);
    }

    // Dynamically control scrolling behavior
    if (index >= 1) {
      setDisableScrolling(false); // Enable scrolling after step 2
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    if (navigator.clipboard && window.isSecureContext) {
      // Modern browser with clipboard support
      navigator.clipboard.writeText(text).then(() => {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      });
    } else {
      // Fallback for insecure context or unsupported browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed"; // Prevent scrolling to bottom
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();

      try {
        document.execCommand("copy"); // Fallback method
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      } catch (err) {
        console.error("Fallback: Copy failed", err);
      } finally {
        document.body.removeChild(textArea);
      }
    }
  };

  // const copyToClipboardAssumptions = () => {
  //   if (assumptions?.length > 0) {
  //     const assumptionsText = assumptions.join("\n"); // Combine all assumptions
  //     navigator.clipboard.writeText(assumptionsText); // Copy to clipboard
  //     setIsCopied(true);
  //     setTimeout(() => setIsCopied(false), 2000);
  //     // Optional: Toast notification for feedback
  //     toast.success("Assumptions copied to clipboard!", {
  //       position: "top-right",
  //       autoClose: 2000,
  //     });
  //   } else {
  //     toast.info("No assumptions to copy!", {
  //       position: "top-right",
  //       autoClose: 2000,
  //     });
  //   }
  // };

  // const handleRefine = async () => {
  //     const updatedAmbiguities = ambiguities; // Use the current state of ambiguities
  //     const userStoryData = {
  //         _id,
  //         story: initialUserStory,
  //         context: initialContext,
  //         ambiguities: updatedAmbiguities,
  //         acceptance_criteria,
  //         assumptions,
  //         refined: refinedStory,
  //         process_status,
  //          // Include updated ambiguities
  //     };

  //     toast.current.show({ severity: 'success', summary: 'Success', detail: 'Story Sent with the Ambiguities', life: 3000 });

  //     try {
  //         await refineUserStory(userStoryData); // Pass userStoryData instead of ambStory
  //     } catch (error) {
  //         console.error("Failed to refine user story:", error);
  //         toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to generate Refined user story', life: 3000 });
  //     } finally {
  //         window.history.back();
  //     }
  // };

  const handleSaveAmbiguity = () => {
    if (newAmbiguity.trim() !== "" && editingCategory) {
      const updatedAmbiguities = { ...ambiguities };
      updatedAmbiguities[editingCategory]?.push({
        val: newAmbiguity,
        status: false,
      });
      setNewAmbiguity("");
      setEditingCategory(null);
      setAmbiguities(updatedAmbiguities);
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Ambiguity Added Successfully",
        life: 3000,
      });
    }
  };

  const handleSaveAcceptanceCriteria = async () => {
    if (inputValue.trim().length > 0) {
      const newCriteria = inputValue.trim();
  
      const updatedManualAC = [...manualAcceptanceCriteria, newCriteria];
  
      try {
        await updateStory({
          ...data,
          manual_acceptance_criteria: updatedManualAC,
        });
  
        setManualAcceptanceCriteria(updatedManualAC);
        setNewAcceptanceCriteria([]);
        setAcEditing(false);
        setInputValue("");
  
        setTimeout(() => {
          fetchData();
        }, 500);
  
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "Acceptance Criteria Added Successfully",
          life: 3000,
        });
      } catch (error) {
        toast.current.show({
          severity: "error",
          summary: "Cannot Add",
          detail: error?.message,
          life: 5000,
        });
      }
    }
  };
  
  

  const handleSaveAssumptions = () => {
    if (inputValue.length > 0) {
      const updatedAssumptions = [...assumption, inputValue.trim()];
      setAcceptanceCriteria(updatedAssumptions);
  
      updateUserStory({ ...data, assumptions: updatedAssumptions});
      setTimeout(() => {
        fetchData();
      }, 500);
  
      setAssumptionsEditing(false);
      setInputValue("");
  
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Assumptions Added Successfully",
        life: 3000,
      });
    }
  };

  const handleSaveStory = () => {
    if (inputValue.length > 0) {
      const updatedStory = `${inputValue.trim()}`;
      setUserStory(updatedStory);
  
      updateUserStory({ ...data, story: updatedStory });
      setTimeout(() => {
        fetchData();
      }, 500);
  
      setStoryEditing(false);
      setInputValue("");
  
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "User Story Updated Successfully",
        life: 3000,
      });
    }
  };
  
  
  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setNewAmbiguity(e.currentTarget.value);
  };

  const handleACInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.currentTarget.value);
  };

  const handleAssumptionsInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.currentTarget.value);
  };

  const handleStoryInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.currentTarget.value);
  };

  const handleACKeyDown = async (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevents new line in textarea
      if (inputValue.length > 0) {
        const newCriteria = inputValue.trim();
        const updatedManualAC = [...manualAcceptanceCriteria, newCriteria]

        try {
        await updateStory({ 
          ...data, 
          manualAcceptanceCriteria: updatedManualAC,
         });

        setManualAcceptanceCriteria(updatedManualAC);
        setNewAcceptanceCriteria([]);
        setAcEditing(false);
        setInputValue("");
        
        setTimeout(() => {
          fetchData();
        }, 500);
        
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "Acceptance Criteria Added Successfully",
          life: 3000,
        });
      } catch (error) {
        toast.current.show({
          severity: "error",
          summary: "Cannot Add",
          detail: error?.message,
          life: 5000,
        });
      }
      } 
    }
  };

  const handleStoryKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevents new line in textarea
      if (inputValue.length > 0) {
        const updatedStory = `${inputValue.trim()}`;
        setUserStory(updatedStory);
    
        updateUserStory({ ...data, story: updatedStory });
        setTimeout(() => {
          fetchData();
        }, 500);
    
        setStoryEditing(false);
        setInputValue("");
    
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "User Story Updated Successfully",
          life: 3000,
        });
      }
    }
  };

  const handleAssumptionsKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevents new line in textarea
      if (inputValue.length > 0) {
        const updatedAssumptions = [...assumption, inputValue.trim()];
        setAcceptanceCriteria(updatedAssumptions);
    
        updateUserStory({ ...data, assumptions: updatedAssumptions});
        setTimeout(() => {
          fetchData();
        }, 500);
    
        setAssumptionsEditing(false);
        setInputValue("");
    
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "Assumptions Added Successfully",
          life: 3000,
        });
      }
    }
  };

  const handleAmbiguitySelectionChange = (
    category: string,
    index: number,
    checked: boolean,
  ) => {
    const updatedAmbiguities = { ...ambiguities };
    updatedAmbiguities[category][index].status = checked;
    setAmbiguities(updatedAmbiguities);
    checkIfAnySelected(updatedAmbiguities);
  };

  const checkIfAnySelected = (updatedAmbiguities: typeof ambiguities) => {
    const anySelected = Object.values(updatedAmbiguities).some((items) =>
      items.some((item) => item.status),
    );
    setIsAnyCheckboxSelected(anySelected);
  };

  const handleCardSelectionChange = (category: string, checked: boolean) => {
    const updatedAmbiguities = { ...ambiguities };
    updatedAmbiguities[category] = updatedAmbiguities[category]?.map(
      (item) => ({ ...item, status: checked }),
    );
    setAmbiguities(updatedAmbiguities);
  };

  const handleSelectAll = (checked: boolean) => {
    const updatedAmbiguities = Object.fromEntries(
      Object.entries(ambiguities)?.map(([category, items]) => [
        category,
        items?.map((item) => ({ ...item, status: checked })),
      ]),
    );
    setAmbiguities(updatedAmbiguities);
    checkIfAnySelected(updatedAmbiguities);
  };

  const handleProcessUserStories = async () => {
    try {
      const unwantedKeys = ['manual_acceptance_criteria', 'ambiguities'];
  
      const storyToSend = [data].map(story => {
        const cleaned = { ...story };
        unwantedKeys.forEach(key => delete cleaned[key]);
        return cleaned;
      });
  
      await processAllUserStories(storyToSend);
      fetchData();
  
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
  


  // const cardHeader = (
  //   <button
  //     style={{ backgroundColor: "#BA0000" }}
  //     className="px-6 py-3 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none transition duration-300 ease-in-out transform hover:scale-105"
  //     onClick={() => setShowModal(true)}
  //   >
  //     View Ambiguities
  //   </button>
  // );

  const [showConfirm, setShowConfirm] = useState(false);
  const handleConfirm = () => {
    setShowConfirm(false); // Close popup
    handleProcessUserStories(); // Call the function
  };

  console.log(status, 'status')

  const handleAddAmbiguityClick = (category: string) => {
    setEditingCategory(category);
  };

  const handleAddAcClick = (category: boolean) => {
    setAcEditing(!category);
  };

  const handleAddAssumptionsClick = (category: boolean) => {
    setAssumptionsEditing(!category);
  };

  const handleAddStoryClick = (category: boolean) => {
    setStoryEditing(!category);
  };


  const generateMarkdown = () => {
    const data = {
      _id: _id ?? "",
      story: initialUserStory ?? "",
      context: context ?? "",
      ambiguities: ambiguities ?? [],
      acceptance_criteria: acceptanceCriteria ?? [],
      manual_acceptance_criteria: manual_acceptance_criteria ?? [],
      assumptions: assumption ?? [],
      refined: refinedStoryState ?? "",
      // process_status: process_status ?? "pending",
      // test_scenarios: ambStory?.test_scenarios ?? { data: [] }, // Ensure test_scenarios exists
    };

    let markdownContent = `## User Story\n${data.story}\n\n`;

    if (refinedStoryState.length > 0) {
    markdownContent += `#### Refined Story\n${data.refined}\n\n`;
    }

    if (assumption.length > 0) {
      markdownContent += `#### Assumptions\n`;
      data.assumptions.forEach((assumption, index) => {
        markdownContent += `${index + 1}. ${assumption}\n`;
      });
      markdownContent += `\n`;
    }

    if (acceptanceCriteria.length > 0) {
      markdownContent += `#### Acceptance Criteria\n`;
      data.acceptance_criteria.forEach((criteria, index) => {
        markdownContent += `${index + 1}. ${criteria}\n`;
      });
      markdownContent += `\n`;
    }

    if (data.ambiguities && Object.keys(data.ambiguities).length > 0) {
      const ambiguitySections = Object.entries(data.ambiguities).map(([category, items]) => {
        const formattedItems = items.length > 0
          ? items.map((item, i) => `${i + 1}. ${item.val}`).join('\n')
          : 'No ambiguities in this category';

        return `### ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n${formattedItems}`;
      });

      markdownContent += `#### Ambiguities\n\n${ambiguitySections.join('\n\n')}\n`;
    }


    // if (ambiguities.length > 0) {
    //   markdownContent += `#### Ambiguities\n`;
    //   data.ambiguities.forEach((criteria, index) => {
    //     markdownContent += `${index + 1}. ${criteria}\n`;
    //   });
    //   markdownContent += `\n`;
    // }

    //markdownContent += `## Mind Maps\n\n`;
    //markdownContent += `Generated mind maps related to this user story and test scenarios.\n\n`;

    return markdownContent;
  };

  const downloadPDF = () => {
    const markdownContent = generateMarkdown(); // Get Markdown content
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
  
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
  
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    let y = 55; // Start text after header & separator
  
    // Load and position the logo (preserving aspect ratio)
    const imgWidth = 15;
    const imgHeight = 15;
    doc.addImage(logo2, "PNG", 15, 10, imgWidth, imgHeight); // Top-left logo
  
    // Add "Qualizen - Kill Ambiguity" title at center with red color
    doc.setFont("helvetica", "bold");
    doc.setTextColor(186, 0, 0); // Red color (#BA0000)
    doc.setFontSize(18);
    const title = "Qualizen - Kill Ambiguity";
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - titleWidth) / 2, 20);
  
    // Reset font color to black for content
    doc.setTextColor(0, 0, 0);
  
    // Draw separator line below the title
    doc.setDrawColor(150); // Grey color
    doc.setLineWidth(0.5);
    doc.line(10, 30, pageWidth - 10, 30); // Draw a horizontal line
  
    // Function to add text with formatting
    const addText = (text, isBold = false, size = 12, indent = 0, isHeading = false) => {
      if (isBold) doc.setFont("helvetica", "bold");
      else doc.setFont("helvetica", "normal");
  
      if (isHeading) {
        doc.setTextColor(186, 0, 0); // Red color for headings
      } else {
        doc.setTextColor(0, 0, 0); // Black for normal text
      }
  
      doc.setFontSize(size);
      const lines = doc.splitTextToSize(text, 180 - indent);
  
      lines.forEach((line) => {
        if (y + 7 > pageHeight) {
          doc.addPage();
          y = 20; // Reset y for new page after header
        }
        doc.text(line, 15 + indent, y);
        y += 7; // Move down for the next line
      });
  
      y += 4; // Extra space for readability
    };
  
    // Process Markdown content with red headings
    const lines = markdownContent.split("\n");
    lines.forEach((line) => {
      if (line.startsWith("# ")) {
        addText(line.replace("# ", ""), true, 16, 0, true); // H1
      } else if (line.startsWith("## ")) {
        addText(line.replace("## ", ""), true, 14, 0, true); // H2
      } else if (line.startsWith("### ")) {
        addText(line.replace("### ", ""), true, 13, 0, true); // H3
      } else if (line.startsWith("#### ")) {
        addText(line.replace("#### ", ""), true, 12, 0, true); // H4
      } else if (line.startsWith("###### ")) {
        addText(line.replace("###### ", ""), true, 12, 0, true); // H6
      } else if (line.startsWith("**") && line.endsWith("**")) {
        addText(line.replace(/\*\*/g, ""), true, 12, 0, false); // Bold Text
      } else {
        addText(line, false, 12); // Regular text
      }
    });
  
    doc.save("User_Story.pdf"); // Save the PDF
  };
  
  


  return (
    <PrimeReactProvider value={{ unstyled: true, pt: Tailwind, ptOptions: { mergeSections: true, mergeProps: true, classNameMergeFunction: twMerge } }}>
      <div className="bg-[#f1f1f1] min-h-screen">
        <div className="container mx-auto p-8 min-h-screen"> {/*p-6 w-full mt-[50px]*/}
          <Joyride
            steps={tutorialSteps}
            run={tutorialRun}
            continuous
            scrollToFirstStep
            showProgress
            disableScrolling={disableScrolling}
            showSkipButton
            styles={{
              options: {
                zIndex: 0,
              },
            }}
            callback={handleJoyrideCallback}
          />
          <div className="flex flex-col sm:flex-row items-center justify-between w-full">
            {window.innerWidth >= 768 && (
              <button
                style={{ backgroundColor: "#BA0000", color: "white" }}
                onClick={() => window.history.back()}
                className="text-xs p-button-success p-2 bg-indigo-800 rounded-md text-white mb-2 sm:mb-0"
              >
                ← Go Back
              </button>
            )}

            <div className="flex items-center flex-1 justify-center space-x-2 mb-2 sm:mb-0">
              <button
                onClick={() => {
                  sessionStorage.setItem("userStory", JSON.stringify(data));
                  localStorage.setItem("name", "Test Scenarios");
                  window.location.href = "/dashboard";
                }}
                className="px-4 py-2 text-red-700 text-sm font-semibold rounded-lg transition duration-200 hover:bg-red-100 hover:text-red-900"
              >
                {window.innerWidth < 768 ? <span className="text-3xl">←</span> : <div className="items-center flex gap-2"><span className="text-lg">←</span> <span> Test Scenarios </span> </div>}
              </button>
              <p className="text-md font-extrabold text-center">Kill Ambiguity</p>
              <span
                className={`w-3 h-3 rounded-full ${status === "new"
                  ? "bg-red-500"
                  : status === "pending"
                    ? "bg-amber-500"
                    : status === "refined"
                      ? "bg-green-500"
                      : "bg-gray-400"
                  }`}
              ></span>
              <button
                onClick={() => {
                  sessionStorage.setItem("userStory", JSON.stringify(data));
                  localStorage.setItem("name", "Mind Maps");
                  window.location.href = "/dashboard";
                }}
                className="px-4 py-2 text-red-700 text-sm font-semibold rounded-lg transition duration-200 hover:bg-red-100 hover:text-red-900"
              >
                {window.innerWidth < 768 ? (
                  <span className="text-3xl">→</span>
                ) : (
                  <div className="items-center flex gap-2">
                    <span>Mind Maps </span> <span className="text-lg">→</span>
                  </div>
                )}
              </button>
            </div>
            {window.innerWidth >= 768 && (
              <div className="flex flex-row space-x-2">
                <Button
                  label="Download"
                  icon="pi pi-download"
                  style={{ backgroundColor: "#BA0000", color: "white" }}
                  size="small"
                  className="text-xs p-button-success p-2 bg-red-800 rounded-md text-white"
                  onClick={() => downloadPDF()}
                  // disabled={!refinedStoryState}
                />
                <button
                  onClick={copyAllToClipboard}
                  style={{ backgroundColor: "#BA0000", color: "white" }}
                  className="text-xs p-button-success p-2 bg-indigo-800 rounded-md text-white"
                >
                  <i className="pi pi-copy" />
                  Copy
                </button>
              </div>
            )}
          </div>
          <div style={{ marginTop: "10px" }}></div>
          <div className="rounded-xl shadow-lg bg-white p-4" style={{ border: "1px solid #fca5a5" }}>
            <Toast ref={toast} />


            {/* Original User Story Section */}
            <div className="mb-6">
              <div
                className="flex items-center cursor-pointer"
                onClick={() => setIsUserStoryExpanded(!isUserStoryExpanded)}
              >
                <div className="flex justify-between items-center w-full hover:bg-gray-100 p-2 rounded-md transition-colors duration-200">
                  <h2 className="text-md font-semibold mr-2">User Story</h2>
                  <i className={`pi pi-chevron-${isUserStoryExpanded ? 'up' : 'down'} text-gray-600 text-sm hover:text-indigo-600`} />
                </div>
              </div>

              {isUserStoryExpanded && (
                <>
                  {userStory && (
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-sm p-4 rounded-md flex-1" style={{ backgroundColor: "#fef2f2" }}>
                        {userStory}
                      </p>
                      {!storyEditing && (
                        <button
                          style={{ backgroundColor: "#BA0000", color: "white" }}
                          onClick={() => handleAddStoryClick(storyEditing)}
                          className="text-xs p-button-success p-2 bg-indigo-800 rounded-md text-white flex items-center ml-2"
                        >
                          <i className="pi pi-user-edit"></i>
                        </button>
                      )}
                    </div>
                  )}
                  {context && (
                    <div className="pt-4">
                      <p className="text-md font-semibold text-gray-800">
                        Context -{" "}
                        <span className="font-normal text-sm text-gray-600">{context}</span>
                      </p>
                    </div>
                  )}
                </>
              )}
                    {storyEditing === true ? (
                        <>
                          <div style={{ margin: "10px 0px" }}>
                            <InputTextarea
                              autoResize
                              className="rounded-xl shadow-black w-full mt-3"
                              placeholder="Enter your User Story"
                              value={inputValue}
                              onChange={handleStoryInputChange}
                              onKeyDown={handleStoryKeyDown} // Listen for Enter key
                              rows={2}
                            />
                          </div>
                          <div className="flex justify-between items-center">
                          <button
                            style={{ backgroundColor: "#BA0000", color: "white" }}
                            onClick={handleSaveStory}
                            className="text-xs p-button-success p-2 bg-indigo-800 rounded-md text-white"
                          >
                            Save
                          </button>
                          <button
                            style={{ backgroundColor: "#BA0000", color: "white" }}
                            onClick={() => handleAddStoryClick(storyEditing)}
                            className="text-xs p-button-success p-2 bg-indigo-800 rounded-md text-white"
                          >
                            <i className="pi pi-times"></i>
                          </button>
                          </div>
                        </>
                      ) : null}
                    </div>

                      {/* acceptance criteria */}
                      {status !== 'refined' && manual_acceptance_criteria?.length > 0 && (
                    <div className="mt-6 border-t">
                  <div className="relative">
                    <div
                      className="flex items-center cursor-pointer my-2"
                      onClick={() => setIsAcceptanceCriteriaExpanded(!isAcceptanceCriteriaExpanded)}
                    >
                      <div className="flex justify-between items-center w-full hover:bg-gray-100 p-2 rounded-md transition-colors duration-200">
                        <h3 className="text-md font-semibold mr-2">Acceptance Criteria</h3>
                        <i className={`pi pi-chevron-${isAcceptanceCriteriaExpanded ? 'up' : 'down'} text-gray-600 text-sm hover:text-indigo-600`} />
                      </div>


                      {(manual_acceptance_criteria?.length > 0 || manualAcceptanceCriteria?.length > 0) && isAcceptanceCriteriaExpanded && (
                        <div className="absolute top-0 right-0 bg-white border border-gray-300 rounded-lg shadow-md p-3">
                          <div className="flex flex-col items-start gap-2">
                            <span className="flex items-center space-x-2">
                              <span className="w-3 h-3 bg-black rounded-full"></span>
                              <span className="text-black text-xs">Model Generated ACs</span>
                            </span>
                            <span className="flex items-center space-x-2">
                              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                              <span className="text-blue-500 text-xs">User Entered ACs</span>
                            </span>
                          </div>
                        </div>
                      )}
                    </div>


                    {/* {isAcceptanceCriteriaExpanded && (
                      <ol className="list-decimal pl-2 space-y-4 text-black">
                        {acceptanceCriteria?.length > 0 ? (
                          acceptanceCriteria?.map((criteria, index) => {
                            const isManualCriteria = manual_acceptance_criteria?.includes(criteria);
                            return (
                              <li
                                key={index}
                                className={`flex items-start space-x-3 text-lg pl-2 ${isManualCriteria
                                  }`}
                                onClick={() => copyToClipboard(criteria, index)}
                                id={`list-item-${index}`}
                              >
                                <span className={isManualCriteria ? "text-blue-500 text-sm" : "text-black text-sm"}>
                                  {index + 1}.
                                </span>
                                <span className={`leading-snug ${isManualCriteria ? "text-blue-700 text-sm" : "text-black text-sm"}`}>
                                  {criteria}
                                </span>
                              </li>
                            );
                          })
                        ) : (
                          <li className="text-sm pl-2">
                            No Acceptance Criteria available
                          </li>
                        )}
                      </ol>
                    )} */}

{isAcceptanceCriteriaExpanded && (
  <ol className="list-decimal pl-2 space-y-4 text-black">
    {(acceptanceCriteria?.length > 0 || manualAcceptanceCriteria?.length > 0) ? (
      <>
        {acceptanceCriteria?.map((criteria, index) => (
          <li
            key={`ac-${index}`}
            className="flex items-start space-x-3 text-lg pl-2"
            onClick={() => copyToClipboard(criteria, index)}
            id={`list-item-${index}`}
          >
            <span className="text-black text-sm">{index + 1}.</span>
            <span className="leading-snug text-black text-sm">{criteria}</span>
          </li>
        ))}

        {manualAcceptanceCriteria?.map((criteria, i) => {
          const index = acceptanceCriteria.length + i;
          return (
            <li
              key={`manual-${i}`}
              className="flex items-start space-x-3 text-lg pl-2"
              onClick={() => copyToClipboard(criteria, index)}
              id={`list-item-${index}`}
            >
              <span className="text-blue-500 text-sm">{index + 1}.</span>
              <span className="leading-snug text-blue-700 text-sm">{criteria}</span>
            </li>
          );
        })}
      </>
    ) : (
      <li className="text-sm pl-2">
        No Acceptance Criteria available
      </li>
    )}
  </ol>
)}


                        {acEditing === true ? (
                        <>
                          <div style={{ margin: "10px 0px" }}>
                            <InputTextarea
                              autoResize
                              className="rounded-xl shadow-black w-full mt-3"
                              placeholder="Enter new Acceptance Criteria"
                              value={inputValue}
                              onChange={handleACInputChange}
                              onKeyDown={handleACKeyDown} // Listen for Enter key
                              rows={2}
                            />
                          </div>
                          <div className="flex justify-between">
                          <button
                            style={{ backgroundColor: "#BA0000", color: "white" }}
                            onClick={handleSaveAcceptanceCriteria}
                            className="text-xs p-button-success p-2 bg-indigo-800 rounded-md text-white"
                          >
                            Save
                          </button>
                          <button
                            style={{ backgroundColor: "#BA0000", color: "white" }}
                            onClick={() => handleAddAcClick(acEditing)}
                            className="text-xs p-button-success p-2 bg-indigo-800 rounded-md text-white"
                          >
                            <i className="pi pi-times"></i>
                          </button>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-end mt-3">
                          <button
                            style={{ backgroundColor: "#BA0000", color: "white" }}
                            onClick={() => handleAddAcClick(acEditing)}
                            disabled={status === "processing"}
                            className="text-xs p-button-success p-2 bg-indigo-800 rounded-md text-white flex items-center"
                          >
                            <i className="pi pi-plus"></i>
                          </button>

                        </div>
                      )}
                  </div>
                </div>
                      )}
            {status === "refined" ? (
              <>
                {/* Refined User Story Section */}
                <div className="mt-6 border-t">
  <div
    className="flex items-center cursor-pointer my-2"
    onClick={() => setIsRefinedStoryExpanded(!isRefinedStoryExpanded)}
  >
    <div className="flex justify-between items-center w-full hover:bg-gray-100 p-2 rounded-md transition-colors duration-200">
      <div className="flex items-center gap-2">
        <h2 className="text-md font-semibold">Refined User Story</h2>
        
        {/* Invest Score Badge */}
        {/* {investScore !== undefined && investScore !== null ? (
          <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded-lg">
            Invest Score: {(investScore * 100).toFixed(0)}%
          </span>
        ) : (
          <span className="text-xs text-gray-500">No Score</span>
        )} */}
                <ScoreBadge 
            evaluation_status={evaluationStatus}
            evaluation={refinedEvaluation} 
            storyId={storyId} 
        />
      </div>

      <i className={`pi pi-chevron-${isRefinedStoryExpanded ? 'up' : 'down'} text-gray-600 text-sm hover:text-indigo-600`} />
    </div>
  </div>

  {isRefinedStoryExpanded && refinedStoryState && (
    <p className="text-sm p-4 bg-indigo-50 rounded-md mt-2" style={{ backgroundColor: "#fef2f2" }}>
      {refinedStoryState}
    </p>
  )}
</div>


                {/* Acceptance Criteria Section */}
                <div className="mt-6 border-t">
                  <div className="relative">
                    <div
                      className="flex items-center cursor-pointer my-2"
                      onClick={() => setIsAcceptanceCriteriaExpanded(!isAcceptanceCriteriaExpanded)}
                    >
                      <div className="flex justify-between items-center w-full hover:bg-gray-100 p-2 rounded-md transition-colors duration-200">
                        <h3 className="text-md font-semibold mr-2">Acceptance Criteria</h3>
                        <i className={`pi pi-chevron-${isAcceptanceCriteriaExpanded ? 'up' : 'down'} text-gray-600 text-sm hover:text-indigo-600`} />
                      </div>


                      {(manual_acceptance_criteria?.length > 0 || manualAcceptanceCriteria?.length > 0) && isAcceptanceCriteriaExpanded && (
                        <div className="absolute top-0 right-0 bg-white border border-gray-300 rounded-lg shadow-md p-3">
                          <div className="flex flex-col items-start gap-2">
                            <span className="flex items-center space-x-2">
                              <span className="w-3 h-3 bg-black rounded-full"></span>
                              <span className="text-black text-xs">Model Generated ACs</span>
                            </span>
                            <span className="flex items-center space-x-2">
                              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                              <span className="text-blue-500 text-xs">User Entered ACs</span>
                            </span>
                          </div>
                        </div>
                      )}
                    </div>


                    {/* {isAcceptanceCriteriaExpanded && (
                      <ol className="list-decimal pl-2 space-y-4 text-black">
                        {acceptanceCriteria?.length > 0 ? (
                          acceptanceCriteria?.map((criteria, index) => {
                            const isManualCriteria = manual_acceptance_criteria?.includes(criteria);
                            return (
                              <li
                                key={index}
                                className={`flex items-start space-x-3 text-lg pl-2 ${isManualCriteria
                                  }`}
                                onClick={() => copyToClipboard(criteria, index)}
                                id={`list-item-${index}`}
                              >
                                <span className={isManualCriteria ? "text-blue-500 text-sm" : "text-black text-sm"}>
                                  {index + 1}.
                                </span>
                                <span className={`leading-snug ${isManualCriteria ? "text-blue-700 text-sm" : "text-black text-sm"}`}>
                                  {criteria}
                                </span>
                              </li>
                            );
                          })
                        ) : (
                          <li className="text-sm pl-2">
                            No Acceptance Criteria available
                          </li>
                        )}
                      </ol>
                    )} */}

{isAcceptanceCriteriaExpanded && (
  <ol className="list-decimal pl-2 space-y-4 text-black">
    {(acceptanceCriteria?.length > 0 || manualAcceptanceCriteria?.length > 0) ? (
      <>
        {acceptanceCriteria?.map((criteria, index) => (
          <li
            key={`ac-${index}`}
            className="flex items-start space-x-3 text-lg pl-2"
            onClick={() => copyToClipboard(criteria, index)}
            id={`list-item-${index}`}
          >
            <span className="text-black text-sm">{index + 1}.</span>
            <span className="leading-snug text-black text-sm">{criteria}</span>
          </li>
        ))}

        {manualAcceptanceCriteria?.map((criteria, i) => {
          const index = acceptanceCriteria.length + i;
          return (
            <li
              key={`manual-${i}`}
              className="flex items-start space-x-3 text-lg pl-2"
              onClick={() => copyToClipboard(criteria, index)}
              id={`list-item-${index}`}
            >
              <span className="text-blue-500 text-sm">{index + 1}.</span>
              <span className="leading-snug text-blue-700 text-sm">{criteria}</span>
            </li>
          );
        })}
      </>
    ) : (
      <li className="text-sm pl-2">
        No Acceptance Criteria available
      </li>
    )}
  </ol>
)}


                        {acEditing === true ? (
                        <>
                          <div style={{ margin: "10px 0px" }}>
                            <InputTextarea
                              autoResize
                              className="rounded-xl shadow-black w-full mt-3"
                              placeholder="Enter new Acceptance Criteria"
                              value={inputValue}
                              onChange={handleACInputChange}
                              onKeyDown={handleACKeyDown} // Listen for Enter key
                              rows={2}
                            />
                          </div>
                          <div className="flex justify-between">
                          <button
                            style={{ backgroundColor: "#BA0000", color: "white" }}
                            onClick={handleSaveAcceptanceCriteria}
                            className="text-xs p-button-success p-2 bg-indigo-800 rounded-md text-white"
                          >
                            Save
                          </button>
                          <button
                            style={{ backgroundColor: "#BA0000", color: "white" }}
                            onClick={() => handleAddAcClick(acEditing)}
                            className="text-xs p-button-success p-2 bg-indigo-800 rounded-md text-white"
                          >
                            <i className="pi pi-times"></i>
                          </button>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-end mt-3">
                          <button
                            style={{ backgroundColor: "#BA0000", color: "white" }}
                            onClick={() => handleAddAcClick(acEditing)}
                            className="text-xs p-button-success p-2 bg-indigo-800 rounded-md text-white flex items-center"
                          >
                            <i className="pi pi-plus"></i>
                          </button>

                        </div>
                      )}
                  </div>
                </div>

                {/* Assumptions Section */}
                <div className="mt-6 border-t">
                  <div
                    ref={cardTitleRef}
                    className="flex items-center justify-start cursor-pointer my-2"
                    onClick={(e) => {
                      // copyToClipboardAssumptions(e);
                      setIsAssumptionsExpanded(!isAssumptionsExpanded);
                    }}
                  >
                    <div className="flex justify-between items-center w-full hover:bg-gray-100 p-2 rounded-md transition-colors duration-200">
                      <h3 className="text-md font-semibold">Assumptions</h3>
                      <i className={`pi pi-chevron-${isAssumptionsExpanded ? 'up' : 'down'} text-gray-600 ml-2 text-sm hover:text-indigo-600`} />
                    </div>


                    {/* <i className="pi pi-copy text-gray-600 hover:text-gray-800 ml-2" /> */}
                  </div>
                  {/*   
  <Tooltip
    target={cardTitleRef}
    content={isCopied ? "Copied to clipboard!" : "Copy Assumptions to clipboard"}
    position="top"
  /> */}

                  {isAssumptionsExpanded && (
                    <ol className="list-decimal pl-8 space-y-4 text-black">
                      {assumption?.length > 0 ? (
                        assumption.map((assumption, index) => (
                          <li key={index} className="text-sm pl-2">
                            {assumption}
                          </li>
                        ))
                      ) : (
                        <li className="text-sm pl-2">No assumptions available</li>
                      )}
                    </ol>
                  )}
                                          {assumptionsEditing === true ? (
                        <>
                          <div style={{ margin: "10px 0px" }}>
                            <InputTextarea
                              autoResize
                              className="rounded-xl shadow-black w-full mt-3"
                              placeholder="Enter new Acceptance Criteria"
                              value={inputValue}
                              onChange={handleAssumptionsInputChange}
                              onKeyDown={handleAssumptionsKeyDown} // Listen for Enter key
                              rows={2}
                            />
                          </div>
                          <div className="flex justify-between">
                          <button
                            style={{ backgroundColor: "#BA0000", color: "white" }}
                            onClick={handleSaveAssumptions}
                            className="text-xs p-button-success p-2 bg-indigo-800 rounded-md text-white"
                          >
                            Save
                          </button>
                          <button
                            style={{ backgroundColor: "#BA0000", color: "white" }}
                            onClick={() => handleAddAssumptionsClick(assumptionsEditing)}
                            className="text-xs p-button-success p-2 bg-indigo-800 rounded-md text-white"
                          >
                            <i className="pi pi-times"></i>
                          </button>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-end mt-3">
                          <button
                            style={{ backgroundColor: "#BA0000", color: "white" }}
                            onClick={() => handleAddAssumptionsClick(assumptionsEditing)}
                            className="text-xs p-button-success p-2 bg-indigo-800 rounded-md text-white flex items-center"
                          >
                            <i className="pi pi-plus"></i>
                          </button>

                        </div>
                      )}
                </div>

<div className="mt-[20px]"></div>
                <AmbiguitiesPanel data={data} />

                {
                  status === "refined" && (
                    <div className="flex justify-start mt-5">
                      {/* <Button
                      label="Regenerate Ambiguties"
                      icon="pi pi-check"
                      className="process-button p-button-success p-2 bg-indigo-800 rounded-md text-white"
                      size="small"
                      onClick={handleProcessUserStories}
                      style={{ backgroundColor: "#BA0000", color: "white" }}
                      // onClick={}
                      disabled={false}

                    /> */}
                      {/* <button
                        style={{ backgroundColor: "#BA0000", color: "white" }}
                        onClick={handleProcessUserStories}
                        className="text-xs p-button-success p-2 bg-indigo-800 rounded-md text-white"
                      >
                        Identify Ambiguties
                      </button> */}

                      <Button
                        style={{ backgroundColor: "#BA0000", color: "white" }}
                        label={status === "refined" ? "Retry Refinement" : "Refine"}
                        // icon="pi pi-save"
                        size="small"
                        className="refine-button p-button-success p-2 bg-indigo-800 rounded-md text-white mb-20 mr-10"
                        onClick={handleRetryRefine}
                        disabled={!isAnyCheckboxSelected && (status === "pending")}
                      />
                    </div>
                  )}
              </>
            ) : (
              <>
                {
                  status === "pending" ? (
                    <div className="flex justify-between items-center">
                                              <Button
                          style={{ backgroundColor: "#BA0000", color: "white" }}
                          label="Refine"
                          // icon="pi pi-save"
                          size="small"
                          className="refine-button p-button-success p-2 bg-indigo-800 rounded-md text-white mb-20 mr-10"
                          onClick={handleRefine}
                          disabled={!isAnyCheckboxSelected}
                        />
                      {/* Your existing checkbox section */}
                      <div>
                      <input
                        type="checkbox"
                        id="selectAll"
                        checked={Object.values(ambiguities || {}).every((items) =>
                          items.every((item) => item.status),
                        )}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="selectAllCheckBox mr-2 checkbox-bordered"
                      />
                      <label htmlFor="selectAll">Select All</label>
                      </div>
                    </div>
                  ) : status === "new" ? (
                    <button
                      className="process-button p-button-success p-2 text-sm bg-indigo-800 rounded-md text-white"
                      style={{ backgroundColor: "#BA0000", color: "white" }}
                      onClick={handleProcessUserStories}
                      disabled={false}
                    >
                      <span className="text-sm">Identify Ambiguities</span>
                    </button>
                  ) : null // Hide everything for other statuses
                }




                {status === "pending" &&
                  Object.entries(ambiguities || {}).map(([category, items]) => (
                    <div key={category} className="my-5 rounded-lg p-4 shadow-md">
                      <h3 className="text-md mb-4 font-semibold">
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </h3>
                      <ul className="space-y-3">
                        {items?.map((item, index) => (
                          <li key={index} className="flex text-sm items-center mb-2">
                            <input
                              type="checkbox"
                              id={`${category}-${index}`}
                              checked={item.status}
                              onChange={(e) =>
                                handleAmbiguitySelectionChange(category, index, e.target.checked)
                              }
                              className="ambiguity-checkbox text-sm mr-2 checkbox-bordered"
                            />
                            <label htmlFor={`${category}-${index}`}>{item.val}</label>
                          </li>
                        ))}
                      </ul>
                      {editingCategory === category ? (
                        <>
                          <div style={{ margin: "10px 0px" }}>
                            <InputTextarea
                              autoResize
                              className="rounded-xl shadow-black w-full mt-3"
                              placeholder="Enter new ambiguity"
                              value={newAmbiguity}
                              onChange={handleInputChange}
                              rows={2}
                            />
                          </div>
                          <button
                            style={{ backgroundColor: "#BA0000", color: "white" }}
                            onClick={handleSaveAmbiguity}
                            className="text-xs p-button-success p-2 bg-indigo-800 rounded-md text-white"
                          >
                            Save
                          </button>
                        </>
                      ) : (
                        <div className="flex justify-end mt-3">
                          <button
                            style={{ backgroundColor: "#BA0000", color: "white" }}
                            onClick={() => handleAddAmbiguityClick(category)}
                            className="text-xs p-button-success p-2 bg-indigo-800 rounded-md text-white flex items-center"
                          >
                            <i className="pi pi-plus"></i>
                          </button>

                        </div>
                      )}
                    </div>
                  ))
                }


                <div className="flex justify-between items-center">
                  {
                    status === "pending" && (
                      <div className="flex w-full justify-between mt-5">
                        {/* <Button
                          style={{ backgroundColor: "#BA0000", color: "white" }}
                          label="Refine"
                          // icon="pi pi-save"
                          size="small"
                          className="refine-button p-button-success p-2 bg-indigo-800 rounded-md text-white mb-20 mr-10"
                          onClick={handleRefine}
                          disabled={!isAnyCheckboxSelected}
                        /> */}
                        <button
                          style={{ backgroundColor: "#BA0000", color: "white" }}
                          onClick={() => setShowConfirm(true)}
                          className="text-xs p-button-success p-2 bg-indigo-800 rounded-md text-white"
                        >
                          Regenerate Ambiguties
                        </button>
                      </div>
                    )

                  }
                </div>
                {/* <Dialog
                header="Ambiguities"
                visible={showModal}
                style={{ width: "50vw" }}
                onHide={() => setShowModal(false)}
              >
                <div>
                  <div className="flex justify-between items-center">
                    <h2 className="text-4xl my-5 font-bold">Ambiguities</h2>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="selectAll"
                        checked={Object.values(ambiguities || {}).every((items) =>
                          items.every((item) => item.status),
                        )}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="mr-2 checkbox-bordered"
                      />
                      <label htmlFor="selectAll">Select All</label>
                    </div>
                  </div>

                  {Object.entries(ambiguities || {})?.map(([category, items]) => (
                    <Card
                      title={category.charAt(0).toUpperCase() + category.slice(1)}
                      className="mb-5"
                      key={category}
                    >
                      <ul className="space-y-3">
                        {items?.map((item, index) => (
                          <li key={index} className="flex items-center mb-2">
                            <input
                              type="checkbox"
                              id={`${category}-${index}`}
                              checked={item.status}
                              onChange={(e) =>
                                handleAmbiguitySelectionChange(
                                  category,
                                  index,
                                  e.target.checked,
                                )
                              }
                              className="mr-2 checkbox-bordered"
                            />
                            <label htmlFor={`${category}-${index}`}>
                              {item.val}
                            </label>
                          </li>
                        ))}
                      </ul>
                      {editingCategory === category ? (
                        <>
                          <InputTextarea
                            autoResize
                            className="rounded-xl shadow-black w-full mt-3"
                            placeholder="Enter new ambiguity"
                            value={newAmbiguity}
                            onChange={handleInputChange}
                            rows={2}
                          />
                          <Button
                            label="Save"
                            icon="pi pi-save"
                            style={{ backgroundColor: "#BA0000", color: "white" }}
                            onClick={handleSaveAmbiguity}
                          />
                        </>
                      ) : (
                        <div className="flex justify-end mt-3">
                          <Button
                            icon="pi pi-plus"
                            style={{ backgroundColor: "#BA0000", color: "white" }}
                            onClick={() => handleAddAmbiguityClick(category)}
                          />
                        </div>
                      )}
                    </Card>
                  ))}

                  <div className="flex justify-end mt-5">
                    <Button
                    style={{ backgroundColor: "#BA0000", color: "white" }}
                      label="Refine"
                      icon="pi pi-save"
                      className="refine-button p-button-success p-2 bg-indigo-800 rounded-md text-white mb-20 mr-10"
                      onClick={handleRefine}
                    />
                  </div>
                </div>
              </Dialog> */}
              </>
            )}
          </div>
          {status === "processing" && (
            <div className="flex flex-col items-center mt-5">
              <p className="text-sm text-gray-600 mb-2">Processing... Please wait</p>
              <ProgressBar
                mode="indeterminate"
                style={{ height: "8px", width: "100%", borderRadius: "10px" }}
              // pt={{ value: { style: { backgroundColor: "#BA0000" } } }}
              />
            </div>
          )}

        </div>

        {/* Confirmation Dialog */}
        <Dialog
          visible={showConfirm}
          onHide={() => setShowConfirm(false)}
          header="Confirm Action"
          style={{ width: "350px" }}
          footer={
            <div className="flex justify-between w-full gap-3">
              <Button label="Cancel" size="small" onClick={() => setShowConfirm(false)} className="p-button-text" style={{ backgroundColor: "#BA0000" }} />
              <Button label="Yes, Regenerate" size="small" onClick={handleConfirm} className="p-button-danger bg-indigo-800" style={{ backgroundColor: "#BA0000" }} />
            </div>
          }
        >
          <p>Are you sure you want to regenerate ambiguities again?</p>
        </Dialog>

      </div>
    </PrimeReactProvider>
  );
};


export default QuickScanner;
