import React, { useContext, useEffect, useRef, useState } from "react";
import { addUserStory, getUserStories, investScoringCheck, sendUserStories, updateStory, validateUserStories } from "../../pages/services/service";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Toast } from "primereact/toast";
import { useLocation, useNavigate } from 'react-router-dom';
import ReactApexChart from 'react-apexcharts';
import ChartContainer from "../SpiderChart";
import ProjectMetrics from "../Metrics";

import AmbiguityApp from 'ambiguity/Ambiguity';
import MindMaps from 'mindmaps/mindmaps';
import TestScenarios from 'testscenarios/TestScenario';
import { AppContext } from "../../routing/appContext";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Stepper } from "primereact/stepper";
import { StepperPanel } from "primereact/stepperpanel";
import { Dialog } from "primereact/dialog";
import { Sidebar } from "primereact/sidebar";
import { useAppContext } from "../../routing/appContext";
import ScoreBadge from "./ScoreBadge";

export default function Table({ projectDetails, projectMetrics }) {
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

    // States
    const navigate = useNavigate();
    const [userStories, setUserStories] = useState<UserStoryData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState(null);
    const [isPolling, setIsPolling] = useState(true);
    const [expandedRows, setExpandedRows] = useState<any>(undefined);
    const [selectedStory, setSelectedStory] = useState<UserStoryData | null>(null);
    const [appName, setAppname] = useState<string>();
    const { data, setData } = useContext(AppContext);
    const [userStory, setUserStory] = useState<string>("");
    const state = { userStory: userStory };
    const [progressValues, setProgressValues] = useState<{ [key: string]: number }>({});
    const [acIndex, setAcIndex] = useState<number>(0);
    const [storyStatus, setStoryStatus] = useState<number>();
    const [ambStatus, setAmbStatus] = useState<string>();
    const [mindMapStatus, setMindMapStatus] = useState<string>();
    const [showDialog, setShowDialog] = useState(false);
    const [storyEditDialog, setStoryEditDialog] = useState(false);
    const { showModal, setShowModal } = useAppContext();
    const { refreshData, setRefreshData } = useAppContext();
    const [isHovered, setIsHovered] = useState(false);
    const [investScore, setInvestScore] = useState<number>();
    const [selectedStoryId, setSelectedStoryId] = useState<string>("")

    const [redDots, setRedDots] = useState(0);
    const [amberDots, setAmberDots] = useState(0);
    const [greenDots, setGreenDots] = useState(0);

    const [userStoryError, setUserStoryError] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState(null);
    const [ac, setAC] = useState<string>("");
    const [items, setItems] = useState<string[]>([]);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editingValue, setEditingValue] = useState("");
    const [context, setContext] = useState<string>("");
    const { isCollapsed, setIsCollapsed } = useAppContext();

    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [pendingStory, setPendingStory] = useState(null);

    const [calculatedProjectMetrics, setCalculatedProjectMetrics] = useState({});
    const [chartOptions, setChartOptions] = useState({});
    const [chartSeries, setChartSeries] = useState([]);

    const [hasOpenedDialog, setHasOpenedDialog] = useState(false);

    const stepperRef = useRef(null);

    const statusOptions = [
        { label: 'All', value: 4 }, // Use 4 for All
        { label: 'Discovery Phase', value: 1 },
        { label: 'Design Phase', value: 2 },
        { label: 'Execution Phase', value: 3 }
    ];



    const toast = useRef<Toast>(null);
    const pollingRef = useRef<number>(2000);

    // Services
    const fetchData = async () => {
        try {
            const { id } = projectDetails;
            const data = await getUserStories(id);
            if (data == null) {
                setUserStories([]);
            } else {
                setUserStories(data);
                pollingRef.current = Math.min(pollingRef.current * 2, 30000);
            }
            setError(null);
        } catch (err) {
            console.error("Error fetching user stories:", err);
            setError("Error fetching data. Retrying...");
        } finally {
            setLoading(false);
        }
    };

    const handleSendData = async () => {
        if (userStories.length === 0) {
          console.warn('No user stories to send');
          return;
        }
    
        try {
          const result = await sendUserStories(userStories);
          console.log('User stories sent successfully:', result);
        } catch (error) {
          console.error('Failed to send user stories:', error);
        }
      };



    useEffect(() => {
        fetchData();
    }, []);

    const [storiesWithScores, setStoriesWithScores] = useState([]);
    const [filterValue, setFilterValue] = useState('');

    const filteredStories = userStories.filter((story) => {
        const matchesSearch = story?.story?.toLowerCase()?.includes(filterValue?.toLowerCase());
        const matchesStatus =
            statusFilter === 4 || statusFilter === null ||
            storyStatus[story._id] === statusFilter;
        return matchesSearch && matchesStatus;
    });

// useEffect(() => {
//     const fetchScores = async () => {
//         if (!filteredStories.length) {         
//             setStoriesWithScores([]);
//             return;
//         }

//         const storyTexts = filteredStories.map(story => story.story);
//         const validationResults = await validateUserStories(storyTexts);

//         const validStories = filteredStories.map((story, index) => ({
//             ...story,
//             investScore: validationResults[index] === "True" ? null : 0, // Set 0 for invalid stories
//         }));
        
//         const storiesNeedingScoring = validStories.filter(story => story.investScore === null);
//         if (!storiesNeedingScoring.length) {
//             setStoriesWithScores(validStories);
//             return;
//         }

//         const scores = await investScoringCheck(storiesNeedingScoring.map(story => story.story));
        
//         // Create a map of scores indexed by story text for lookup
//         const scoreMap = new Map();
//         storiesNeedingScoring.forEach((story, index) => {
//             // scoreMap.set(story.story, scores[index]);
//             scoreMap.set(story.story, scores[index] === 0.9 ? 1 : scores[index]);

//         });

//         // Update stories using the score map
//         const updatedStories = validStories.map(story => ({
//             ...story,
//             investScore: story.investScore === 0 ? 0 : scoreMap.get(story.story) ?? null,
//         }));

//         setStoriesWithScores(updatedStories);
//     };

//     fetchScores();
// }, [userStories]); // Add filteredStories as dependency


console.log(storiesWithScores.map(story => story.investScore), 'all ratings');


    // useEffect(() => {
    //     console.log(investScore, 'score');
    // }, [investScore]);

    useEffect(() => {
        const childName = localStorage.getItem("name");
        const userStory = JSON.parse(sessionStorage.getItem("userStory") || '{}');
        const isCollapsed = JSON.parse(sessionStorage.getItem("isCollapsed") || 'false'); // Assuming this is stored in sessionStorage

        if (childName === "Kill Ambiguity") {
            localStorage.removeItem("name");
            navigate("/dashboard/ac/checker", { state: { userStory } });
        } else if (childName === "Mind Maps") {
            localStorage.removeItem("name");
            navigate("/dashboard/mm/viewer", { state: { userStory, isCollapsed } });
        } else if (childName === "Test Scenarios") {
            localStorage.removeItem("name");
            navigate("/dashboard/ts/generator", { state: { userStory } });
        }
    }, [navigate]);

    useEffect(() => {
        const newProgressValues: { [key: string]: number } = {};
        const updatedStoryStatuses: { [key: string]: number } = {}; // For story statuses
        const updatedAmbStatus: { [key: string]: string } = {}; // For ambStatus
        const updatedMindMapStatus: { [key: string]: number } = {}; // For mindMapStatus

        userStories.forEach((story) => {
            // Progress calculation
            if (story.acceptance_criteria && story.acceptance_criteria.length > 0) {
                const progress = ((story.ac_index + 1) / story.acceptance_criteria.length) * 100;
                newProgressValues[story._id] = Math.floor(progress);
            } else {
                newProgressValues[story._id] = 0;
            }

            // Store ambStatus for each story
            updatedAmbStatus[story._id] = story.process_status?.ambiguity_checker || "new" || "processing";

            // Determine mindMapStatus
            if (!story.mind_maps) {
                updatedMindMapStatus[story._id] = 0; // No mind_maps data
            } else {
                updatedMindMapStatus[story._id] = Object.keys(story.mind_maps).length; // Use length
            }

            // Extract process status values
            const { ambiguity_checker, mind_maps, test_scenarios } = story.process_status;

            // Count how many statuses are "new"
            const newStatusesCount = [ambiguity_checker, mind_maps, test_scenarios].filter(status => status === "new").length;

            // Determine story status
            if (newStatusesCount === 0) {
                updatedStoryStatuses[story._id] = 3; // All refined
            } else if (newStatusesCount === 1) {
                updatedStoryStatuses[story._id] = 2; // One "new"
            } else if (newStatusesCount === 2) {
                updatedStoryStatuses[story._id] = 1; // Two "new"
            } else {
                updatedStoryStatuses[story._id] = 0; // All "new"
            }
        });

        // Update states once
        setProgressValues(newProgressValues);
        setStoryStatus(updatedStoryStatuses);
        setAmbStatus(updatedAmbStatus); // Now ambStatus is an object storing all stories' statuses
        setMindMapStatus(updatedMindMapStatus); // Store mindMapStatus for each story
    }, [userStories]);


    useEffect(() => {
        async function fetchAndSetMetrics() {
            try {
                const { id } = projectDetails;
                const stories = await getUserStories(id); // Fetch the stories array
                const totalStories = stories.length;
                let totalAmbiguities = 0;
                let totalMindMaps = 0;
                let totalTestScenarios = 0;
                let totalProcessingScore = 0;
                let fullyProcessed = 0;
                let notProcessed = 0;

                stories.forEach(story => {
                    let processedCount = 0;
                    if (story.process_status.ambiguity_checker === 'refined') {
                        totalAmbiguities++;
                        processedCount++;
                    }
                    if (story.process_status.mind_maps === 'processed') {
                        totalMindMaps++;
                        processedCount++;
                    }
                    if (story.process_status.test_scenarios === 'processed') {
                        totalTestScenarios++;
                        processedCount++;
                    }
                    totalProcessingScore += processedCount;
                    if (processedCount === 3) {
                        fullyProcessed++;
                    }
                    if (processedCount === 0) {
                        notProcessed++;
                    }
                });
                const storiesWithNoProcessing = totalStories - (totalAmbiguities + totalMindMaps + totalTestScenarios);
                const ambiguityResolutionPercentage = totalStories ? ((totalAmbiguities / totalStories) * 100).toFixed(2) : 0;
                const mindMapsPercentage = totalStories ? ((totalMindMaps / totalStories) * 100).toFixed(2) : 0;
                const testScenariosPercentage = totalStories ? ((totalTestScenarios / totalStories) * 100).toFixed(2) : 0;
                const fullyProcessedPercentage = totalStories ? ((fullyProcessed / totalStories) * 100).toFixed(2) : 0;
                const notProcessedPercentage = totalStories ? ((notProcessed / totalStories) * 100).toFixed(2) : 0;
                const averageCompletionRate = totalStories ? ((totalProcessingScore / (totalStories * 3)) * 100).toFixed(2) : 0;
                // Update your metrics state
                setCalculatedProjectMetrics({
                    totalStories,
                    total_ambiguities: totalAmbiguities,
                    total_mind_maps: totalMindMaps,
                    total_test_scenarios: totalTestScenarios,
                    ambiguity_resolution_percentage: ambiguityResolutionPercentage,
                    mind_maps_percentage: mindMapsPercentage,
                    test_scenarios_percentage: testScenariosPercentage,
                    fully_processed_stories: fullyProcessed,
                    fully_processed_percentage: fullyProcessedPercentage,
                    not_processed_stories: notProcessed,
                    not_processed_percentage: notProcessedPercentage,
                    average_completion_rate: averageCompletionRate,
                });
            } catch (error) {
                console.error("Error fetching stories:", error);
            }
        }
        fetchAndSetMetrics();
    }, []); // Run once on component mount

    useEffect(() => {
        if (calculatedProjectMetrics) {
            // Calculate the step size assuming you want 5 intervals
            const stepSize = calculatedProjectMetrics?.totalStories / 5; // e.g., 50/5 = 10
            setChartOptions({
                chart: {
                    type: 'radar',
                    toolbar: { show: false }
                },
                labels: ['Ambiguity Killer', 'Mind Maps', 'Test Scenarios'],
                plotOptions: {
                    radar: {
                        size: window.innerWidth < 768 ? 100 : 130,
                        polygons: {
                            strokeColors: '#e8e8e8',
                            fill: { colors: ['#f8f8f8', '#fff'] }
                        }
                    }
                },
                markers: {
                    size: 4,
                    colors: ['#fff'],
                    strokeColors: ['#FF4560'],
                    strokeWidth: 2
                },
                yaxis: {
                    min: 0,
                    max: calculatedProjectMetrics?.totalStories,
                    // Use stepSize so the grid lines appear at each multiple
                    stepSize: stepSize,
                    labels: {
                        formatter: (val) => Math.round(val)
                    }
                },
                fill: { opacity: 0.3 },
                colors: ['#FF4560']
            });

            setChartSeries([{
                name: 'User Stories',
                data: [
                    calculatedProjectMetrics?.total_ambiguities || 0,
                    calculatedProjectMetrics?.total_mind_maps || 0,
                    calculatedProjectMetrics?.total_test_scenarios || 0
                ]
            }]);
        }
    }, [calculatedProjectMetrics]);




    const poll = async () => {
        if (isPolling) {
            await fetchData();
            setTimeout(poll, pollingRef.current);
        }
    };

    // useEffect
    useEffect(() => {
        poll();
        return () => {
            setIsPolling(false);
        };
    }, [isPolling]);

    const [refreshFlag, setRefreshFlag] = useState(() => sessionStorage.getItem("refresh"));

    useEffect(() => {
        const refresh = sessionStorage.getItem("refresh");
        if (refresh === "true") {
            fetchData();
            sessionStorage.removeItem("refresh"); // Remove after fetching data
            setRefreshFlag(null); // Ensure state updates
        }
    }, [refreshData]); // Trigger when refreshData changes


    useEffect(() => {
        let red = 0;
        let amber = 0;
        let green = 0;

        if (storyStatus && typeof storyStatus === 'object') {
            Object.values(storyStatus).forEach(status => {
                if (status === 1) {
                    red += 1;
                } else if (status === 2) {
                    amber += 1;
                } else if (status === 3) {
                    green += 1;
                }
            });
        }

        setRedDots(red);
        setAmberDots(amber);
        setGreenDots(green);
    }, [storyStatus]);


    const onRowExpand = (event: any) => {
        toast.current?.show({ severity: "info", summary: "User Story Expanded", detail: event.data.story, life: 3000 });
    };

    const onRowCollapse = (event: any) => {
        toast.current?.show({ severity: "success", summary: "User Story Collapsed", detail: event.data.story, life: 3000 });
    };

    const expandAll = () => {
        let _expandedRows: any = {};
        userStories.forEach((story) => (_expandedRows[`${story._id}`] = true));
        setExpandedRows(_expandedRows);
    };

    const collapseAll = () => {
        setExpandedRows(undefined);
    };

    const handleNavigation = (path: string, appName: string) => {
        navigate(path, { state: data?.projectDetails });
        setAppname(appName);
    };

    const openDialog = () => {
        // setShowModal(true);
        setShowDialog(true);
    };

    const openEditDialog = () => {
        setStoryEditDialog(true);
    }

    useEffect(() => {
        if (userStories.length === 0 && !hasOpenedDialog) {
            const timer = setTimeout(() => {
                setShowModal(true);
                setHasOpenedDialog(true); // Mark as opened
            }, 1000);
    
            return () => clearTimeout(timer);
        }
    }, [userStories, hasOpenedDialog]);

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
                const existingStories = userStories.map((story) => story.story)
                const response = await addUserStory(newStory, true, existingStories);
                // const score = await investScoringCheck(newStory?.story)
                // setInvestScore(score?.output[0])

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

    const handleUpdateUserStory = async (storyId) => {
        if (validateFields()) {
            try {
                const sanitizedUserStory = userStory.replace(/\n/g, " ");
                const sanitizedContext = context.replace(/\n/g, " ");
                const storyToUpdate = userStories.find(story => story._id === storyId);

                if (!storyToUpdate) {
                    console.error("Error: Story not found.");
                    return;
                }
    
                const updatedStoryData = {
                    ...storyToUpdate,
                    story: sanitizedUserStory,
                    context: sanitizedContext,
                    manual_acceptance_criteria: items
                };
    
    
                await updateStory(updatedStoryData); 
    
                fetchData();
                closeStoryEditDialog();
    
                toast.current?.show({
                    severity: "success",
                    summary: "Success",
                    detail: "User Story Updated Successfully",
                    life: 3000
                });
            } catch (error) {
                console.error("Error updating user story:", error);
                toast.current?.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Failed to update user story",
                    life: 3000
                });
            }
        }
    };
    

    const handleConfirm = async () => {
        setShowConfirmDialog(false);
        try {
            await addUserStory(pendingStory, true);
            handleSuccess();
        } catch (error) {
            handleError(error);
        }
    };

    const handleSuccess = () => {
        fetchData();
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

    // Close the dialog
    const closeDialog = () => {
        setShowDialog(false);
    };

    const closeStoryEditDialog = () => {
        setStoryEditDialog(false);
    };

    const toggleRowExpansion = (rowId: string) => {
        setExpandedRows(prev => {
            const newExpanded = { ...prev };
            if (newExpanded[rowId]) {
                delete newExpanded[rowId];
            } else {
                newExpanded[rowId] = true;
            }
            return newExpanded;
        });
    };
    // Handle row click (excluding expander icon clicks)
    const handleRowClick = (event: any) => {
        const isExpanderClick = event.originalEvent.target.closest('.p-row-toggler');
        if (isExpanderClick) return;

        const rowId = event.data._id;
        toggleRowExpansion(rowId);
    };

    // const filteredStories = userStories.filter(story =>
    //     story.story.toLowerCase().includes(filterValue.toLowerCase())
    // );




    // console.log(ambStatus,"AMBSTAUS", mindMapStatus,"MINDMAPSTATUS",progressValues,"TSSTATUS")


    const rowExpansionTemplate = (data: UserStoryData) => {
        // useEffect(() => {
        //     if (data?.acceptance_criteria?.length > 0) {
        //         // Calculate progress percentage and truncate decimals
        //         const progress = ((acIndex + 1) / data.acceptance_criteria.length) * 100;
        //         setProgressValue(Math.floor(progress)); // Ensures progress is an integer
        //     }
        // }, [acIndex, data?.acceptance_criteria]);
        const progressValue = progressValues[data._id] || 0;
        const ambiguityStatus = ambStatus[data._id] || "new";
        const Mind_Map_Status = mindMapStatus[data._id] || 0;
        const mindMapProgress = (Mind_Map_Status / 2) * 100;
        const progressMindMapColor = mindMapProgress < 50 ? "bg-amber-500" : "bg-green-500";
        const progressTestScenarioColor = progressValue < 50 ? "bg-amber-500" : "bg-green-500";

        return (
            <div
                className="relative rounded-3xl shadow-2xl p-8 bg-gradient-to-br from-gray-50 to-white hover:shadow-[0_25px_50px_rgba(0,0,0,0.15)] transition-all duration-300"
                style={{ border: "1px solid #e5e7eb" }}
            >
                {/* Header and Story Content in a Row */}
                <div className={`flex ${window.innerWidth < 768 ? 'flex-col' : 'justify-between'} items-center`}>
                    <div>
                        <h3 className="text-md font-extrabold text-gray-800 tracking-wide">
                            User Story
                        </h3>
                        <p className={`text-gray-600 text-sm leading-relaxed ${window.innerWidth > 768 ? 'w-[500px]' : 'w-full'}`}>
                            {data?.story || "No story provided."}
                        </p>
                    </div>

                    {/* Action Buttons Section */}
                    <div className={`flex ${window.innerWidth < 768 ? 'flex-col space-y-4 pt-6' : 'space-x-6'}`}>
                        <div className="flex flex-col items-center">
                            <Button
                                label="Kill Ambiguity"
                                size="small"
                                className="p-button-lg p-button-rounded"
                                onClick={() => navigate("/dashboard/ac/checker", { state: { userStory: data } })}
                            />
                            {/* Progress Bar for Ambiguities */}
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2 shadow-inner">
                                <div
                                    className={`h-2 rounded-full ${ambiguityStatus === "pending" || ambiguityStatus === "processing"
                                            ? "bg-amber-500"
                                            : ambiguityStatus === "refined"
                                                ? "bg-green-500"
                                                : "bg-transparent"
                                        }`}
                                    style={{ width: (ambiguityStatus === "pending" || ambiguityStatus === "processing") ? "50%" : ambiguityStatus === "refined" ? "100%" : "0%" }}
                                ></div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center">
                            <Button
                                label="Mind Maps"
                                size="small"
                                className="p-button-lg p-button-rounded"
                                onClick={() => navigate("/dashboard/mm/viewer", { state: { userStory: data, isCollapsed } })}
                            />
                            {/* Progress Bar for Mind Maps */}
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2 shadow-inner">
                                <div
                                    className={`${progressMindMapColor} h-2 rounded-full`}
                                    style={{ width: `${Math.min(mindMapProgress || 0, 100)}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center">
                            <Button
                                label="Test Scenarios"
                                size="small"
                                className="p-button-lg p-button-rounded"
                                onClick={() => navigate("/dashboard/ts/generator", { state: { userStory: data } })}
                            />
                            {/* Progress Bar for Test Scenarios */}
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2 shadow-inner">
                                <div
                                    className={`${progressTestScenarioColor} h-2 rounded-full`}
                                    style={{ width: `${Math.min(progressValue || 0, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const header = (
        <div className="flex items-center justify-between flex-wrap">
            <h2 className="text-xl font-semibold text-gray-800 w-full md:w-auto">User Stories</h2>
        </div>
    );

    return (
        <div className="p-2 md:p-6">
            <Toast ref={toast} />
            <Dialog
                visible={showConfirmDialog}
                onHide={() => setShowConfirmDialog(false)}
                header="Invalid Format"
                footer={
                    <div className='flex flex-col sm:flex-row items-center gap-4'>
                        <Button label="No" icon="pi pi-times" onClick={() => setShowConfirmDialog(false)} className="p-button-text" size='small' />
                        <Button label="Yes" icon="pi pi-check" onClick={handleConfirm} autoFocus className="p-button-text" size='small' />
                    </div>
                }
            >
                <p className="text-center sm:text-left">The requirement you entered does not appear to be in a valid format. Would you still like to proceed with adding it?</p>
            </Dialog>
            <Sidebar
                visible={showDialog}
                position="right"
                onHide={() => closeDialog()}
                className="p-sidebar-lg"
                style={{
                    width: '90%',
                    maxWidth: '750px',
                    height: '100vh',
                    borderTopLeftRadius: '20px',
                    borderBottomLeftRadius: '20px',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                    backdropFilter: 'blur(8px)',
                }}
            >
                <Stepper ref={stepperRef} style={{ flexBasis: "50rem" }} pt={{
                    root: { style: { backgroundColor: 'transparent' } },
                    stepper: { style: { backgroundColor: 'transparent' } },
                    panelContainer: { style: { backgroundColor: 'transparent' } }
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
                                className={`w-full p-inputtext p-component border ${userStoryError ? "border-red-500" : "border-gray-300"
                                    } focus:ring-2 focus:ring-indigo-500 p-4 h-80 rounded-lg shadow-sm text-gray-700`}
                            />
                            {userStoryError && (
                                <p className="text-red-500 text-sm mt-1">{userStoryError}</p>
                            )}
                        </div>
                        <div className="flex pt-4 justify-end">
                            <Button
                                label="Next"
                                size="small"
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
                                size="small"
                                severity="secondary"
                                icon="pi pi-arrow-left"
                                onClick={() => stepperRef.current.prevCallback()}
                            />
                            <Button
                                label="Next"
                                size="small"
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
                                <Button
                                    onClick={handleAddItem}
                                    label="Add"
                                    size="small"
                                    className="text-white rounded-r-lg shadow border border-[#BA0000] font-bold"
                                    style={{ backgroundColor: "#BA0000", padding: "16px 24px" }}
                                />
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
                                                        size="small"
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
                                                    size="small"
                                                    className="p-button-text text-blue-500"
                                                    onClick={() => handleEditItem(index)}
                                                    tooltip="Edit"
                                                />
                                                <Button
                                                    icon="pi pi-trash"
                                                    size="small"
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
                                size="small"
                                severity="secondary"
                                icon="pi pi-arrow-left"
                                onClick={() => stepperRef.current.prevCallback()}
                            />
                            <Button
                                label="Next"
                                size="small"
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
                                size="small"
                                severity="secondary"
                                icon="pi pi-arrow-left"
                                onClick={() => stepperRef.current.prevCallback()}
                            />
                            <Button
                                label="Save"
                                size="small"
                                icon="pi pi-save"
                                onClick={saveUserStory}
                            />
                        </div>
                    </StepperPanel>
                </Stepper>
            </Sidebar>
            <Sidebar
                visible={storyEditDialog}
                position="right"
                onHide={() => closeStoryEditDialog()}
                className="p-sidebar-lg"
                style={{
                    width: '90%',
                    maxWidth: '750px',
                    height: '100vh',
                    borderTopLeftRadius: '20px',
                    borderBottomLeftRadius: '20px',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                    backdropFilter: 'blur(8px)',
                }}
            >
                <Stepper ref={stepperRef} style={{ flexBasis: "50rem" }} pt={{
                    root: { style: { backgroundColor: 'transparent' } },
                    stepper: { style: { backgroundColor: 'transparent' } },
                    panelContainer: { style: { backgroundColor: 'transparent' } }
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
                                className={`w-full p-inputtext p-component border ${userStoryError ? "border-red-500" : "border-gray-300"
                                    } focus:ring-2 focus:ring-indigo-500 p-4 h-80 rounded-lg shadow-sm text-gray-700`}
                            />
                            {userStoryError && (
                                <p className="text-red-500 text-sm mt-1">{userStoryError}</p>
                            )}
                        </div>
                        <div className="flex pt-4 justify-end">
                            <Button
                                label="Next"
                                size="small"
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
                                size="small"
                                severity="secondary"
                                icon="pi pi-arrow-left"
                                onClick={() => stepperRef.current.prevCallback()}
                            />
                            <Button
                                label="Next"
                                size="small"
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
                                <Button
                                    onClick={handleAddItem}
                                    label="Add"
                                    size="small"
                                    className="text-white rounded-r-lg shadow border border-[#BA0000] font-bold"
                                    style={{ backgroundColor: "#BA0000", padding: "16px 24px" }}
                                />
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
                                                        size="small"
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
                                                    size="small"
                                                    className="p-button-text text-blue-500"
                                                    onClick={() => handleEditItem(index)}
                                                    tooltip="Edit"
                                                />
                                                <Button
                                                    icon="pi pi-trash"
                                                    size="small"
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
                                size="small"
                                severity="secondary"
                                icon="pi pi-arrow-left"
                                onClick={() => stepperRef.current.prevCallback()}
                            />
                            <Button
                                label="Next"
                                size="small"
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
                                size="small"
                                severity="secondary"
                                icon="pi pi-arrow-left"
                                onClick={() => stepperRef.current.prevCallback()}
                            />
                            <Button
                                label="Save"
                                size="small"
                                icon="pi pi-save"
                                onClick={() => handleUpdateUserStory(selectedStoryId)} 
                            />
                        </div>
                    </StepperPanel>
                </Stepper>
            </Sidebar>
            {/* <div className="mt-8 w-1/2 bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-lg font-semibold mb-4">Chart</h3>
              {calculatedProjectMetrics ? (
                <ReactApexChart 
                  options={chartOptions} 
                  series={chartSeries} 
                  type="radar" 
                  height={350} 
                />
              ) : (
                <div className="text-gray-500">Loading chart...</div>
              )}
            </div> */}
            {/* <div className="flex justify-between gap-16 items-start"> */}
            <div className={`flex gap-8 ${window.innerWidth < 768 ? 'flex-col gap-[1px] items-center' : 'items-center'}`}>
                <div
                    onClick={() => setIsHovered(!isHovered)}
                    className={`cursor-pointer ${window.innerWidth < 768 ? 'mb-4' : ''}`}
                    style={{ width: isHovered ? '100%' : 'auto' }}
                >
                    <ChartContainer
                        projectMetrics={calculatedProjectMetrics}
                        chartOptions={chartOptions}
                        chartSeries={chartSeries}
                    />
                </div>
                {!isHovered && (
                    <ProjectMetrics
                        projectMetrics={projectMetrics}
                        calculatedProjectMetrics={calculatedProjectMetrics}
                        chartOptions={chartOptions}
                        chartSeries={chartSeries}
                    />
                )}
            </div>
            <div className="flex gap-8 mt-[20px] items-center">
                {/* Additional content can go here */}
            </div>

            {/* <div className="flex flex-wrap items-center mt-4">
                    <div className="flex items-center m-2">
                        <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
                        <span className="text-sm font-bold">{redDots} - Discovery Phase</span>
                    </div>
                    <div className="flex items-center m-2">
                        <div className="w-4 h-4 rounded-full bg-amber-500 mr-2"></div>
                        <span className="text-sm font-bold">{amberDots} - Design Phase</span>
                    </div>
                    <div className="flex items-center m-2">
                        <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                        <span className="text-sm font-bold">{greenDots} - Execution Phase</span>
                    </div>
                </div> */}
            {/* </div> */}
            <DataTable
                value={filteredStories} // storiesWithScores
                expandedRows={expandedRows}
                showGridlines
                selectionMode="single"
                selection={selectedStory}
                onSelectionChange={(e) => {
                    setSelectedStory(e.value);
                    if (window.innerWidth < 768) {
                        setTimeout(() => {
                            window.scrollTo({
                                top: window.scrollY + 150, // Scroll down a little bit
                                behavior: 'smooth' // Smooth scrolling animation
                            });
                        }, 0);
                    }
                }}
                onRowToggle={(e) => toggleRowExpansion(e.data._id)}
                onRowClick={handleRowClick}
                rowExpansionTemplate={rowExpansionTemplate}
                dataKey="_id"
                className="rounded-3xl overflow-hidden border border-gray-200 shadow-lg"
                paginator
                rows={10}
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                rowsPerPageOptions={[5, 10, 20, 50]}
            >
                <Column
                    header={() => (
                        <div className={`flex justify-between items-center gap-4 flex-wrap w-full`}> {/*<div className={`flex justify-between items-center gap-4 flex-wrap ${window.innerWidth < 768 ? 'flex-col w-full' : ''}`}>*/}
                            <div className="flex items-center gap-2">
                                <p className="text-sm text-black">User Stories</p>
                                <Button
                                    icon="pi pi-plus"
                                    size="small"
                                    className="p-button-rounded p-button-primary p-button-sm rounded-full w-[25px] h-[25px] flex items-center justify-center p-1"
                                    tooltip="Add User Story"
                                    onClick={openDialog}
                                />
                            </div>
                            {/* <Dropdown
                                value={statusFilter}
                                options={statusOptions}
                                onChange={(e) => {
                                    setStatusFilter(e.value);
                                    fetchData(); // Call fetchData when dropdown value changes
                                }}
                                placeholder="Filter"
                                className={`w-[100px] text-sm py-1 px-2 ${window.innerWidth < 768 ? 'w-full' : ''}`}
                                itemTemplate={(option) => <span className="text-sm">{option.label}</span>}
                                pt={{
                                    input: { className: "text-sm py-1 px-2" },
                                    trigger: { className: "w-6 h-6" },
                                }}
                            /> */}
                            <InputText
                                value={filterValue}
                                onChange={(e) => {
                                    setFilterValue(e.target.value);
                                    fetchData(); // Call fetchData whenever input changes
                                }}
                                placeholder="Search by name"
                                className={`p-inputtext-sm text-sm py-2 px-2 ${isCollapsed ? "w-[680px]" : "w-[560px]"} ${window.innerWidth < 768 ? 'w-full' : ''}`}
                            />
                        </div>
                    )}
                    body={(rowData) => (
                        <span className="text-gray-800 text-sm font-medium">{rowData.story.length > 40
                            ? `${rowData.story.substring(0, 200)}`
                            : rowData.story}</span>
                    )}
                />
                {/* <Column
                    header={() => (
                        <div className="relative group flex items-center justify-center">
                            <p className="text-sm pl-[25px] text-black cursor-pointer">Story Status</p>
                            <div className="absolute left-1/2 -translate-x-1/2 top-10 w-[200px] bg-white p-4 rounded-lg shadow-lg border border-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                    <span className="text-gray-600 text-xs">Story in Discovery Phase</span>
                                </div>
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                    <span className="text-gray-600 text-xs">Story in Design Phase</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    <span className="text-gray-600 text-xs">Story in Execution Phase</span>
                                </div>
                            </div>
                        </div>
                    )}
                    style={{ width: window.innerWidth < 768 ? "10%" : "14%" }}
                    body={(rowData) => {
                        const status = storyStatus[rowData._id];
                        let dotColor = "";
                        if (status === 1) dotColor = "bg-red-500";
                        else if (status === 2) dotColor = "bg-amber-500";
                        else if (status === 3) dotColor = "bg-green-500";
                        return (
                            <div className="flex items-center justify-center">
                                <span className={`w-[16px] h-[16px] rounded-full ${dotColor}`}></span>
                            </div>
                        );
                    }}
                /> */}
                {/* Invest Score Column */}
              {/* <Column
    field="investScore"
    header="Invest Score"
    body={(rowData) => {
        const score = rowData.investScore;
        const percentage = score !== undefined && score !== null ? (score * 100).toFixed(0) : 'N/A';

        // Define dynamic colors based on score value
        let badgeColor = "bg-gray-200 text-gray-800"; // Default for N/A
        if (score !== undefined && score !== null) {
            if (score >= 0.8) badgeColor = "bg-green-100 text-green-700"; // High Score
            else if (score >= 0.5) badgeColor = "bg-yellow-100 text-yellow-700"; // Medium Score
            else badgeColor = "bg-red-100 text-red-700"; // Low Score
        }
            

                {/* Edit Column */}
                <Column
    header="Score"
    body={(rowData) => (
        <ScoreBadge 
            evaluation_status={rowData.evaluation_status}
            evaluation={rowData.evaluation} 
            storyId={rowData._id} 
        />
    )}
    style={{ width: '80px' }}
    align="center"
/>
<Column
    header="Edit"
    style={{ width: '4rem' }}
    body={(rowData) => (
        <Button
            icon="pi pi-user-edit"
            className="p-button-rounded p-button-text"
            onClick={() => {
                setUserStory(rowData.story || '');
                setContext(rowData.context || '');
                setItems(rowData.manual_acceptance_criteria || []);
                openEditDialog();
                setSelectedStoryId(rowData._id); // Store the story ID
            }}
        />
    )}
/>


            </DataTable>
        </div>
    );
}
