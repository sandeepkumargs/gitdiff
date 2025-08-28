import React from "react";
import { jsPDF } from "jspdf";
import { marked } from "marked";
import { saveAs } from "file-saver";
import { useState, useEffect } from "react";
import plantumlEncoder from "plantuml-encoder";
import { Button } from "primereact/button";

const PLANTUML_SERVER_URL = process.env.PLANTUML_SERVER_URL;
const MarkdownExporter = ({data}) => {

    const [mindmaps, setMindMaps] = useState({});
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false); 

    useEffect(() => {
        if (!data?.mind_maps) return;
    
        const categories = [
          "overview",
          "availability",
          "reliability",
          "resilience",
          "scalability",
          "systemComponents"
        ];
    
        const newImageUrls = [];
    
        categories.forEach((category) => {
          const mindMapData = data?.mind_maps?.[category]?.mind_map;
          const status = data?.status;
          if (mindMapData) {
            setStatus(status);
            const plantUmlString = convertToPlantUML(mindMapData, category);
            const encodedPlantUml = plantumlEncoder.encode(plantUmlString);
            newImageUrls.push(`${PLANTUML_SERVER_URL}/svg/${encodedPlantUml}`);
          }
        });
 
        setMindMaps(newImageUrls);
      }, [data]);

    //   console.log(status,'status for mindmaps')


  const generateMarkdown = () => {
    let markdownContent = `## User Story\n${data.story}\n\n`;

    markdownContent += `#### Refined Story\n${data.refined}\n\n`;

    markdownContent += `#### Assumptions\n`;
    data.assumptions.forEach((assumption, index) => {
      markdownContent += `${index + 1}. ${assumption}\n`;
    });
    markdownContent += `\n`;

    markdownContent += `#### Acceptance Criteria\n`;
    data.acceptance_criteria.forEach((criteria, index) => {
      markdownContent += `${index + 1}. ${criteria}\n`;
    });
    // markdownContent += `\n`;

    // markdownContent += `## Test Scenarios\n`;

    // data.test_scenarios.data.forEach((scenarioSet) => {
    //   Object.entries(scenarioSet).forEach(([acKey, scenarios]) => {
    //     markdownContent += `### ${acKey}\n\n`;

    //     Object.entries(scenarios).forEach(([type, scenarioList]) => {
    //       markdownContent += `**${type.toUpperCase()}**\n\n`;
    //       scenarioList.forEach((scenario, index) => {
    //         markdownContent += `###### Scenario ${index + 1}:\n ${scenario[`scenario ${index + 1}`]}\n`;
    //         markdownContent += `###### Preconditions:\n`;
    //         scenario.precondition.forEach((pre, preIndex) => {
    //           markdownContent += `    - ${pre}\n`;
    //         });
    //         markdownContent += `###### Description:\n ${scenario.description}\n\n`;
    //       });
    //     });
    //   });
    // });
    markdownContent += `## Mind Maps\n\n`;
    markdownContent += `Generated mind maps related to this user story and test scenarios.\n\n`;

    return markdownContent;
  };

  const addSvgToPdf = async (doc, y, callback) => {
    const parser = new DOMParser();
  
    for (const mapUrl of mindmaps) {
      try {
        const response = await fetch(mapUrl);
        if (!response.ok) throw new Error(`Failed to fetch SVG: ${mapUrl}`);
  
        const svgText = await response.text();
        const svgElement = parser.parseFromString(svgText, "image/svg+xml").documentElement;
  
        // Convert SVG to PNG
        const imgData = await convertSvgToPng(svgElement);
  
        // **Add a new page for each mind map**
        doc.addPage("landscape"); // Switch to landscape orientation
  
        // Get page dimensions
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
  
        // Add PNG to fill the page while maintaining aspect ratio
        const img = new Image();
        img.src = imgData;
        await new Promise((resolve) => {
          img.onload = () => {
            const aspectRatio = img.width / img.height;
            let imgWidth = pageWidth - 20; // Leave margin
            let imgHeight = imgWidth / aspectRatio;
  
            // If image height exceeds page height, scale it down
            if (imgHeight > pageHeight - 20) {
              imgHeight = pageHeight - 20;
              imgWidth = imgHeight * aspectRatio;
            }
  
            // Center the image on the page
            const x = (pageWidth - imgWidth) / 2;
            const y = (pageHeight - imgHeight) / 2;
  
            doc.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
            resolve();
          };
        });
  
        "Added to PDF:", (mapUrl);
      } catch (error) {
        console.error("Error processing SVG:", error);
      }
    }

    callback();
  };
  
  const convertSvgToPng = (svgElement) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
  
      // Get SVG dimensions
      const width = svgElement.getAttribute("width") || 800; // Default width
      const height = svgElement.getAttribute("height") || 600; // Default height
  
      canvas.width = parseFloat(width);
      canvas.height = parseFloat(height);
  
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: "image/svg+xml" });
      const url = URL.createObjectURL(svgBlob);
  
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imgData = canvas.toDataURL("image/png");
        URL.revokeObjectURL(url);
        resolve(imgData);
      };
  
      img.onerror = (err) => {
        URL.revokeObjectURL(url);
        reject("Image loading failed");
      };
  
      img.src = url;
    });
  };
  
  

  // Function to download Markdown file
  const downloadMarkdown = () => {
    const markdownContent = generateMarkdown();
    const blob = new Blob([markdownContent], { type: "text/markdown;charset=utf-8" });
    saveAs(blob, "user_story.md");
  };

  // Optimized function to generate PDF
  const downloadPDF = () => {
    setLoading(true);
    const markdownContent = generateMarkdown(); // Ensure this function returns the correct content
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
  
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
  
    let y = 10;
    const pageHeight = doc.internal.pageSize.height;
  
    const addText = (text, isBold = false, size = 12, indent = 0) => {
      if (isBold) doc.setFont("helvetica", "bold");
      else doc.setFont("helvetica", "normal");
  
      doc.setFontSize(size);
      const lines = doc.splitTextToSize(text, 180 - indent); // Ensures text wraps properly
  
      lines.forEach((line) => {
        if (y + 7 > pageHeight) {
          doc.addPage();
          y = 10;
        }
        doc.text(line, 10 + indent, y);
        y += 7;
      });
    };
  
    const lines = markdownContent.split("\n");
  
    lines.forEach((line) => {
      if (line.startsWith("# ")) {
        addText(line.replace("# ", ""), true, 16); // H2 (Main Heading)
        y += 8;
      } else if (line.startsWith("## ")) {
        addText(line.replace("## ", ""), true, 14); // H3
        y += 6;
      } else if (line.startsWith("### ")) {
        addText(line.replace("### ", ""), true, 14); // H3 (AC13)
        y += 6;
      } else if (line.startsWith("#### ")) {
        addText(line.replace("#### ", ""), true, 12); // H4
        y += 4;
      } else if (line.startsWith("**") && line.endsWith("**")) {
        addText(line.replace(/\*\*/g, ""), true, 12); // Bold text
        y += 4;
      } else if (line.startsWith("###### ")) {
        addText(line.replace("###### ", ""), true, 12); // H4
        y += 4;
      }else if (line.startsWith("#### ")) {
        addText(line.replace("#### ", ""), true, 12); // H4
        y += 4;
      }else {
        addText(line, false, 12);
      }
    });
  
    addSvgToPdf(doc, y, () => {
      doc.save("user_story.pdf");
      setLoading(false); 
    });
  };

  function convertToPlantUMLJson(data) {
    let umlString = `@startjson
  <style>
  jsonDiagram {
    node {
      BackGroundColor #FFFFFF
      LineColor #0D47A1
      FontName "Arial"
      FontColor #0D47A1
      FontSize 16
      RoundCorner 10
      LineThickness 1
      LineStyle dashed
      separator {
        LineThickness 1
        LineColor #90CAF9
        LineStyle dashed
      }
    }
    arrow {
      BackGroundColor #E3F2FD
      LineColor #FF6F00
      LineThickness 2
      LineStyle solid
    }
    highlight {
      BackGroundColor #0D47A1
      FontColor #0D47A1
    }
  }
  </style>
  `;
    const mindMapJson = JSON.stringify(data, null, 2);
    umlString += mindMapJson;
    umlString += "\n@endjson";
  
    return umlString;
  }

  const convertToPlantUML = (data, type) => {
    if (type === "overview") {
      let mindmapString = "@startmindmap\n* Overview\n";
  
      const processCategory = (categoryName, items) => {
        mindmapString += `** ${categoryName}\n`;
        items.forEach((item) => {
          if (item.name && item.description) {
            mindmapString += `*** ${item.name}\n`;
            mindmapString += `**** ${item.description}\n`;
          } else if (typeof item === "object" && item !== null) {
            // Handle other cases like key-value pairs in items
            Object.entries(item).forEach(([key, value]) => {
              mindmapString += `*** ${key}\n`;
              if (value) {
                mindmapString += `**** ${value}\n`;
              }
            });
          } else {
            console.warn(`Skipping invalid item in category: ${categoryName}`);
          }
        });
      };
  
      // Process each category in the data
      Object.entries(data).forEach(([categoryName, items]) => {
        if (Array.isArray(items)) {
          processCategory(categoryName, items);
        } else {
          console.warn(`Skipping non-array category: ${categoryName}`);
        }
      });
  
      mindmapString += "@endmindmap";
      return mindmapString;
    } else if (
      type === "reliability" ||
      type === "availability" ||
      type === "scalability" ||
      type === "resilience" ||
      type === "systemComponents"
    ) {
      function generateNode(key, value, level = 0) {
        let result = "";
  
        if (typeof value === "object" && !Array.isArray(value)) {
          result += `${"  ".repeat(level)}* ${key}\n`;
          for (const [subKey, subValue] of Object.entries(value)) {
            result += generateNode(subKey, subValue, level + 1);
          }
        } else if (Array.isArray(value)) {
          result += `${"  ".repeat(level)}* ${key}\n`;
          value.forEach((item) => {
            result += generateNode("-", item, level + 1);
          });
        } else {
          result += `${"  ".repeat(level)}* ${key}: ${value}\n`;
        }
  
        return result;
      }
  
      let plantUML = "@startmindmap\n";
      plantUML += `* ${type}\n`; // Use the type as the root node
      for (const [key, value] of Object.entries(data)) {
        plantUML += generateNode(key, value, 1); // Start from level 1 since the type is now level 0
      }
      plantUML += "@endmindmap";
      return plantUML;
    }
  };

  return (
    <div>
      {/* <button
        onClick={downloadMarkdown}
        className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-700"
      >
        Download as Markdown
      </button> */}
<Button
      label={loading ? "Downloading..." : "Download as PDF"} // Show "Downloading..." text while loading
      icon={loading ? "pi pi-spin pi-spinner" : "pi pi-download"} // Show spinning loader icon while loading
      size="small"
      onClick={downloadPDF}
      disabled={loading || status === "processing"} // Disable button if loading or processing
      className="p-button-success text-xs p-2 bg-[#BA0000] rounded-md text-white"
    />

    </div>
  );
};


export default MarkdownExporter;