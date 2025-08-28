import React, { useState, useEffect, useRef } from "react";
import { Card } from "primereact/card";
import PlantUMLTree from "../../services/PlantUMLTree.js";
import { getMindMap, generateMindMap, getStory, isFunctionalCheck } from "../../services/services";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "tailwindcss/tailwind.css";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { ProgressBar } from "primereact/progressbar";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import { TabView as PrimeView, TabPanel as PrimeTab } from "primereact/tabview";
import jsPDF from "jspdf";
import MarkdownExporter from "../../services/downloadMaps.js"

interface LocationState {
  _id: string;
  story: string;
  sessionId: string;
  acceptance_criteria: string[];
  manual_acceptance_criteria: string[];
  assumptions: string[];
  refined: string;
  project_id: string;
}

const MIND_MAP_TYPES = [
  "availability",
  "scalability",
  "resilience",
  "systemComponents",
  "reliability",
  "overview",
  "gameplay",
] as const;
type MindMapType = (typeof MIND_MAP_TYPES)[number];

const MindMap: React.FC<{ story?: LocationState }> = ({ story }) => {
  const toast = useRef<Toast>(null);

  const storyData = story ?? {
    _id: "",
    refined: "Default refined story",
    acceptance_criteria: [],
    assumptions: [],
    context: "",
    status: "",
    process_status: {},
    ambiguities: {},
    project_id: "",
  };

  const { _id, refined, acceptance_criteria, manual_acceptance_criteria, assumptions, project_id } = storyData;

  const [mindMaps, setMindMaps] = useState({
    availability: { mindMap: "", status: "" },
    scalability: { mindMap: "", status: "" },
    resilience: { mindMap: "", status: "" },
    systemComponents: { mindMap: "", status: "" },
    reliability: { mindMap: "", status: "" },
    overview: { mindMap: "", status: "" },
    gameplay: { mindMap: "", status: "" },
  });

  const [generating, setGenerating] = useState({
    availability: false,
    scalability: false,
    resilience: false,
    systemComponents: false,
    reliability: false,
    overview: false,
    gameplay: false,
  });

  const pollingRef = useRef<number>(2000); // Initial interval set to 2 seconds
  const [isPolling, setIsPolling] = useState(true);
  const [activeTab, setActiveTab] = useState("Refined Story");
  const [visibleSection, setVisibleSection] = useState(null);

  const [isAssumptionsExpanded, setIsAssumptionsExpanded] = useState(true);
  const [isAcceptanceCriteriaExpanded, setIsAcceptanceCriteriaExpanded] = useState(true);
  const [isRefinedStoryExpanded, setIsRefinedStoryExpanded] = useState(true);
  const [isUserStoryExpanded, setIsUserStoryExpanded] = useState(true);

  const [context, setContext] = useState("");
  const [userStory, setUserStory] = useState("");
  const [refinedStoryState, setRefinedStory] = useState("");
  const [data, setData] = useState<LocationState | null>(null);
  const [acceptanceCriteria, setAcceptanceCriteria] = useState([]);
  const [assumption, setAssumption] = useState([]);
  const [ambiguities, setAmbiguities] = useState({});

  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  const [mindMapStatus, setMindMapStatus] = useState<string>("");
  const [isFunctional, setIsFunctional] = useState<boolean>();
  const [manualAcceptanceCriteria, setManualAcceptanceCriteria] = useState([]);

  const cardTitleRef = useRef(null);

  const toggleSection = (section) => {
    setVisibleSection(visibleSection === section ? null : section);
  };

  // Fetch the mind map data
  const fetchMindMap = async () => {
    try {
      if (!_id) return;
      const data = await getStory(_id);

      if (data) {
        setData(data);
        setUserStory(data.story || ""); // Use story
        setContext(data.context || "");

        setStatus(data?.process_status?.ambiguity_checker || "");
        setMindMapStatus(data?.process_status?.mind_maps || "");
        setError(null);
      }

      if (data?.process_status?.ambiguity_checker === "pending") {
        setAmbiguities(data.ambiguities || {});
      }

      if (data?.process_status?.ambiguity_checker === "refined") {
        setAcceptanceCriteria(data?.acceptance_criteria || []);
        setManualAcceptanceCriteria(data?.manual_acceptance_criteria);
        setAssumption(data?.assumptions || []);
        setRefinedStory(data?.refined || "");
      }

      pollingRef.current = Math.min(pollingRef.current * 2, 30000);
      const mindMapData = data?.mind_maps;

      if (mindMapData) {
        setMindMaps((prevMindMaps) => {
          const updatedMindMaps = { ...prevMindMaps };

          MIND_MAP_TYPES.forEach((type) => {
            if (mindMapData[type]) {
              updatedMindMaps[type] = {
                mindMap: mindMapData[type].mind_map || "",
                status: mindMapData[type].status || "",
              };
            }
          });

          return updatedMindMaps;
        });
      }
      //   pollingRef.current = 2000; // Reset to initial interval on success
    } catch (error) {
      console.error("Error fetching mind map:", error);
      // Exponentially increase polling interval (max 30 seconds)
    }
  };

  const storyCheck = async () => {
    try {
      if (!_id) return;
      const response = await isFunctionalCheck(userStory);
      setIsFunctional(response.output[0] === "Functional");
    } catch (error) {
      console.error("Error checking story:", error);
    }
  };
  

  useEffect(() => {
    storyCheck();
  }, [_id, userStory]);

  const toggleTab = (index) => {
    setActiveTab(activeTab === index ? null : index); // Toggle active state for the clicked tab
  };

  // Polling function with exponential backoff
  const poll = async () => {
    if (isPolling) {
      await fetchMindMap(); // Fetch mind map data

      // Retry polling after the current interval using updated pollingRef
      setTimeout(poll, pollingRef.current);
    }
  };

  useEffect(() => {
    poll(); // Start polling

    return () => {
      // Stop polling when the component unmounts
      setIsPolling(false);
    };
  }, [isPolling, _id]);

  const handleRefine = async (type: string) => {
    toast.current?.show({
      severity: "info",
      summary: "Creating",
      detail: "Generating Mind Map",
      life: 3000,
    });
    setGenerating((prev) => ({ ...prev, [type]: true }));

    try {
      const userStoryData = {
        _id,
        context: storyData.context,
        story: storyData.story,
        status: "refined",
        refined,
        acceptance_criteria,
        assumptions,
        type,
        project_id,
      };

      const data = await generateMindMap(userStoryData);
      fetchMindMap();
      pollingRef.current = 2000;
      if (data?.mind_maps) {
        setMindMaps((prev) => ({
          ...prev,
          [type]: {
            mindMap: data.mind_maps[type]?.mind_map || "",
            status: data.mind_maps[type]?.status || "",
          },
        }));
      }
    } catch (error) {
      console.error("Error generating mind map:", error);
    } finally {
      setGenerating((prev) => ({ ...prev, [type]: false }));
    }
  };

  const downloadAllMindMaps = async () => {
    const pdf = new jsPDF();

    for (const type of Object.keys(mindMaps)) {
      const mindMap = mindMaps[type].mindMap;
      if (mindMap) {
        pdf.text(
          `Mind Map: ${type.charAt(0).toUpperCase() + type.slice(1)}`,
          10,
          10,
        );
        pdf.addImage(mindMap, "PNG", 10, 20, 180, 160);
        pdf.addPage();
      }
    }

    pdf.save("mind_maps.pdf");
  };

  const typeDescriptions: Record<string, string> = {
    overview:
      "Overview of Core Functionality, User actions and inputs, Expected Outcomes, Dependencies, Alternative Flows and Edge Cases",
    reliability:
      "Describes what the system should do, focusing on specific features, user interactions, and business rules that deliver value to users",
    availability:
      "Describes quality attributes and constraints like performance, security, and usability that the system must meet",
    scalability:
      "The system's ability to handle increased load (users, data, transactions) without significant performance degradation.",
    resilience:
      "The system's ability to withstand and recover from disruptions, failures, or unexpected events.",
    systemComponents:
      "This Mind Map depicts core System Components according to the requirements in the User Story",
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

  return (
    <div className="bg-[#f1f1f1]">
      <div className="container mx-auto p-8 min-h-screen">
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
                sessionStorage.setItem("userStory", JSON.stringify(storyData));
                localStorage.setItem("name", "Kill Ambiguity");
                window.location.href = "/dashboard";
              }}
              className="px-4 py-2 text-red-700 text-sm font-semibold rounded-lg transition duration-200 hover:bg-red-100 hover:text-red-900"
            >
              {window.innerWidth < 768 ? (
                <span className="text-3xl">←</span>
              ) : (
                <div className="items-center flex gap-2">
                  <span className="text-lg">←</span> Kill Ambiguity
                </div>
              )}
            </button>
            <p className="text-md font-extrabold text-center">Mind Maps</p>
            <span
              className={`w-3 h-3 rounded-full ${mindMapStatus === "new"
                ? "bg-red-500"
                : mindMapStatus === "processing"
                  ? "bg-amber-500"
                  : mindMapStatus === "processed"
                    ? "bg-green-500"
                    : "bg-gray-400"
                }`}
            ></span>
            <button
              onClick={() => {
                sessionStorage.setItem("userStory", JSON.stringify(data));
                localStorage.setItem("name", "Test Scenarios");
                window.location.href = "/dashboard";
              }}
              className="px-4 py-2 text-red-700 text-sm font-semibold rounded-lg transition duration-200 hover:bg-red-100 hover:text-red-900"
            >
              {window.innerWidth < 768 ? <span className="text-3xl">→</span> : <div className="items-center flex gap-2">Test Scenarios <span className="text-lg">→</span></div>}
            </button>
          </div>
          {window.innerWidth >= 768 && (
            <div className="flex flex-row space-x-2">
              <MarkdownExporter data={data} />
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
        <Toast ref={toast} />

        {/* Add more space below the row */}
        <div className="rounded-xl shadow-lg border border-indigo-300 bg-white p-4 mt-2">
          {/* Card Title */}
          {/* Refined User Story Section */}
          <div className="">
            <div
              className="flex items-center cursor-pointer my-2"
              onClick={() => setIsRefinedStoryExpanded(!isRefinedStoryExpanded)}
            >
              <div className="flex justify-between items-center w-full hover:bg-gray-100 p-2 rounded-md transition-colors duration-200">
                <h2 className="text-md font-semibold mr-2">Refined User Story</h2>
                <i className={`pi pi-chevron-${isRefinedStoryExpanded ? 'up' : 'down'} text-gray-600 text-sm hover:text-indigo-600`} />
              </div>

            </div>

            {isRefinedStoryExpanded && refinedStoryState && (
              <p className="text-sm p-4 bg-indigo-50 rounded-md mt-2" style={{ backgroundColor: "#fef2f2" }}>  {/*fee2e2*/}
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
              <div>
                {assumption?.length > 0 ? (
                  <ol className="list-decimal pl-8 space-y-4 text-black">
                    {assumption?.map((item, index) => (
                      <li key={index} className="text-sm pl-2">
                        {item}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-sm pl-2">No assumptions available</p>
                )}
              </div>
            )}

          </div>
        </div>
        <div className="mt-6 w-full flex items-center justify-center rounded-xl">
        <Tabs className="w-full">
  <TabList>
    <Tab>
      <span className="text-sm">Overview</span>
    </Tab>
    {isFunctional ? (
      <Tab>
        <span className="text-sm">Functional</span>
      </Tab>
    ) : (
      <Tab>
        <span className="text-sm">Non-Functional</span>
      </Tab>
    )}
  </TabList>

  {/* Ensure TabPanels align with the rendered Tabs */}
  <TabPanel>
    <Card className="text-md p-[20px] font-bold">
      <p className="text-sm font-bold">
        Overview - <span className="font-normal text-sm">{typeDescriptions["overview"]}</span>
      </p>
    </Card>
    {mindMaps["overview"].status === "processing" ? (
      <>
        <p className="text-md">Processing ....</p>
        <ProgressBar mode="indeterminate" style={{ height: "5px", width: "100%" }} />
      </>
    ) : (
      <PlantUMLTree
        data={mindMaps["overview"].mindMap}
        type={"overview"}
        status={mindMaps["overview"].status}
        style={{ width: "100%" }}
      />
    )}
    <Button
      label="Generate"
      size="small"
      className="text-sm p-button-success p-3 rounded-md text-white mt-4"
      onClick={() => handleRefine("overview")}
      disabled={
        mindMaps["overview"]?.status === "processing" ||
        mindMaps["reliability"]?.status === "processing" ||
        mindMaps["availability"]?.status === "processing"
      }
      
    />
  </TabPanel>

  

  <TabPanel>
    <Card className="text-md p-[20px] font-bold">
      <p className="text-sm font-bold">
        {isFunctional ? "Functional" : "Non-Functional"} -{" "}
        <span className="font-normal text-sm">
          {typeDescriptions[isFunctional ? "reliability" : "availability"]}
        </span>
      </p>
    </Card>
    {mindMaps[isFunctional ? "reliability" : "availability"].status === "processing" ? (
      <>
        <p className="text-md">Processing ....</p>
        <ProgressBar mode="indeterminate" style={{ height: "5px", width: "100%" }} />
      </>
    ) : (
      <PlantUMLTree
        data={mindMaps[isFunctional ? "reliability" : "availability"].mindMap}
        type={isFunctional ? "reliability" : "availability"}
        status={mindMaps[isFunctional ? "reliability" : "availability"].status}
        style={{ width: "100%" }}
      />
    )}
    <Button
      label="Generate"
      size="small"
      className="text-sm p-button-success p-3 bg-indigo-800 rounded-md text-white mt-4"
      onClick={() => handleRefine(isFunctional ? "reliability" : "availability")}
      disabled={
        mindMaps[isFunctional ? "reliability" : "availability"]?.status === "processing" ||
        mindMaps["overview"]?.status === "processing"
      }
      
    />
  </TabPanel>
</Tabs>

        </div>
      </div>
    </div>
  );
};

export default MindMap;
