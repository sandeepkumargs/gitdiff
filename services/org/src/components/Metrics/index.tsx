import { useState } from 'react';
import ReactApexChart from 'react-apexcharts';
// import ChartContainer from '../SpiderChart';

export default function ProjectMetrics({
  projectMetrics,
  calculatedProjectMetrics,
  chartOptions,
  chartSeries
})
 {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 container mx-auto">
    {/* <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between transition hover:shadow-md">
      <ChartContainer projectMetrics={calculatedProjectMetrics} chartOptions={chartOptions} chartSeries={chartSeries} />
      <span className="text-sm font-medium text-gray-500">Platform Usage</span>
    </div> */}
    {/* User Stories Chip */}
    <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between transition hover:shadow-md">
      <i className="pi pi-users text-sm text-blue-600 mr-1"></i>
      <span className="text-sm font-medium text-gray-500">User Stories</span>
      <span className="text-sm font-bold">{projectMetrics?.total_user_stories || 0}</span>
    </div>

    {/* Ambiguities Chip */}
    <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between transition hover:shadow-md">
      <i className="pi pi-question-circle text-sm text-red-600 mr-1"></i>
      <span className="text-sm font-medium text-gray-500">Ambiguities</span>
      <span className="text-sm font-bold">{projectMetrics?.total_ambiguities || 0}</span>
    </div>

    {/* Mind Maps Chip */}
    <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between transition hover:shadow-md">
      <i className="pi pi-sitemap text-sm text-green-600 mr-1"></i>
      <span className="text-sm font-medium text-gray-500">Mind Maps</span>
      <span className="text-sm font-bold">{projectMetrics?.total_mind_maps || 0}</span>
    </div>

    {/* Test Scenarios Chip */}
    <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between transition hover:shadow-md">
      <i className="pi pi-clipboard text-sm text-purple-600 mr-1"></i>
      <span className="text-sm font-medium text-gray-500">Test Scenarios</span>
      <span className="text-sm font-bold">{projectMetrics?.total_test_scenarios || 0}</span>
    </div>
  </div>
  );
}
