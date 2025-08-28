import React, { useState, useEffect, useRef } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { jsPDF } from "jspdf";
// import { useLocation, useNavigate } from 'react-router-dom';
//@ts-ignore
import {
  getTestScenario,
  generateTestScenario,
  getStory,
} from "../../services/services";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import { ProgressBar } from "primereact/progressbar";
import { ProgressSpinner } from "primereact/progressspinner";
// import igs_logo from '../../assets/IGS_LOGO.png'
// import Disclaimer from '../../components/Disclaimer';
import logo2 from "../../assets/logo2.jpeg"

// Define the interface for location state
interface LocationState {
  _id: string;
  userStories: string;
  sessionId: string;
  acceptance_criteria: string[];
  manual_acceptance_criteria: string[];
  assumptions: string[];
  project_id: string;
  refined: string;
  scenarios: Record<string, any>;
  context: string;
  status: string;
  ambiguities: {};
  process_status: {
    ambiguity_checker: string;
    mind_maps: string;
    test_scenarios: string;
  };
}
//@ts-ignore
const TestScenario: React.FC = ({ tsStory }) => {
  const toast = useRef<Toast>(null);
  // const location = useLocation();
  // const navigate = useNavigate();
  const {
    _id,
    story,
    refined,
    context,
    ambiguities,
    acceptance_criteria,
    manual_acceptance_criteria,
    assumptions,
    project_id,
  } = tsStory || {};
  if (_id === undefined) {
    window.history.back();
  }
  // State management
  const [data, setData] = useState<LocationState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCardView, setIsCardView] = useState<boolean>(false); // State for view toggle
  const [status, setStatus] = useState<string>("processing"); // State for status
  const [processing, setProcessing] = useState<boolean>(false);
  const [acIndex, setAcIndex] = useState<number>(0);
  const [progressValue, setProgressValue] = useState<number>(0);
  const [showButton, setShowButton] = useState(false);
  const [isAssumptionsExpanded, setIsAssumptionsExpanded] = useState(true);
  const [isAcceptanceCriteriaExpanded, setIsAcceptanceCriteriaExpanded] = useState(true);
  const [isRefinedStoryExpanded, setIsRefinedStoryExpanded] = useState(true);
  const [manualAcceptanceCriteria, setManualAcceptanceCriteria] = useState([]);

  const [newContext, setContext] = useState("");
  const [userStory, setUserStory] = useState("");
  const [refinedStoryState, setRefinedStory] = useState("");
  const [acceptanceCriteria, setAcceptanceCriteria] = useState([]);
  const [assumption, setAssumption] = useState([]);
  const [testScenarioStatus, setTestScenarioStatus] = useState<string>("");
  const [storyData, setStoryData] = useState<LocationState | null>(null);

  const cardTitleRef = useRef(null);

  const pollingRef = useRef<number>(2000); // Initial interval set to 2 seconds
  const [isPolling, setIsPolling] = useState(true);

  const [visibleSection, setVisibleSection] = useState(null);

  const toggleSection = (section) => {
    setVisibleSection(visibleSection === section ? null : section);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setShowButton(scrollPosition > 600); // Show button after scrolling 100px
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (acceptanceCriteria?.length > 0) {
      // Calculate progress and truncate decimals
      const totalCriteriaCount = (acceptanceCriteria?.length || 0) + (manualAcceptanceCriteria?.length || 0);
const progress = ((acIndex + 1) / totalCriteriaCount) * 100;

      setProgressValue(progress.toFixed(0)); // Keeps the integer part without rounding
    }
  }, [acIndex, acceptanceCriteria]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Smooth scrolling effect
    });
  };

  // Fetch data with exponential backoff polling
  const fetchData = async () => {
    setManualAcceptanceCriteria(tsStory?.manual_acceptance_criteria);
    try {
      const data = await getStory(_id);
      const result = data?.test_scenarios;
      const ac_index = data?.ac_index;

      if (data) {
        setData(data);
        setUserStory(data.story || ""); // Use story
        setContext(data.context || "");
        setStoryData(data);

        setStatus(data?.process_status?.ambiguity_checker || "");
        setTestScenarioStatus(data?.process_status?.test_scenarios || "");
        setError(null);
      }

      if (data?.process_status?.ambiguity_checker === "refined") {
        setAcceptanceCriteria(data?.acceptance_criteria || []);
        setAssumption(data?.assumptions || []);
        setRefinedStory(data?.refined || "");
      }

      setAcIndex(ac_index);
      setStatus(data?.status);
      setError(null);

      if (result) {
        setData(result);
      }

      pollingRef.current = Math.min(pollingRef.current * 2, 30000);
    } catch (error) {
      const errorMessage = (error as Error).message;
      setError(errorMessage);
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
      // Retry polling after the current interval using updated pollingRef
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

  // Display error message
  if (error) {
    window.location.reload();
    return (
      <div className="flex items-center justify-center h-screen bg-orange-50">
        <span className="text-xl font-semibold text-black">
          Network Error {error}
        </span>
      </div>
    );
  }

  // Destructure data for rendering
  const fetchedScenarios = data || {};

  const handleToggleView = () => {
    setIsCardView(!isCardView);
  };
  const renderScenarioList = (scenarioData: any) => (
    <div className="space-y-8">
      {Object?.entries(scenarioData || {})?.map(
        ([scenarioType, scenarios], index) => {
          // Ensure scenarios is an array
          const scenarioArray = Array.isArray(scenarios) ? scenarios : [];
          return (
            <div
              key={index}
              className="p-6 bg-white rounded-lg shadow-lg border border-gray-200 transition-transform duration-300 transform"
            >
              <h3 className="text-md font-bold text-red-700 capitalize mb-6 border-b-2 border-red-300 pb-2">
                {scenarioType || "Untitled"}
              </h3>
              <div className="space-y-6">
                {scenarioArray?.map((scenario: any, scenarioIndex: number) => {
                  const [scenarioTitle, scenarioContent] = Object?.entries(
                    scenario || {},
                  )[0] || ["Untitled", "No content available"];
                  return (
                    <div
                      key={scenarioIndex}
                      className="p-6 rounded-lg border border-gray-300 bg-gray-50 shadow-sm hover:shadow-md transition-shadow duration-300"
                    >
                      <h4 className="text-md font-semibold text-gray-800 mb-3">
                        {scenarioTitle}
                      </h4>
                      <p className="text-gray-700 text-sm mb-4">{scenarioContent}</p>
                      <div>
                        <h5 className="text-lg font-medium text-red-700 mb-3 flex items-center space-x-2">
                          <span className="text-sm">📋</span>
                          <span className="text-sm">Preconditions:</span>
                        </h5>
                        <ul className="list-disc pl-6 space-y-2 text-gray-700">
                          {Array.isArray(scenario?.Precondition) &&
                            scenario.Precondition?.length ? (
                            scenario.Precondition?.map(
                              (Precondition: string, i: number) => (
                                <li
                                  key={i}
                                  className="hover:text-red-500 text-sm transition-colors duration-150"
                                >
                                  {Precondition}
                                </li>
                              ),
                            )
                          ) : (
                            <li className="text-gray-500 text-sm">
                              No Preconditions available
                            </li>
                          )}
                        </ul>
                      </div>
                      {scenario?.Description && (
                        <p className="mt-4 text-sm text-gray-600 italic">
                          {scenario.Description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        },
      )}
    </div>
  );

  // const renderScenarioList = (scenarios: any[] | null | undefined) => (
  //     <div className="space-y-8">
  //         {scenarios?.map((scenarioObj, index) => (
  //             <div key={index} className="p-6 bg-white rounded-lg shadow-lg border border-gray-200">
  //                 <h3 className="text-3xl font-bold text-black">
  //                     {scenarioObj?.scenario ?? "N/A"}
  //                 </h3>
  //                 <p className="mt-2 text-gray-600 text-lg">{scenarioObj?.Description ?? "N/A"}</p>

  //                 <div className="mt-6 space-y-6">
  //                     <div>
  //                         <strong className="text-xl text-gray-800 flex items-center space-x-2">
  //                             <span className="text-blue-500">📋</span>
  //                             <span>Preconditions:</span>
  //                         </strong>
  //                         <ul className="list-disc pl-6 space-y-2 text-gray-700">
  //                             {scenarioObj?.Precondition?.length ? (
  //                                 scenarioObj.Precondition.map((Precondition: string, i: number) => (
  //                                     <li key={i} className="hover:text-red-800 duration-200">
  //                                         {Precondition ?? "N/A"}
  //                                     </li>
  //                                 ))
  //                             ) : (
  //                                 <li>{"No Preconditions available"}</li>
  //                             )}
  //                         </ul>
  //                     </div>

  //                     {scenarioObj?.steps?.length > 0 && (
  //                         <div>
  //                             <strong className="text-xl text-gray-800 flex items-center space-x-2">
  //                                 <span className="text-green-500">📝</span>
  //                                 <span>Steps:</span>
  //                             </strong>
  //                             <ul className="list-decimal pl-6 space-y-2 text-gray-700">
  //                                 {scenarioObj.steps.map((step: string, i: number) => (
  //                                     <li key={i} className="hover:text-green-600 transition-colors duration-200">
  //                                         {step ?? "N/A"}
  //                                     </li>
  //                                 ))}
  //                             </ul>
  //                         </div>
  //                     )}
  //                 </div>
  //             </div>
  //         ))}
  //     </div>
  // );

  const handleGenerateUserStories = async () => {
    if (fetchedScenarios?.batch_status === "processing") {
      setProcessing(true);
    }

    // Start a timer to keep the loader visible for at least 10 seconds
    const timer = setTimeout(() => {
      // Placeholder in case you need to extend the loader time
    }, 10000); // 10 seconds

    try {
      // Map data from location.state directly

      const payload = [
        {
          _id,
          story: story,
          context: context,
          status: status,
          ambiguities,
          refined: refinedStoryState,
          manual_acceptance_criteria: manualAcceptanceCriteria,
          acceptance_criteria: acceptanceCriteria,
          assumptions: assumption,
          project_id,
        },
      ];

      const validStoriesToSend = payload; //.filter(story => story.acceptance_criteria !== null);

      if (validStoriesToSend.length === 0) {
        toast.current?.show({
          severity: "warn",
          summary: "No Valid Stories",
          detail: "Please Select a User Story to Process",
          life: 3000,
        });
        return;
      } else if (validStoriesToSend.length >= 3) {
        toast.current?.show({
          severity: "warn",
          summary: "No Valid Stories",
          detail: "You Can Only Process 2 User Stories at Once",
          life: 3000,
        });
        return;
      } else {
        toast.current?.show({
          severity: "info",
          summary: "Processing",
          detail: "Stories are being processed.",
          life: 3000,
        });
      }

      // Pass the mapped data to the service
      await generateTestScenario(validStoriesToSend);

      // Optionally, you can fetch the updated data if needed
      fetchData();
      pollingRef.current = 2000;
    } catch (e) {
      console.error("Error processing user stories:", e);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to process user stories.",
        life: 3000,
      });
    } finally {
      // Always clear the timer and ensure the loader is hidden
      clearTimeout(timer);
      // setProcessing(false);
    }
  };

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
        ? assumption?.map((a, i) => `${i + 1}. ${a}`).join('\n')
        : 'No assumptions available';
      sections.push(`ASSUMPTIONS:\n${assumptionsList}`);
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

  const generateMarkdown = () => {
    const data = {
      _id: _id ?? "",
      story: story ?? "",
      context: context ?? "",
      ambiguities: ambiguities ?? [],
      acceptance_criteria: acceptance_criteria ?? [],
      manual_acceptance_criteria: manualAcceptanceCriteria ?? [],
      assumptions: assumptions ?? [],
      refined: refined ?? "",
      test_scenarios: fetchedScenarios ?? { data: [] }, // Ensure test_scenarios exists
    };

    let markdownContent = `## User Story\n${data.story}\n\n`;

    markdownContent += `#### Refined Story\n${data.refined}\n\n`;

    if (data.acceptance_criteria.length > 0) {
      markdownContent += `#### Acceptance Criteria\n`;
      data.acceptance_criteria.forEach((criteria, index) => {
        markdownContent += `${index + 1}. ${criteria}\n`;
      });
      markdownContent += `\n`;
    }

    markdownContent += `## Test Scenarios\n`;

    if (
      data.test_scenarios &&
      Array.isArray(data.test_scenarios.data) &&
      data.test_scenarios.data.length > 0
    ) {
      data.test_scenarios.data.forEach((scenarioSet, index) => {
        if (scenarioSet && typeof scenarioSet === "object") {
          // Iterate through each acceptance criteria (AC1, AC2, etc.)
          Object.entries(scenarioSet).forEach(([acKey, scenarioTypes]) => {
            if (scenarioTypes && typeof scenarioTypes === "object") {
              markdownContent += `### ${acKey}\n\n`; // Add the AC key (e.g., AC1)

              // Iterate through each scenario type (Positive Scenario, Negative Scenario, etc.)
              Object.entries(scenarioTypes).forEach(([scenarioType, scenarioList]) => {
                if (Array.isArray(scenarioList) && scenarioList.length > 0) {
                  markdownContent += `**${scenarioType.toUpperCase()}**\n\n`; // Add the scenario type (e.g., Positive Scenario)

                  // Iterate through each scenario in the list
                  scenarioList.forEach((scenario, scenarioIndex) => {
                    // Extract the scenario title
                    const scenarioTitle = Object.keys(scenario)[0] || 'Untitled';
                    const scenarioContent = scenario[scenarioTitle] || 'No content available';

                    markdownContent += `${scenarioTitle}\n${scenarioContent}\n\n`;

                    // Handle Preconditions
                    markdownContent += `###### Preconditions:\n`;
                    if (
                      Array.isArray(scenario?.Precondition) &&
                      scenario.Precondition?.length > 0
                    ) {
                      scenario.Precondition.forEach((precondition: string) => {
                        markdownContent += `- ${precondition}\n`;
                      });
                    } else {
                      markdownContent += `- None\n`;
                    }

                    // Handle Description
                    if (scenario?.Description) {
                      markdownContent += `###### Description:\n${scenario.Description}\n\n`;
                    }
                  });
                }
              });
            }
          });
        }
      });
    } else {
      markdownContent += `No test scenarios available.\n\n`;
    }

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
    <div className="bg-[#f1f1f1]">
      <div className="container mx-auto p-8 min-h-screen">
        <Toast ref={toast} />
        <div className="container mx-auto min-h-screen mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between w-full">
            {window.innerWidth >= 768 && (
              <button
                style={{ backgroundColor: "#BA0000", color: "white" }}
                onClick={() => window.history.back()}
                className="text-xs p-button-success p-2 bg-red-800 rounded-md text-white mb-2 sm:mb-0"
              >
                ← Go Back
              </button>
            )}

            <div className="flex items-center flex-1 justify-center space-x-2 mb-2 sm:mb-0">
              <button
                onClick={() => {
                  sessionStorage.setItem("userStory", JSON.stringify(storyData));
                  localStorage.setItem("name", "Mind Maps");
                  window.location.href = "/dashboard";
                }}
                className="px-4 py-2 text-red-700 text-sm font-semibold rounded-lg transition duration-200 hover:bg-red-100 hover:text-red-900"
              >
                {window.innerWidth < 768 ? (
                  <span className="text-3xl">←</span>
                ) : (
                  <div className="items-center flex gap-2">
                    <span className="text-lg">←</span> Mind Maps
                  </div>
                )}
              </button>

              <p className="text-md font-extrabold text-center">Test Scenarios</p>
              <span
                className={`w-3 h-3 rounded-full ${testScenarioStatus === "new"
                  ? "bg-red-500"
                  : testScenarioStatus === "processing"
                    ? "bg-amber-500"
                    : testScenarioStatus === "processed"
                      ? "bg-green-500"
                      : "bg-gray-400"
                  }`}
              ></span>

              <button
                onClick={() => {
                  sessionStorage.setItem("userStory", JSON.stringify(storyData));
                  localStorage.setItem("name", "Kill Ambiguity");
                  window.location.href = "/dashboard";
                }}
                className="px-4 py-2 text-red-700 text-sm font-semibold rounded-lg transition duration-200 hover:bg-red-100 hover:text-red-900"
              >
                {window.innerWidth < 768 ? <span className="text-3xl">→</span> : <div className="items-center flex gap-2">Kill Ambiguity <span className="text-lg">→</span></div>}
              </button>
            </div>

            {window.innerWidth >= 768 && (
              <div className="flex flex-row space-x-2">
                <Button
                  label="Download"
                  icon="pi pi-download"
                  style={{ backgroundColor: "#BA0000", color: "white" }}
                  disabled={!refinedStoryState}
                  size="small"
                  className="text-xs p-button-danger p-2 bg-red-800 rounded-md text-white mr-2"
                  onClick={() => downloadPDF()}
                />
                <button
                  onClick={copyAllToClipboard}
                  style={{ backgroundColor: "#BA0000", color: "white" }}
                  className="text-xs p-button-success p-2 bg-red-800 rounded-md text-white"
                >
                  <i className="pi pi-copy" />
                  Copy
                </button>
              </div>
            )}
          </div>

          {/* Add more space below the row */}
          <div className="rounded-xl shadow-lg border border-red-300 bg-white p-4 mt-2">
            {/* Card Title */}
            {/* Refined User Story Section */}
            <div className="">
              <div
                className="flex items-center cursor-pointer my-2"
                onClick={() => setIsRefinedStoryExpanded(!isRefinedStoryExpanded)}
              >
                <div className="flex justify-between items-center w-full hover:bg-gray-100 p-2 rounded-md transition-colors duration-200">
                  <h2 className="text-md font-semibold mr-2">Refined User Story</h2>
                  <i className={`pi pi-chevron-${isRefinedStoryExpanded ? 'up' : 'down'} text-gray-600 text-sm hover:text-red-600`} />
                </div>

              </div>

              {isRefinedStoryExpanded && refinedStoryState && (
                <p className="text-sm p-4 bg-red-50 rounded-md mt-2" style={{ backgroundColor: "#fef2f2" }}>  {/*fee2e2*/}
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
        <i className={`pi pi-chevron-${isAcceptanceCriteriaExpanded ? 'up' : 'down'} text-gray-600 text-sm hover:text-red-600`} />
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

    {isAcceptanceCriteriaExpanded && (
      <div>
        {(acceptanceCriteria?.length > 0 || manualAcceptanceCriteria?.length > 0) ? (
          <ol className="list-decimal pl-2 space-y-4 text-black">
            {/* Render Model Generated Acceptance Criteria */}
            {acceptanceCriteria?.map((criteria, index) => (
              <li
                key={`ac-${index}`}
                className="flex items-start space-x-3 text-sm pl-2"
                id={`list-item-${index}`}
              >
                <span className="text-black text-sm">{index + 1}.</span>
                <span className="leading-snug text-black text-sm">{criteria}</span>
              </li>
            ))}

            {/* Render User-entered Manual Acceptance Criteria */}
            {manualAcceptanceCriteria?.map((criteria, i) => {
              const index = acceptanceCriteria.length + i;
              return (
                <li
                  key={`manual-${i}`}
                  className="flex items-start space-x-3 text-sm pl-2"
                  id={`list-item-${index}`}
                >
                  <span className="text-blue-500 text-sm">{index + 1}.</span>
                  <span className="leading-snug text-blue-700 text-sm">{criteria}</span>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="text-sm pl-2">No Acceptance Criteria available</p>
        )}
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
                  <i className={`pi pi-chevron-${isAssumptionsExpanded ? 'up' : 'down'} text-gray-600 ml-2 text-sm hover:text-red-600`} />
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
                <div>
                  {assumption?.length > 0 ? (
                    <ol className="list-decimal pl-8 space-y-4 text-black">
                      {assumption?.map((assumption, index) => (
                        <li key={index} className="text-sm pl-2">
                          {assumption}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-sm pl-2">No Assumptions available</p>
                  )}
                </div>
              )}

            </div>
          </div>
          {status === "processing" || data?.process_status?.test_scenarios === "processing" ? (
            <div className="mt-8 mb-8">
              <p className="text-xs">Processing ....</p>
              <ProgressBar mode="indeterminate" style={{ height: "8px" }} />
            </div>
          ) : (
            Object.keys(fetchedScenarios?.data || {}).length > 0 && (
              <div>
                <div className="flex mt-8 justify-between items-center mb-8">
                  <div className="flex items-center">
                    <h2 className="text-md font-extrabold">
                      AI Generated Test Scenarios
                    </h2>
                    {fetchedScenarios?.batch_status === "processing" && (
                      <div className="flex items-center ml-4">
                        <ProgressSpinner
                          style={{ marginLeft: "10px" }}
                          strokeWidth="4"
                          fill="var(--surface-ground)"
                          animationDuration=".5s"
                          className="h-6 w-6"
                        />
                        <span className="ml-2 text-xs text-gray-600">
                          Generating more scenarios...
                        </span>
                      </div>
                    )}
                  </div>
                  {/* <Button
                  label={isCardView ? "Tab View" : "Card View"}
                  className="text-sm p-button-primary p-2 bg-red-800 rounded-md text-white"
                  onClick={handleToggleView}
                  size="small"
                /> */}
                </div>
                {fetchedScenarios?.batch_status === "processing" && (
                  <div className="w-full my-4">
                    <ProgressBar value={progressValue} />
                    {/* <p className="text-center text-lg mt-2">Test Scenarios Generated: {acIndex + 1} of {acceptance_criteria?.length || 0}</p> */}
                  </div>
                )}
                {isCardView ? (
                  <div className="space-y-8">
                    {fetchedScenarios?.data &&
                      fetchedScenarios.data?.map((obj, index) => {
                        // Get the dynamic key of the current object
                        const dynamicKey = Object.keys(obj)[0]; // This gets the first key dynamically
                        const criteriaTitle =
                          acceptanceCriteria[index] ||
                          `Acceptance Criteria - ${index}`;
                        return (
                          <Card
                            key={index}
                            title={criteriaTitle} // Use the dynamic key as the card title
                            className="shadow-lg border border-red-300 bg-white"
                          >
                            {renderScenarioList(obj[dynamicKey])}{" "}
                            {/* Pass the value of the dynamic key */}
                          </Card>
                        );
                      })}
                  </div>
                ) : (
                  <Tabs>
                    <div className="overflow-x-auto whitespace-nowrap">
                      <TabList>
                        {Object.keys(fetchedScenarios?.data || {})?.map(
                          (key, index) => (
                            <Tab key={index + 1}>
                              <span className="text-sm">{`AC-${Number(key) + 1}`}</span>
                            </Tab>

                          ),
                        )}
                      </TabList>
                    </div>
                    {fetchedScenarios?.data?.length > 0 && (
                      <div>
                        {fetchedScenarios.data?.map((obj, index) => {
                          // Get the dynamic key of the current object
                          const dynamicKey = Object?.keys(obj)[0]; // This gets the first key dynamically
                          const totalModelCriteria = acceptanceCriteria?.length || 0;
                          const criteriaTitle =
                            index < totalModelCriteria
                              ? acceptanceCriteria[index]
                              : manualAcceptanceCriteria?.[index - totalModelCriteria] || "Default Title";
                          
                          return (
                            <TabPanel key={index}>
                              <div className="shadow-lg border border-red-300 bg-white p-4">
                                <h3 className="text-md font-semibold">{criteriaTitle}</h3> {/* Title with text-md */}
                                <div className="">
                                  {renderScenarioList(obj[dynamicKey])} {/* Content with text-xs */}
                                </div>
                              </div>

                            </TabPanel>
                          );
                        })}
                      </div>
                    )}
                  </Tabs>
                )}
              </div>
            )
          )}
          <div className="flex space-x-4 mt-8 justify-end">
            <Button
              label="Process"
              size="small"
              icon="pi pi-cog"
              className="text-sm p-button-primary p-3 bg-red-800 rounded-md text-white"
              onClick={handleGenerateUserStories}
              disabled={
                fetchedScenarios?.batch_status === "processing" ||
                status === "processing"
              }
            />
          </div>
        </div>
        {/* <div className=' mt-[40px] flex justify-evenly'>
                <div className='rounded-lg bg-gray-50 flex flex-col justify-center items-center p-4 w-1/3 shadow'>

                    <div className='flex w-full justify-between items-center'>
                        <div className='w-1/2'>
                            <p className="text-xl font-semibold text-gray-800 mb-2 pb-[15px]">Ambiguity Checker</p>
                            <p className="text-sm text-gray-700 leading-relaxed">
                                Analyze requirements to detect vague, unclear, or ambigious aspects and refine requirements with criteria for success and assumptions.
                            </p>
                        </div>
                        <Button
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
                        // onClick={() => navigate('/app')}
                        >
                            Go
                        </Button>
                    </div>
                </div>
                <div className='rounded-lg bg-gray-50 flex flex-col justify-center items-center p-4 w-1/3 shadow'>

                    <div className='flex w-full justify-between items-center'>
                        <div className='w-1/2'>
                            <p className="text-xl font-semibold text-gray-800 mb-2 pb-[15px]">Mind Maps</p>
                            <p className="text-sm text-gray-700 leading-relaxed">
                                Significantly improve the clarity, coverage, and efficiency of your testing process, leading to higher quality software.
                            </p>
                        </div>
                        <Button
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
                        // onClick={() => navigate('/mindmap')}
                        >
                            Go
                        </Button>
                    </div>
                </div>
            </div> */}
        {/* <Disclaimer /> */}
      </div>
    </div>
  );
};

export default TestScenario;
