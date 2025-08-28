// src/pages/qa-metrics-dashboard/index.tsx
import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ComposedChart
} from "recharts";
import { FiMoon, FiSun, FiTrendingUp, FiAlertCircle, FiBarChart2, FiPieChart, FiUpload, FiDatabase, FiCheckSquare, FiRepeat, FiAlertTriangle, FiList, FiTrendingDown, FiCheckCircle, FiUsers, FiClock, FiPercent, FiActivity, FiShield, FiCode } from "react-icons/fi";
import { IoWarningOutline } from "react-icons/io5";
import Papa from 'papaparse';
import file from "./Defect_Dataset_with_Status_Lifecycle.csv"

// Custom color palette
const COLORS = {
  light: {
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F59E0B',
    background: '#F9FAFB',
    card: '#FFFFFF',
    text: '#111827',
    border: '#E5E7EB'
  },
  dark: {
    primary: '#60A5FA',
    secondary: '#34D399',
    accent: '#FBBF24',
    background: '#1F2937',
    card: '#374151',
    text: '#F9FAFB',
    border: '#4B5563'
  }
};

const QAMetricsDashboard = () => {
  const [activeTab, setActiveTab] = useState("data");
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [recommendations, setRecommendations] = useState('');
  const [selectedIssue, setSelectedIssue] = useState('');

  const [rcaResponse, setRcaResponse] = useState('');
  const [isLoadingRca, setIsLoadingRca] = useState(false);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);


  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Apply theme classes to body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Handle file upload
//   const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       Papa.parse(file, {
//         header: true,
//         complete: (results) => {
//           setCsvData(results.data);
//           setFileUploaded(true);
//         },
//         error: (error) => {
//           console.error('Error parsing CSV:', error);
//         }
//       });
//     }
//   };

const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        setCsvData(results.data);
        setFileUploaded(true);
  
        const formData = new FormData();
        formData.append('file', file);
  
        try {
          setIsLoadingRecommendations(true); // Start loader
  
          const response = await fetch('http://49.249.95.65:4061/defects/recommendations', {
            method: 'POST',
            headers: { accept: 'application/json' },
            body: formData,
          });
  
          setIsLoadingRecommendations(false); // Stop loader
  
          if (!response.ok) {
            throw new Error(`Recommendations fetch failed with status ${response.status}`);
          }
  
          const data = await response.json();
          console.log('Recommendations Response:', data);
  
          if (data) {
            setRecommendations(data);
          } else {
            console.warn('No recommendations field found in response');
          }
  
        } catch (error) {
          setIsLoadingRecommendations(false); // Stop loader on error
          console.error('Error during recommendation request:', error);
        }
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
      },
    });
  };
  

  const handleIssueChange = async (issueId: string) => {
    setSelectedIssue(issueId);
    setIsLoadingRca(true); // Start loader
    setRcaResponse(''); // Optionally clear previous data
  
    try {
      const response = await fetch('http://49.249.95.65:4061/defects/RCA', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json',
        },
        body: JSON.stringify({ id: issueId }),
      });
  
      if (!response.ok) {
        throw new Error(`RCA API failed with status ${response.status}`);
      }
  
      const data = await response.json();
      console.log('RCA Response:', data);
  
      setRcaResponse(data.rca || JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error fetching RCA:', error);
      setRcaResponse('Failed to fetch RCA details.');
    } finally {
      setIsLoadingRca(false); // Stop loader
    }
  };
  
  
  

  // Sample data - will be replaced with API data later
  const data = {
    general: {
      mttd: [{ sprint: "Sprint-1", value: 12 }, { sprint: "Sprint-2", value: 9 }],
      defectDensity: [{ sprint: "Sprint-1", density: 0.8 }, { sprint: "Sprint-2", density: 0.5 }],
      sprintDefects: [{ sprint: "Sprint-1", defects: 25 }, { sprint: "Sprint-2", defects: 18 }],
      componentDefects: [{ component: "UI", defects: 10 }, { component: "API", defects: 20 }],
      timeTrends: [{ date: "2025-05-01", defects: 3 }, { date: "2025-05-02", defects: 6 }],
      severity: [{ severity: "Critical", count: 4 }, { severity: "Major", count: 8 }, { severity: "Minor", count: 12 }],
      status: [{ status: "Open", count: 7 }, { status: "Closed", count: 10 }, { status: "Reopened", count: 3 }],
      testCycleDefects: [{ cycle: "TCY-101", defects: 6 }, { cycle: "TCY-102", defects: 9 }],
      passFail: [{ build: "1.0.0", passed: 90, failed: 10 }, { build: "1.0.1", passed: 85, failed: 15 }],
      execution: [{ sprint: "Sprint-1", executed: 100, passed: 85, failed: 15 }]
    },
    predictive: {
      forecast: [{ sprint: "Sprint-3", forecast: 0.6 }],
      severityPred: [
        { severity: "Critical", probability: 0.3 },
        { severity: "Major", probability: 0.5 },
        { severity: "Minor", probability: 0.2 }
      ],
      hotspots: [{ component: "UI", risk: 0.75 }, { component: "API", risk: 0.9 }]
    },
    prescriptive: {
      priority: [{ testCase: "TC-001", score: 0.9 }, { testCase: "TC-002", score: 0.7 }],
      escapeRate: [{ sprint: "Sprint-1", rate: 10 }],
      effectiveness: [{ sprint: "Sprint-1", value: 85 }],
      utilization: [{ sprint: "Sprint-1", actual: 45, required: 40 }],
      riskProb: [{ component: "API", risk: 0.8 }, { component: "UI", risk: 0.5 }],
      roi: [{ sprint: "Sprint-1", roi: 1.4 }],
      coverage: [{ sprint: "Sprint-1", coverage: 78 }],
      defectVsCoverage: [
        { sprint: "Sprint-1", coverage: 78, defects: 25 },
        { sprint: "Sprint-2", coverage: 85, defects: 18 }
      ]
    }
  };
  const defectSeverityPredictionData = [
    { severity: "Critical", current: 5, predicted: 7 },
    { severity: "Major", current: 12, predicted: 15 },
    { severity: "Minor", current: 18, predicted: 14 },
    { severity: "Trivial", current: 8, predicted: 10 },
    { severity: "Blocker", current: 3, predicted: 5 }
  ];
  
  // --- Prescriptive Metrics ---
const testCasePrioritizationData = [
    { testCase: 'Test Case 1', priorityIndex: 0.9 },
    { testCase: 'Test Case 2', priorityIndex: 0.7 },
    { testCase: 'Test Case 3', priorityIndex: 0.5 },
    { testCase: 'Test Case 4', priorityIndex: 0.8 },
    { testCase: 'Test Case 5', priorityIndex: 0.6 },
];

const defectEscapeRateData = [
    { stage: 'SIT', escaped: 5 },
    { stage: 'UAT', escaped: 3 },
    { stage: 'Production', escaped: 2 },
];

const testEffectivenessData = [
    { metric: 'Effectiveness', value: 85 }, // in percentage
];

const resourceUtilizationData = [
    { resource: 'Tester A', utilized: 80, available: 100 },
    { resource: 'Tester B', utilized: 90, available: 100 },
    { resource: 'Tester C', utilized: 60, available: 100 },
];

const riskBasedDefectProbabilityData = [
    { riskFactor: 'High', probability: 0.7 },
    { riskFactor: 'Medium', probability: 0.4 },
    { riskFactor: 'Low', probability: 0.2 },
];

const regressionTestROIData = [
    { quarter: 'Q1', roi: 1.5 }, // ROI value
    { quarter: 'Q2', roi: 1.8 },
    { quarter: 'Q3', roi: 1.6 },
    { quarter: 'Q4', roi: 2.0 },
];

const testerHoursData = [
    { tester: 'Tester 1', spent: 160, required: 180 },
    { tester: 'Tester 2', spent: 190, required: 170 },
    { tester: 'Tester 3', spent: 150, required: 160 },
];

const testCoverageData = [
    { type: 'Unit', coverage: 75 },
    { type: 'Integration', coverage: 60 },
    { type: 'System', coverage: 50 },
];

const defectDensityCoverageEffortData = [
    { sprint: 'Sprint 1', density: 2.8, coverage: 65, effort: 120 },
    { sprint: 'Sprint 2', density: 3.2, coverage: 70, effort: 130 },
    { sprint: 'Sprint 3', density: 3.0, coverage: 68, effort: 125 },
    { sprint: 'Sprint 4', density: 3.5, coverage: 75, effort: 140 },
    { sprint: 'Sprint 5', density: 3.1, coverage: 72, effort: 135 },
];


const mttdData = [
    { month: 'Jan', days: 7 },
    { month: 'Feb', days: 5 },
    { month: 'Mar', days: 6 },
    { month: 'Apr', days: 4 },
    { month: 'May', days: 5 },
    { month: 'Jun', days: 6 },
];

const defectDensityData = [
    { sprint: 'Sprint 1', density: 2.5 },
    { sprint: 'Sprint 2', density: 3.0 },
    { sprint: 'Sprint 3', density: 2.8 },
    { sprint: 'Sprint 4', density: 3.2 },
    { sprint: 'Sprint 5', density: 2.9 },
];


const sprintWiseDefectsData = [
    { sprint: 'Sprint 1', defects: 15 },
    { sprint: 'Sprint 2', defects: 22 },
    { sprint: 'Sprint 3', defects: 18 },
    { sprint: 'Sprint 4', defects: 25 },
    { sprint: 'Sprint 5', defects: 20 },
];

const componentWiseDefectsData = [
    { component: 'Auth', defects: 10 },
    { component: 'Dashboard', defects: 25 },
    { component: 'API', defects: 18 },
    { component: 'UI', defects: 30 },
    { component: 'Database', defects: 12 },
];

const timeTrendsData = [
    { date: '2024-01', defects: 20 },
    { date: '2024-02', defects: 35 },
    { date: '2024-03', defects: 28 },
    { date: '2024-04', defects: 42 },
    { date: '2024-05', defects: 38 },
    { date: '2024-06', defects: 45 },
];

const defectsBySeverityData = [
    { severity: 'High', count: 30 },
    { severity: 'Medium', count: 50 },
    { severity: 'Low', count: 20 },
];

const defectsByComponentData = [
    { component: 'Component A', count: 40 },
    { component: 'Component B', count: 60 },
    { component: 'Component C', count: 35 },
];

const defectsByStatusData = [
    { status: 'Open', count: 45 },
    { status: 'In Progress', count: 25 },
    { status: 'Resolved', count: 60 },
    { status: 'Closed', count: 50 },
];

const defectsByTestCycleData = [
    { cycle: 'Cycle 1', defects: 55 },
    { cycle: 'Cycle 2', defects: 40 },
    { cycle: 'Cycle 3', defects: 30 },
];

const testPassFailRatioData = [
    { build: 'Build 1', pass: 80, fail: 20 },
    { build: 'Build 2', pass: 90, fail: 10 },
    { build: 'Build 3', pass: 75, fail: 25 },
    { build: 'Build 4', pass: 85, fail: 15 },
    { build: 'Build 5', pass: 92, fail: 8 },
];

const testExecutionSummaryData = [
    { sprint: 'Sprint 1', passed: 200, failed: 10, skipped: 5, total: 215 },
    { sprint: 'Sprint 2', passed: 250, failed: 15, skipped: 8, total: 273 },
    { sprint: 'Sprint 3', passed: 220, failed: 12, skipped: 6, total: 238 },
];

  const requirementAmbiguityData = [
    { date: '2025-01-01', score: 1 },
    { date: '2025-02-01', score: 1.5 },
    { date: '2025-03-01', score: 2 },
    { date: '2025-04-01', score: 3 },
    { date: '2025-05-01', score: 4 },
  ];

  const shiftLeftData = [
    { sprint: 'Sprint 1', daysReady: 5 },
    { sprint: 'Sprint 2', daysReady: 10 },
    { sprint: 'Sprint 3', daysReady: 15 },
    { sprint: 'Sprint 4', daysReady: 20 },
    { sprint: 'Sprint 5', daysReady: 25 },
  ];

  const issues = [
    {
      issueId: 'MMT-1007',
      title: 'Seat selection not saving',
      // Other data omitted
    },
    {
      issueId: 'MMT-1008',
      title: 'Mobile site not redirecting properly',
      // Other data omitted
    },
    // Add more issues here...
  ];
  
  // Chart theme configuration
  const chartTheme = {
    textColor: darkMode ? COLORS.dark.text : COLORS.light.text,
    gridColor: darkMode ? '#4B5563' : '#E5E7EB',
    tooltip: {
      backgroundColor: darkMode ? COLORS.dark.card : COLORS.light.card,
      borderColor: darkMode ? COLORS.dark.border : COLORS.light.border,
      textColor: darkMode ? COLORS.dark.text : COLORS.light.text
    }
  };

  const formatRecommendationsText = (text: string) => {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-yellow-600 dark:text-yellow-400">$1</strong>') // bold
      .replace(/\n/g, '<br/>') // new lines
      .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;'); // tab = 4 spaces
  };
  
  const formatRcaResponseText = (text: string) => {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-yellow-600 dark:text-yellow-400">$1</strong>') // bold text
      .replace(/\n/g, '<br/>') // new lines
      .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;'); // tab = 4 spaces
  };
  

  const renderGeneralAnalytics = () => (
    <div>
        <div className="bg-white dark:bg-gray-800 shadow-lg border dark:border-gray-700 my-8 rounded-lg">
  <div className="px-6 py-4 border-b dark:border-gray-700">
    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
      <FiCheckSquare className="mr-2 h-5 w-5" />
      Test Execution Summary
    </h2>
    <p className="text-gray-500 dark:text-gray-400">Summary of test execution results for each sprint</p>
  </div>
  <div className="px-6 py-4">
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">Sprint</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">Passed</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">Failed</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">Skipped</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">Total</th>
          </tr>
        </thead>
        <tbody>
          {testExecutionSummaryData.map((item, index) => (
            <tr key={index} className="border-t dark:border-gray-700">
              <td className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">{item.sprint}</td>
              <td className="px-4 py-2 text-sm text-green-500">{item.passed}</td>
              <td className="px-4 py-2 text-sm text-red-500">{item.failed}</td>
              <td className="px-4 py-2 text-sm text-yellow-500">{item.skipped}</td>
              <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{item.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
</div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* MTTR Chart */}
      <div className="w-full transform transition-all hover:scale-[1.02] duration-200">
        <div className={`rounded-xl shadow-lg p-4 h-full ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
          <div className="flex items-center mb-4">
            <FiTrendingUp className={`text-xl mr-2 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`} />
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Mean Time to Detect</h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Components with highest number of failures
        </p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.general.mttd}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
              <XAxis dataKey="sprint" stroke={chartTheme.textColor} />
              <YAxis stroke={chartTheme.textColor} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: chartTheme.tooltip.backgroundColor,
                  borderColor: chartTheme.tooltip.borderColor,
                  color: chartTheme.tooltip.textColor
                }} 
              />
              <Legend />
              <Bar dataKey="value" fill={COLORS[darkMode ? 'dark' : 'light'].primary} name="MTTD (hours)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Defect Density */}
      <div className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      {/* Header */}
      <div className="mb-4">
        <div className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          {/* <BugIcon className="mr-2 h-5 w-5 text-green-500" /> */}
          
          <FiTrendingUp className={`text-xl mr-2 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`} />Defect Density Forecast
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Predicted defect density for the next sprint
        </p>
      </div>

      {/* Chart */}
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={defectDensityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(200, 200, 200, 0.3)" />
            <XAxis dataKey="sprint" stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
            <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
            <Tooltip
              contentStyle={
                darkMode
                  ? {
                      backgroundColor: '#374151',
                      borderColor: '#4B5563',
                      color: '#fff',
                    }
                  : {}
              }
            />
            <Legend wrapperStyle={{ color: darkMode ? '#9CA3AF' : '#6B7280' }} />
            <Bar dataKey="density" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

      {/* Sprint Defects */}
      <div className="w-full transform transition-all hover:scale-[1.02] duration-200">
        <div className={`rounded-xl shadow-lg p-4 h-full ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
          <div className="flex items-center mb-4">
            <FiAlertCircle className={`text-xl mr-2 ${darkMode ? 'text-yellow-300' : 'text-yellow-600'}`} />
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Defects per Sprint</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.general.sprintDefects}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
              <XAxis dataKey="sprint" stroke={chartTheme.textColor} />
              <YAxis stroke={chartTheme.textColor} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: chartTheme.tooltip.backgroundColor,
                  borderColor: chartTheme.tooltip.borderColor,
                  color: chartTheme.tooltip.textColor
                }} 
              />
              <Legend />
              <Bar 
                dataKey="defects" 
                fill={COLORS[darkMode ? 'dark' : 'light'].accent} 
                name="Defects"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Component Defects */}
      <div className="w-full transform transition-all hover:scale-[1.02] duration-200">
        <div className={`rounded-xl shadow-lg p-4 h-full ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
          <div className="flex items-center mb-4">
            <FiPieChart className={`text-xl mr-2 ${darkMode ? 'text-purple-300' : 'text-purple-600'}`} />
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Defects by Component</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.general.componentDefects}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="defects"
                nameKey="component"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.general.componentDefects.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={[
                      COLORS[darkMode ? 'dark' : 'light'].primary,
                      COLORS[darkMode ? 'dark' : 'light'].secondary,
                      COLORS[darkMode ? 'dark' : 'light'].accent,
                      '#8884d8',
                      '#82CA9D'
                    ][index % 5]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: chartTheme.tooltip.backgroundColor,
                  borderColor: chartTheme.tooltip.borderColor,
                  color: chartTheme.tooltip.textColor
                }} 
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Time Trends */}
      <div className="w-full transform transition-all hover:scale-[1.02] duration-200">
        <div className={`rounded-xl shadow-lg p-4 h-full ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
        <h3 className={`text-lg font-semibold mb-4 flex items-center ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
  <FiAlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
  Defect Trends Over Time
</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.general.timeTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
              <XAxis dataKey="date" stroke={chartTheme.textColor} />
              <YAxis stroke={chartTheme.textColor} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: chartTheme.tooltip.backgroundColor,
                  borderColor: chartTheme.tooltip.borderColor,
                  color: chartTheme.tooltip.textColor
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="defects" 
                stroke="#FF8042" 
                fill="#FF8042" 
                fillOpacity={0.4}
                name="Defects" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Severity Distribution */}
      <div className="w-full transform transition-all hover:scale-[1.02] duration-200">
        <div className={`rounded-xl shadow-lg p-4 h-full ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
        <h3 className={`text-lg font-semibold mb-4 flex items-center ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
  <FiAlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
  Defect Severity Distribution
</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.general.severity}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                nameKey="severity"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.general.severity.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={[
                      '#FF6384',
                      '#36A2EB',
                      '#FFCE56',
                      '#4BC0C0',
                      '#9966FF'
                    ][index % 5]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: chartTheme.tooltip.backgroundColor,
                  borderColor: chartTheme.tooltip.borderColor,
                  color: chartTheme.tooltip.textColor
                }} 
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <div className="mb-4">
        <div className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <FiRepeat className="mr-2 h-5 w-5 text-yellow-600" /> Defects by Test Cycle
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Defects found in each test cycle
        </p>
      </div>
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={defectsByTestCycleData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(200, 200, 200, 0.3)" />
            <XAxis
              dataKey="cycle"
              stroke={darkMode ? '#9CA3AF' : '#6B7280'}
            />
            <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
            <Tooltip
              contentStyle={
                darkMode
                  ? {
                      backgroundColor: '#374151',
                      borderColor: '#4B5563',
                      color: '#fff'
                    }
                  : {}
              }
            />
            <Legend
              wrapperStyle={{
                color: darkMode ? '#9CA3AF' : '#6B7280'
              }}
            />
            <Bar dataKey="defects" fill="#ffc107" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
    <div className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <div className="mb-4">
        <div className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <FiCheckSquare className="mr-2 h-5 w-5 text-yellow-600" /> Test Pass/Fail Ratio
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Ratio of passed to failed tests for each build
        </p>
      </div>
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={testPassFailRatioData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(200, 200, 200, 0.3)" />
            <XAxis dataKey="build" stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
            <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
            <Tooltip
              contentStyle={
                darkMode
                  ? {
                      backgroundColor: '#374151',
                      borderColor: '#4B5563',
                      color: '#fff'
                    }
                  : {}
              }
            />
            <Legend wrapperStyle={{ color: darkMode ? '#9CA3AF' : '#6B7280' }} />
            <Bar dataKey="pass" fill="#4CAF50" name="Passed" />
            <Bar dataKey="fail" fill="#F44336" name="Failed" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
    <div className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <div className="mb-4">
        <div className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <FiTrendingUp className="mr-2 h-5 w-5 text-yellow-500" /> Defect Timeline
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Defect trends over time
        </p>
      </div>
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={timeTrendsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(200, 200, 200, 0.3)" />
            <XAxis dataKey="date" stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
            <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
            <Tooltip
              contentStyle={
                darkMode
                  ? {
                      backgroundColor: '#374151',
                      borderColor: '#4B5563',
                      color: '#fff'
                    }
                  : {}
              }
            />
            <Legend wrapperStyle={{ color: darkMode ? '#9CA3AF' : '#6B7280' }} />
            <Line type="monotone" dataKey="defects" stroke="#e67e22" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
      </div>


    </div>
  );

  const renderPredictiveMetrics = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Defect Forecast */}
      <div className="w-full transform transition-all hover:scale-[1.02] duration-200">
        <div className={`rounded-xl shadow-lg p-4 h-full ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Defect Density Forecast</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Predicted defect density for the next sprint
        </p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.predictive.forecast}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
              <XAxis dataKey="sprint" stroke={chartTheme.textColor} />
              <YAxis stroke={chartTheme.textColor} domain={[0, 1]} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: chartTheme.tooltip.backgroundColor,
                  borderColor: chartTheme.tooltip.borderColor,
                  color: chartTheme.tooltip.textColor
                }} 
              />
              <Legend />
              <Bar 
                dataKey="forecast" 
                fill="#8884d8" 
                name="Defect Probability"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-lg border dark:border-gray-700 rounded-lg">
  <div className="px-6 py-4 border-b dark:border-gray-700">
    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
      <FiTrendingUp className="mr-2 h-5 w-5" />
      Defect Severity Prediction
    </h2>
    <p className="text-gray-500 dark:text-gray-400">
      Predicted defect severity distribution for the next sprint
    </p>
  </div>
  <div className="px-6 py-4">
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={defectSeverityPredictionData}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(200, 200, 200, 0.3)" />
        <XAxis
          dataKey="severity"
          stroke={darkMode ? '#9CA3AF' : '#6B7280'}
        />
        <YAxis
          stroke={darkMode ? '#9CA3AF' : '#6B7280'}
        />
        <Tooltip
          contentStyle={
            darkMode
              ? { backgroundColor: '#374151', borderColor: '#4B5563', color: '#fff' }
              : {}
          }
        />
        <Legend wrapperStyle={{ color: darkMode ? '#9CA3AF' : '#6B7280' }} />
        <Bar dataKey="current" fill="#3498db" name="Current" />
        <Bar dataKey="predicted" fill="#e74c3c" name="Predicted" />
      </BarChart>
    </ResponsiveContainer>
  </div>
</div>

      {/* Risk Hotspots */}
      <div className="w-full transform transition-all hover:scale-[1.02] duration-200">
        <div className={`rounded-xl shadow-lg p-4 h-full ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Failure Hotspot Detection</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Components with highest number of failures
        </p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.predictive.hotspots}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
              <XAxis dataKey="component" stroke={chartTheme.textColor} />
              <YAxis stroke={chartTheme.textColor} domain={[0, 1]} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: chartTheme.tooltip.backgroundColor,
                  borderColor: chartTheme.tooltip.borderColor,
                  color: chartTheme.tooltip.textColor
                }} 
              />
              <Legend />
              <Bar 
                dataKey="risk" 
                fill="#FF8042" 
                name="Risk Score"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderPrescriptiveMetrics = () => (
    <div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

      <div className="bg-white dark:bg-gray-800 shadow-lg border dark:border-gray-700 rounded-lg">
    <div className="px-6 py-4">
        <div className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <FiList className="mr-2 h-5 w-5" /> Test Case Prioritization
        </div>
        <div className="text-gray-500 dark:text-gray-400">
            Index indicating the importance of each test case
        </div>
    </div>
    <div className="px-6 py-4">
        <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
                <thead>
                    <tr>
                        <th className="text-left text-gray-900 dark:text-white px-4 py-2">Test Case</th>
                        <th className="text-left text-gray-900 dark:text-white px-4 py-2">Priority Index</th>
                    </tr>
                </thead>
                <tbody>
                    {testCasePrioritizationData.map((item, index) => (
                        <tr key={index} className="border-t border-gray-300 dark:border-gray-700">
                            <td className="font-medium text-gray-700 dark:text-gray-300 px-4 py-2">{item.testCase}</td>
                            <td
                                className={`font-semibold px-4 py-2 ${
                                    item.priorityIndex > 0.8
                                        ? "text-red-500"
                                        : item.priorityIndex > 0.6
                                        ? "text-orange-500"
                                        : "text-green-500"
                                }`}
                            >
                                {item.priorityIndex.toFixed(2)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
</div>

      {/* Defect Escape Rate */}
      <div className="bg-white dark:bg-gray-800 shadow-lg border dark:border-gray-700 rounded-lg">
    <div className="px-6 py-4">
        <div className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <FiTrendingDown className="mr-2 h-5 w-5" /> Defect Escape Rate
        </div>
        <div className="text-gray-500 dark:text-gray-400">
            Number of defects found in production or later stages
        </div>
    </div>
    <div className="px-6 py-4">
        <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
                <thead>
                    <tr>
                        <th className="text-left text-gray-900 dark:text-white px-4 py-2">Stage</th>
                        <th className="text-left text-gray-900 dark:text-white px-4 py-2">Escaped Defects</th>
                    </tr>
                </thead>
                <tbody>
                    {defectEscapeRateData.map((item, index) => (
                        <tr key={index} className="border-t border-gray-300 dark:border-gray-700">
                            <td className="font-medium text-gray-700 dark:text-gray-300 px-4 py-2">{item.stage}</td>
                            <td className="text-red-500 px-4 py-2">{item.escaped}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
</div>

      {/* Test Effectiveness */}
      <div className="bg-white dark:bg-gray-800 shadow-lg border dark:border-gray-700 rounded-lg">
    <div className="px-6 py-4">
        <div className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <FiCheckCircle className="mr-2 h-5 w-5" /> Test Effectiveness
        </div>
        <div className="text-gray-500 dark:text-gray-400">
            Percentage of defects found by testing
        </div>
    </div>
    <div className="px-6 py-4">
        <div className="relative w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={testEffectivenessData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={130}
                        fill="#82ca9d"
                        dataKey="value"
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, value, index }) => {
                            const RADIAN = Math.PI / 180;
                            const radius = 25 + innerRadius + (outerRadius - innerRadius);
                            const x = cx + radius * Math.cos(-midAngle * RADIAN);
                            const y = cy + radius * Math.sin(-midAngle * RADIAN);

                            return (
                                <text
                                    x={x}
                                    y={y}
                                    fill={darkMode ? '#fff' : '#000'}
                                    textAnchor={x > cx ? "start" : "end"}
                                    dominantBaseline="central"
                                >
                                    {value}%
                                </text>
                            );
                        }}
                    >
                        <Cell fill="#82ca9d" />
                    </Pie>
                    <Tooltip
                        contentStyle={darkMode ? { backgroundColor: '#374151', borderColor: '#4B5563', color: '#fff' } : {}}
                    />
                    <Legend wrapperStyle={{ color: darkMode ? '#9CA3AF' : '#6B7280' }} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    </div>
</div>



      {/* Defects vs Coverage */}

      <div className="bg-white dark:bg-gray-800 shadow-lg border dark:border-gray-700 rounded-lg">
    <div className="px-6 py-4">
        <div className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <FiClock className="mr-2 h-5 w-5" /> Tester Hours
        </div>
        <div className="text-gray-500 dark:text-gray-400">
            Comparison of tester hours spent vs required
        </div>
    </div>
    <div className="px-6 py-4">
        <div className="overflow-x-auto">
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={testerHoursData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(200, 200, 200, 0.3)" />
                    <XAxis dataKey="tester" stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                    <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                    <Tooltip
                        contentStyle={darkMode ? { backgroundColor: '#374151', borderColor: '#4B5563', color: '#fff' } : {}}
                    />
                    <Legend wrapperStyle={{ color: darkMode ? '#9CA3AF' : '#6B7280' }} />
                    <Bar dataKey="spent" fill="#9b59b6" name="Spent" />
                    <Bar dataKey="required" fill="#34495e" name="Required" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
</div>

<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
  <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
      <FiShield className="mr-2 h-5 w-5" />
      Risk Based Defect Probability
    </h2>
    <p className="text-sm text-gray-500 dark:text-gray-400">
      Probability of defects based on risk factors
    </p>
  </div>

  <div className="px-6 py-4">
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={riskBasedDefectProbabilityData}
        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,200,200,0.2)" />
        <XAxis
          dataKey="riskFactor"
          stroke={darkMode ? '#9CA3AF' : '#6B7280'}
          className="text-sm"
        />
        <YAxis
          tickFormatter={(value) => `${value * 100}%`}
          stroke={darkMode ? '#9CA3AF' : '#6B7280'}
          className="text-sm"
        />
        <Tooltip
          contentStyle={
            darkMode
              ? {
                  backgroundColor: '#1F2937',
                  borderColor: '#374151',
                  color: '#F9FAFB',
                }
              : {}
          }
          formatter={(value) => [`${(value * 100).toFixed(2)}%`, 'Probability']}
        />
        <Legend
          wrapperStyle={{
            color: darkMode ? '#D1D5DB' : '#374151',
            fontSize: '0.875rem',
          }}
        />
        <Bar dataKey="probability" fill="#e64a43" name="Defect Probability" />
      </BarChart>
    </ResponsiveContainer>
  </div>
</div>

<div className="bg-white dark:bg-gray-800 shadow-lg border dark:border-gray-700 rounded-lg">
    <div className="px-6 py-4">
        <div className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <FiPercent className="mr-2 h-5 w-5" /> Test Coverage
        </div>
        <div className="text-gray-500 dark:text-gray-400">
            Percentage of code covered by tests
        </div>
    </div>
    <div className="px-6 py-4">
        <div className="overflow-x-auto">
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={testCoverageData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(200, 200, 200, 0.3)" />
                    <XAxis dataKey="type" stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                    <YAxis
                        tickFormatter={(value) => value + '%'}
                        stroke={darkMode ? '#9CA3AF' : '#6B7280'}
                    />
                    <Tooltip
                        contentStyle={darkMode ? { backgroundColor: '#374151', borderColor: '#4B5563', color: '#fff' } : {}}
                        formatter={(value) => [value + '%', 'Coverage']}
                    />
                    <Legend wrapperStyle={{ color: darkMode ? '#9CA3AF' : '#6B7280' }} />
                    <Bar dataKey="coverage" fill="#e67e22" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
</div>

    </div>
          {/* Resource Utilization */}
          <div className="bg-white dark:bg-gray-800 shadow-lg border dark:border-gray-700 mt-8 rounded-lg overflow-hidden">
  {/* Header */}
  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
    <div className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
      <FiUsers className="mr-2 h-5 w-5" /> Resource Utilization
    </div>
    <div className="text-sm text-gray-500 dark:text-gray-400">
      Efficiency of tester resource utilization
    </div>
  </div>

  {/* Table */}
  <div className="px-6 py-4 overflow-x-auto">
    <table className="min-w-full table-auto border-separate border-spacing-y-2">
      <thead>
        <tr className="text-left">
          <th className="text-sm font-medium text-gray-700 dark:text-gray-300 px-4 py-2">Tester</th>
          <th className="text-sm font-medium text-gray-700 dark:text-gray-300 px-4 py-2">Utilized Hours</th>
          <th className="text-sm font-medium text-gray-700 dark:text-gray-300 px-4 py-2">Available Hours</th>
          <th className="text-sm font-medium text-gray-700 dark:text-gray-300 px-4 py-2">Efficiency</th>
        </tr>
      </thead>
      <tbody>
        {resourceUtilizationData.map((item, index) => {
          const efficiency = ((item.utilized / item.available) * 100).toFixed(2);
          return (
            <tr
              key={index}
              className="bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
            >
              <td className="text-sm font-medium text-gray-800 dark:text-gray-200 px-4 py-2">{item.resource}</td>
              <td className="text-sm text-gray-700 dark:text-gray-300 px-4 py-2">{item.utilized}</td>
              <td className="text-sm text-gray-700 dark:text-gray-300 px-4 py-2">{item.available}</td>
              <td
                className={`text-sm font-semibold px-4 py-2 ${
                  efficiency > 80 ? "text-green-500" : "text-orange-500"
                }`}
              >
                {efficiency}%
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
</div>

    </div>
  );

  const renderPreventiveMetrics = () => (
    <div className="gap-6">
            <div className="bg-white dark:bg-gray-800 shadow-lg border dark:border-gray-700 my-8 rounded-lg">
    <div className="px-6 py-4">
        <div className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <FiActivity className="mr-2 h-5 w-5" /> Defect Density vs Coverage vs Effort
        </div>
        <div className="text-gray-500 dark:text-gray-400">
            Relationship between defect density, test coverage, and testing effort
        </div>
    </div>
    <div className="px-6 py-4">
        <div className="overflow-x-auto">
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={defectDensityCoverageEffortData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(200, 200, 200, 0.3)" />
                    <XAxis dataKey="sprint" stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                    <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                    <Tooltip
                        contentStyle={darkMode ? { backgroundColor: '#374151', borderColor: '#4B5563', color: '#fff' } : {}}
                    />
                    <Legend wrapperStyle={{ color: darkMode ? '#9CA3AF' : '#6B7280' }} />
                    <Line type="monotone" dataKey="density" stroke="#8884d8" name="Defect Density" />
                    <Line type="monotone" dataKey="coverage" stroke="#82ca9d" name="Test Coverage" />
                    <Line type="monotone" dataKey="effort" stroke="#e55353" name="Testing Effort" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    </div>
</div>
<div className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <div className="mb-4">
        <div className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <FiTrendingUp className="mr-2 h-5 w-5 text-yellow-500" /> Requirement Ambiguity Score
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Trends in the ambiguity score of requirements over time
        </p>
      </div>
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={requirementAmbiguityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(200, 200, 200, 0.3)" />
            <XAxis dataKey="date" stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
            <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
            <Tooltip
              contentStyle={
                darkMode
                  ? {
                      backgroundColor: '#374151',
                      borderColor: '#4B5563',
                      color: '#fff'
                    }
                  : {}
              }
            />
            <Legend wrapperStyle={{ color: darkMode ? '#9CA3AF' : '#6B7280' }} />
            <Line type="monotone" dataKey="score" stroke="#e67e22" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>

    <div className="bg-white dark:bg-gray-800 shadow-lg my-8 border dark:border-gray-700 rounded-lg">
      <div className="px-6 py-4">
        <div className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <FiActivity className="mr-2 h-5 w-5 text-indigo-500" />
          Shift-left Test Readiness
        </div>
        <div className="text-gray-500 dark:text-gray-400">
          Days test assets are ready before development begins
        </div>
      </div>
      <div className="px-6 py-4">
        <div className="overflow-x-auto">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={shiftLeftData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(200, 200, 200, 0.3)" />
              <XAxis
                dataKey="sprint"
                label={{ value: 'Sprints', position: 'insideBottom', offset: -5 }}
                stroke={darkMode ? '#9CA3AF' : '#6B7280'}
              />
              <YAxis
                label={{ value: 'Days test Assets Ready Before Dev', angle: -90, position: 'insideLeft' }}
                stroke={darkMode ? '#9CA3AF' : '#6B7280'}
                ticks={[0, 5, 10, 15, 20, 25]}
              />
              <Tooltip
                contentStyle={
                  darkMode
                    ? { backgroundColor: '#374151', borderColor: '#4B5563', color: '#fff' }
                    : {}
                }
              />
              <Legend wrapperStyle={{ color: darkMode ? '#9CA3AF' : '#6B7280' }} />
              <Bar dataKey="daysReady" fill="#3498db" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>

    </div>
  );

  const renderAiBox = () => (
<div className="gap-6">
<h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Prescriptive and Preventive Recommendation</h2>
<div className="max-w-full mx-auto mt-8 p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
  {/* <label for="input-box" class="block text-lg font-semibold text-gray-900 dark:text-white mb-2">Preventive Recommendations</label> */}
  {isLoadingRecommendations ? (
  <div className="mt-4 flex items-center justify-center h-48 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-600 shadow-inner">
    <span className="text-gray-500 dark:text-gray-400 animate-pulse">Loading recommendations...</span>
  </div>
) : recommendations && (
  <div className="mt-6">
    <label className="block mb-2 text-base font-semibold text-gray-800 dark:text-gray-200">
      Recommendations
    </label>
    <div
      className="rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-5 leading-relaxed shadow-md space-y-2 text-sm md:text-base max-h-[500px] overflow-y-auto"
      dangerouslySetInnerHTML={{ __html: formatRecommendationsText(recommendations) }}
    />
  </div>
)}


<div className="flex items-center space-x-16 w-full max-w-3xl mx-auto mt-6">
      <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap">
        Select Production Issue for RCA
      </span>

      <div className="flex-1">
  <label htmlFor="issue-select" className="sr-only">
    Select Issue ID
  </label>
  <select
    id="issue-select"
    value={selectedIssue}
    onChange={(e) => handleIssueChange(e.target.value)}
    className="block w-full px-4 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
  >
    <option value="" disabled>Select an Issue ID</option>
    {issues.map((issue) => (
      <option key={issue.issueId} value={issue.issueId}>
        {issue.issueId}
      </option>
    ))}
  </select>
</div>



    </div>
    {isLoadingRca ? (
  <div className="mt-4 flex items-center justify-center h-48 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600">
    <span className="text-gray-500 dark:text-gray-400 animate-pulse">Loading RCA...</span>
  </div>
) : rcaResponse && (
  <div className="mt-4">
    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
      Root Cause Analysis
    </label>
    <textarea
      rows={15}
      value={rcaResponse.replaceAll("\\n", "\n")}
      readOnly
      className="w-full p-3 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
    />
  </div>
)}


</div>
</div>
  );

  const renderDataSource = () => (
    <div className="space-y-6">
      <div className={`rounded-xl shadow-lg p-6 ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
        <div className="flex flex-col items-center justify-center py-8">
          <FiDatabase className={`text-4xl mb-4 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`} />
          <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            Upload QA Metrics Data
          </h3>
          <p className={`mb-6 text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Upload a CSV file containing your QA metrics data to visualize and analyze it.
          </p>
          
          <label className={`flex flex-col items-center px-4 py-6 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
            darkMode 
              ? 'border-gray-600 hover:border-blue-400 bg-gray-800 hover:bg-gray-700' 
              : 'border-gray-300 hover:border-blue-500 bg-gray-50 hover:bg-gray-100'
          }`}>
            <FiUpload className={`text-2xl mb-2 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`} />
            <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              {fileUploaded ? 'File Uploaded! Click to Change' : 'Click to Upload CSV'}
            </span>
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {fileUploaded ? csvData.length + ' records loaded' : 'Supports: CSV format'}
            </span>
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          
          {fileUploaded && (
            <button 
              onClick={() => setFileUploaded(false)}
              className={`mt-4 px-4 py-2 rounded-lg font-medium transition-colors ${
                darkMode 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-red-100 hover:bg-red-200 text-red-700'
              }`}
            >
              Clear Data
            </button>
          )}
        </div>
      </div>

      {fileUploaded && (
        <div className={`rounded-xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
          <div className="p-4 border-b border-gray-200 dark:border-gray-600">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
              QA Metrics Data ({csvData.length} records)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <tr>
                  {csvData.length > 0 && Object.keys(csvData[0]).map((key) => (
                    <th 
                      key={key}
                      className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {csvData.slice(0, 10).map((row, rowIndex) => (
                  <tr 
                    key={`row-${rowIndex}`} 
                    className={`${rowIndex % 2 === 0 ? (darkMode ? 'bg-gray-700' : 'bg-white') : (darkMode ? 'bg-gray-800' : 'bg-gray-50')}`}
                  >
                    {Object.values(row).map((value, colIndex) => (
                      <td 
                        key={`cell-${rowIndex}-${colIndex}`}
                        className={`px-4 py-3 text-sm ${
                          darkMode ? 'text-gray-200' : 'text-gray-700'
                        }`}
                      >
                        {typeof value === 'string' && value.length > 30 
                          ? `${value.substring(0, 30)}...` 
                          : value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {csvData.length > 10 && (
            <div className={`p-4 text-center ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
              Showing first 10 of {csvData.length} records
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Render the content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return renderGeneralAnalytics();
      case "predictive":
        return renderPredictiveMetrics();
      case "prescriptive":
        return renderPrescriptiveMetrics();
      case "data":
        return renderDataSource();
      case "preventive":
        return renderPreventiveMetrics();
      case "ai":
        return renderAiBox();
      default:
        return renderGeneralAnalytics();
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className={`mt-4 text-lg ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Loading QA Metrics Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">QA Metrics Dashboard</h1>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Comprehensive analytics for your quality assurance process
            </p>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`mt-4 md:mt-0 flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${
              darkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-yellow-300' 
                : 'bg-white hover:bg-gray-200 text-gray-700 shadow'
            }`}
          >
            {darkMode ? (
              <>
                <FiSun className="mr-2" /> Light Mode
              </>
            ) : (
              <>
                <FiMoon className="mr-2" /> Dark Mode
              </>
            )}
          </button>
        </div>

        {/* Custom button navigation */}
        <div className="flex flex-wrap gap-3 mb-8">
        <button 
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center ${
              activeTab === "data" 
                ? darkMode 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-blue-600 text-white shadow-lg'
                : darkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
            }`}
            onClick={() => setActiveTab("data")}
          >
            <FiAlertCircle className="mr-2" /> DS
          </button>
          {fileUploaded && (
          <button 
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center ${
              activeTab === "general" 
                ? darkMode 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-blue-600 text-white shadow-lg'
                : darkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
            }`}
            onClick={() => setActiveTab("general")}
          >
            <FiBarChart2 className="mr-2" /> General Analytics
          </button>
          )}
          {fileUploaded && (
          <button 
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center ${
              activeTab === "predictive" 
                ? darkMode 
                  ? 'bg-green-600 text-white shadow-lg' 
                  : 'bg-green-600 text-white shadow-lg'
                : darkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
            }`}
            onClick={() => setActiveTab("predictive")}
          >
            <FiTrendingUp className="mr-2" /> Predictive Metrics
          </button>
          )}
                    {fileUploaded && (
          <button 
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center ${
              activeTab === "prescriptive" 
                ? darkMode 
                  ? 'bg-purple-600 text-white shadow-lg' 
                  : 'bg-purple-600 text-white shadow-lg'
                : darkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
            }`}
            onClick={() => setActiveTab("prescriptive")}
          >
            <FiAlertCircle className="mr-2" /> Prescriptive Metrics
          </button>
                    )}
                                {fileUploaded && (
            <button 
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center ${
              activeTab === "preventive" 
                ? darkMode 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-blue-600 text-white shadow-lg'
                : darkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
            }`}
            onClick={() => setActiveTab("preventive")}
          >
            <FiAlertCircle className="mr-2" /> Preventive Metrics
          </button>
                                )}

{fileUploaded && (
            <button 
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center ${
              activeTab === "ai" 
                ? darkMode 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-blue-600 text-white shadow-lg'
                : darkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
            }`}
            onClick={() => 
                setActiveTab("ai")}
          >
            <FiCode className="mr-2" /> Recommendations
          </button>
                                )}
        </div>

        <div className="flex justify-between items-center mb-6">
  {/* <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>QA Metrics Dashboard</h2> */}

</div>


        {/* Tab content area */}
        <div className="mt-6">
          {renderTabContent()}
        </div>

        {/* Footer */}
        <div className={`mt-12 pt-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <p className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {/* Last updated: {new Date().toLocaleDateString()} | v1.0.0 */}
            Powered By Qualizen
          </p>
        </div>
      </div>
    </div>
  );
};

export default QAMetricsDashboard;