import { useState } from 'react';
import ReactApexChart from 'react-apexcharts';

export default function ChartContainer({
  projectMetrics,
  chartOptions,
  chartSeries,
  collapsedWidth = '200px',
  collapsedHeight = '50px',
  expandedHeight = window.innerWidth < 768 ? '450px' : '300px',
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showChart, setShowChart] = useState(false);

  const handleClick = () => {
    // If already expanded, collapse and hide the chart immediately.
    if (isExpanded) {
      setShowChart(false);
      setIsExpanded(false);
    } else {
      // Expand the container. The chart will be shown after the transition ends.
      setIsExpanded(true);
    }
  };

  const handleTransitionEnd = (e) => {
    // When the transition on height or width ends and the container is expanded, show the chart.
    if ((e.propertyName === 'height' || e.propertyName === 'width') && isExpanded) {
      setShowChart(true);
    }
  };

  return (
    <div
      onClick={handleClick}
      onTransitionEnd={handleTransitionEnd}
      style={{
        width: isExpanded ? '100%' : collapsedWidth,
        height: isExpanded ? expandedHeight : collapsedHeight,
      }}
      className={`rounded-lg transition-all duration-500 ease-in-out ${
        isExpanded
          ? 'bg-gradient-to-r from-gray-100 to-white transform scale-105 shadow-lg p-4'
          : 'bg-white shadow-md'
      }`}
    >
      {isExpanded ? (
        <div className={`flex ${window.innerWidth < 768 ? 'flex-col justify-start' : 'flex-row justify-between'} h-full`}>
          {/* Left side: Metrics */}
          <div className={`w-${window.innerWidth < 768 ? 'full' : '1/2'} pr-4`}>
            <h2 className="text-sm font-bold text-gray-800 mb-2">
              Total User Stories: {projectMetrics?.totalStories || 0}
            </h2>
            <div className="flex flex-col space-y-1">
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Ambiguities Resolved:</span>
                <span className="text-xs text-gray-600">{projectMetrics?.ambiguity_resolution_percentage || 0}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Mind Maps Created:</span>
                <span className="text-xs text-gray-600">{projectMetrics?.mind_maps_percentage || 0}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Test Scenarios Processed:</span>
                <span className="text-xs text-gray-600">{projectMetrics?.test_scenarios_percentage || 0}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Fully Processed Stories:</span>
                <span className="text-xs text-gray-600">
                  {projectMetrics?.fully_processed_stories || 0} ({projectMetrics?.fully_processed_percentage || 0}%)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Not Processed Stories:</span>
                <span className="text-xs text-gray-600">
                  {projectMetrics?.not_processed_stories || 0} ({projectMetrics?.not_processed_percentage || 0}%)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Average Completion Rate:</span>
                <span className="text-xs text-gray-600">{projectMetrics?.average_completion_rate || 0}%</span>
              </div>
            </div>
          </div>
          {/* Right side: Chart */}
          <div className="w-full relative">
            {!showChart && (
              <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 ease-in-out">
                {/* Optional placeholder content */}
              </div>
            )}
            {showChart && (
              <div className="absolute inset-0 transition-opacity duration-300 ease-in-out">
                {projectMetrics ? (
                  <ReactApexChart
                    options={chartOptions}
                    series={chartSeries}
                    type="radar"
                    height={300}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-gray-500">Loading chart...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <span className="text-sm font-medium text-gray-500 cursor-pointer">Show Usage</span>
        </div>
      )}
    </div>
  );
}
