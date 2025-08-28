import React, { useEffect } from 'react';
import * as echarts from 'echarts';
 

// Function to transform the JSON data to a hierarchical format for ECharts
const transformDataToTree = (data, nodeName = 'root') => {
  if (typeof data === 'string' || typeof data === 'number') {
    return { name: nodeName, children: [{ name: data }] };
  }
 
  if (Array.isArray(data)) {
    return {
      name: nodeName,
      children: data?.map((item, index) => transformDataToTree(item, `Item ${index + 1}`))
    };
  }
 
  if (typeof data === 'object' && data !== null) {
    return {
      name: nodeName,
      children: Object.keys(data)?.map((key) => {
        return transformDataToTree(data[key], key);
      })
    };
  }
 
  return { name: nodeName, children: [{ name: String(data) }] };
};
 
function TreeRepresentation({data}) {
  useEffect(() => {
    const chartDom = document.getElementById('main');
    const myChart = echarts.init(chartDom);
    const treeData = transformDataToTree(data);
 
    const option = {
      title: {
        text: '',
        left: 'center',
        textStyle: {
          fontSize: 24,
          fontWeight: 'bold',
          color: '#1e3a8a'  // Use one of your colors for title
        }
      },
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove',
        formatter: (params) => `${params.data.name}: ${params.data.description || ''}`  // Show name and description
      },
      series: [
        {
          type: 'tree',
          data: [treeData],
          top: '5%',
          left: '10%',
          bottom: '5%',
          right: '10%',
          symbolSize: 22,  // Larger symbol size for clarity
          roam: true,
          layout: 'orthogonal',
          label: {
            position: 'top',
            verticalAlign: 'middle',
            align: 'center',
            fontSize: 14,
            color: '#1e3a8a',  // Use color 1 for labels
            formatter: '{b}'  // Show only node name
          },
          lineStyle: {
            color: '#f97316',  // Use color 2 for lines
            width: 2,
            type: 'solid',
            curveness: 0.4  // Increase curveness for more spacing between nodes
          },
          leaves: {
            label: {
              position: 'bottom',
              verticalAlign: 'middle',
              align: 'center',
              fontSize: 12,
              color: '#f97316'  // Use color 2 for leaf labels
            }
          },
          expandAndCollapse: true,
          initialTreeDepth: 2,  // Limit initial depth for better readability
          animationDuration: 750,
          animationEasing: 'cubicOut',
          emphasis: {
            focus: 'descendant',
            label: {
              fontWeight: 'bold',
              fontSize: 16,
            },
            itemStyle: {
              borderColor: '#1e3a8a',
              borderWidth: 3,
            },
          }
        }
      ]
    };
 
    myChart.setOption(option);
 
    return () => {
      myChart.dispose();
    };
  }, []);
 
  return (
      <div id="main" style={{ width: '100%', height: '100vh', padding: '20px', border: '1px solid #ccc' }}></div>
  );
}
 
export default TreeRepresentation;