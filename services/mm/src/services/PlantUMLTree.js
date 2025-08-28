import React, { useEffect, useState } from "react";
import plantumlEncoder from "plantuml-encoder";
import TreeRepresentation from "./TreeRepresentation";
import MindMap from "./markMind";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "tailwindcss/tailwind.css";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import "react-image-lightbox/style.css";

const PlantUMLTree = ({ data, type, status }) => {
  const [umlImageUrl, setUmlImageUrl] = useState("");
  const [codeModal, setCodeModal] = useState(false);
  const [umlString, setUmlString] = useState("");
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [error, setError] = useState("");
  const [viewSwitch, setViewSwitch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const [plantImageUrl, setPlantImageUrl] = useState("");
  const [plantUmlString, setPlantUmlString] = useState("");

  const PLANTUML_SERVER_URL = process.env.PLANTUML_SERVER_URL;

  useEffect(() => {
    if (data) {
      setLoading(true);
      const umlString = convertToPlantUMLJson(data);
      const encodedUml = plantumlEncoder.encode(umlString);
      const imageUrl = `${PLANTUML_SERVER_URL}/svg/${encodedUml}`;

      const plantUmlString = convertToPlantUML(data, type);
      const encodedPlantUml = plantumlEncoder.encode(plantUmlString);
      const plantImageUrl = `${PLANTUML_SERVER_URL}/svg/${encodedPlantUml}`;

      fetch(imageUrl, { method: "HEAD" })
        .then((response) => {
          if (response.ok) {
            setUmlImageUrl(imageUrl);
            setUmlString(umlString);
            setPlantImageUrl(plantImageUrl);
            setPlantUmlString(plantUmlString);
            setError("");
          } else {
            throw new Error("Failed to Generate PlantUML, Please Retry");
          }
        })
        .catch(() => {
          setUmlImageUrl("");
          setError("Failed to Generate PlantUML, Please Retry");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [data, type]);

  // console.log(plantUmlString,'plant');
  // console.log(type,'mindmapdata');

  const openLightbox = () => {
    if (umlImageUrl) {
      setIsLightboxOpen(true);
    }
    else {
      setIsFullScreen(!isFullScreen);
    }
  };
  console.log(data, "mindmapdata");
  const handleViewSwitch = () => {
    setModalVisible(true);
    setViewSwitch(!viewSwitch);
    {console.log(viewSwitch,'viewSwitch')}
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);

  };

  // Function to download PDF
  const downloadPDF = async () => {
    if (!umlImageUrl) return;

    try {
      const response = await fetch(umlImageUrl);
      const svgBlob = await response.blob();
      const svgUrl = URL.createObjectURL(svgBlob);

      // Convert SVG to Canvas
      const img = new Image();
      img.src = svgUrl;
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0);

        const pngDataUrl = canvas.toDataURL("image/png");

        // Create jsPDF instance with landscape orientation
        const doc = new jsPDF("landscape"); // 'landscape' orientation
        doc.text("Mind Map", 10, 10); // Add title
        doc.addImage(pngDataUrl, "PNG", 10, 20, 180, 160); // Add the UML image
        doc.save("mindmap.pdf"); // Save the PDF
      };
    } catch (error) {
      console.error("Error downloading PDF:", error.message);
    }
  };

  return (
    <div className="mt-6 bg-gray-50 flex flex-col items-center justify-center rounded-xl w-full">
      {/* {console.log(data,'mindmapdata')} */}
      {status === "processed" && (
      <div className="bg-white shadow-lg rounded-lg p-8 w-full relative">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold"></h1>
          <div className="flex space-x-2">
            <button
              style={{ backgroundColor: "#BA000", color: "white" }}
              className="text-white text-xs px-4 py-2 rounded-lg bg-red-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center space-x-2"
              onClick={() => setCodeModal(true)}
              disabled={!!error || loading}
            >
              <i className="text-sm pi pi-external-link"></i>
              <span>{viewSwitch ? "PlantUML Code" : "Json Code"}</span>
            </button>

            <button
              style={{ backgroundColor: "#BA000", color: "white" }}
              className="text-white text-sm px-4 py-2 rounded-lg bg-red-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center space-x-2"
              onClick={() => { viewSwitch ? openLightbox() : toggleFullScreen(); setShowToolbar(true); }}
            >
              <i className="text-xs pi pi-arrows-alt"></i>
              <span>Full Screen</span>
            </button>

            <button
              style={{ backgroundColor: "#BA000", color: "white" }}
              className=" text-white text-sm px-4 py-2 rounded-lg bg-red-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center space-x-2"
              onClick={handleViewSwitch}
            >
              <i className="text-xs pi pi-arrows-alt"></i>
              <span>{viewSwitch ? "Show Json" : "Show PlantUML"}</span>
            </button>

            {/* <button
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-400 flex items-center space-x-2"
              onClick={downloadPDF}
            >
              <i className="pi pi-download"></i>
              <span>Download PDF</span>
            </button> */}
          </div>
        </div>
        <Dialog
          header="PlantUML Code"
          visible={codeModal}
          style={{ width: "60vw", height: "80vh", overflow: "auto" }}
          onHide={() => setCodeModal(false)}
        >
          <pre
            className="mb-5 whitespace-pre-wrap"
            style={{ maxHeight: "100%", overflowY: "auto" }}
          >
            {viewSwitch ? plantUmlString : umlString}
          </pre>
        </Dialog>
        <div className="w-full flex flex-col items-center">
          {error ? (
            <div
              className="w-full p-4 mb-4 text-4xl rounded-lg flex justify-center"
              role="alert"
            >
              <span className="font-medium">Please Retry</span>
            </div>
          ) : viewSwitch ? (
            // your code here
            <div className="w-full flex flex-col items-center">
              {error ? (
                <div
                  className="w-full p-4 mb-4 text-4xl rounded-lg flex justify-center"
                  role="alert"
                >
                  <span className="font-medium">{error}</span>
                </div>
              ) : plantImageUrl ? (
                <div className="overflow-auto w-full border rounded">
                  <img
                    src={plantImageUrl}
                    alt="PlantUML diagram"
                    style={{ width: "100%", height: "auto" }}
                  />
                </div>
              ) : (
                <div className="w-full flex flex-col items-center">
                  <p className="text-3xl font-bold">Loading...</p>
                </div>
              )}
            </div>
          ) : umlImageUrl ? (
            <div
  className="w-full border rounded"
  // style={{
  //   overflow: 'hidden',
  //   pointerEvents: 'none', // Disable pointer events
  // }}
>
  <MindMap markdown={data} type={type} />
</div>

          ) : (
            <div className="w-full flex flex-col items-center">
              {/* <p className='text-3xl bold'>No Mind Map Present, Generate One</p> */}
            </div>
          )}
        </div>
      </div>
      )}

      {isLightboxOpen && (
        <Lightbox
          mainSrc={viewSwitch ? plantImageUrl : umlImageUrl}
          onCloseRequest={closeLightbox}
          nextSrc={viewSwitch ? umlImageUrl : plantImageUrl}
          prevSrc={viewSwitch ? umlImageUrl : plantImageUrl}
          onMovePrevRequest={() => setViewSwitch(!viewSwitch)}
          onMoveNextRequest={() => setViewSwitch(!viewSwitch)}
        />
      )}
      {isFullScreen && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] !important">
        {/* Full-Screen Modal */}
        <div className="relative w-full h-full bg-white flex flex-col transform transition-transform duration-300 ease-in-out">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 bg-gray-50 border-b border-gray-200 shadow-sm">
            <h1 className="text-2xl font-extrabold text-gray-800 tracking-wide">
              MindMap Viewer
            </h1>
            <button
            style={{ backgroundColor: "#BA0000", color: "white" }}
              className="text-white text-sm px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center space-x-2"
            // style={{ backgroundColor: "#BA000", color: "white" }}
            //   className="flex items-center justify-center px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-red-400 to-red-600 rounded-lg shadow-lg hover:from-red-500 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 transition-transform transform hover:scale-105"
              onClick={toggleFullScreen}
            >
              <i className="pi pi-arrow-left mr-2"></i> Go Back
            </button>
          </div>
      
          {/* Content Area */}
          <div className="flex-1 overflow-auto p-8 bg-gray-100">
            <MindMap markdown={data} type={type} className="w-full h-full rounded-md shadow-lg border border-gray-200 bg-white" />
          </div>
      
          {/* Footer */}
          <div className="h-12 bg-gray-50 border-t border-gray-200 flex items-center justify-center shadow-sm">
            <span className="text-gray-500 text-sm">Mind Maps</span>
          </div>
      
          {/* Decorative Elements */}
          {/* <div className="absolute -top-16 left-8 w-40 h-40 bg-gray-200 rounded-full opacity-20 shadow-inner"></div> */}
          <div className="absolute bottom-16 -right-20 w-72 h-72 bg-gray-300 rounded-full opacity-25 shadow-xl"></div>
        </div>
      </div>
      
      )}
    </div>
  );
};

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
    plantUML += `* ${type === 'reliability' ? 'Functional' : type === 'availability' ? 'Non-Functional' : type}\n`; // Use the type as the root node
    for (const [key, value] of Object.entries(data)) {
      plantUML += generateNode(key, value, 1); // Start from level 1 since the type is now level 0
    }
    plantUML += "@endmindmap";
    return plantUML;
  }
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


export default PlantUMLTree;

// null safety for nodes
// const convertToPlantUML = (data, type) => {
//   if (!data || typeof data !== "object") {
//     console.warn("Invalid data provided. Returning an empty PlantUML.");
//     return "@startmindmap\n* Empty Data\n@endmindmap";
//   }

//   if (type === 'overview') {
//     let mindmapString = '@startmindmap\n* Overview\n';

//     const processCategory = (categoryName, items) => {
//       if (!items || !Array.isArray(items)) {
//         console.warn(`Skipping invalid category: ${categoryName}`);
//         return;
//       }

//       mindmapString += `** ${categoryName}\n`;
//       items.forEach(item => {
//         if (item && item.name && item.description) {
//           mindmapString += `*** ${item.name}\n`;
//           mindmapString += `**** ${item.description}\n`;
//         } else if (item && typeof item === "object") {
//           Object.entries(item).forEach(([key, value]) => {
//             if (key && value) {
//               mindmapString += `*** ${key}\n`;
//               mindmapString += `**** ${value}\n`;
//             }
//           });
//         }
//       });
//     };

//     Object.entries(data).forEach(([categoryName, items]) => {
//       if (categoryName) {
//         processCategory(categoryName, items);
//       }
//     });

//     mindmapString += '@endmindmap';
//     return mindmapString;
//   }

//   else if (
//     ['reliability', 'availability', 'scalability', 'resilience', 'systemComponents'].includes(type)
//   ) {
//     const generateNode = (key, value, level = 0) => {
//       if (!key) return "";
//       let result = "";

//       if (value && typeof value === "object" && !Array.isArray(value)) {
//         result += `${"  ".repeat(level)}* ${key}\n`;
//         for (const [subKey, subValue] of Object.entries(value || {})) {
//           result += generateNode(subKey, subValue, level + 1);
//         }
//       } else if (Array.isArray(value)) {
//         result += `${"  ".repeat(level)}* ${key}\n`;
//         value.forEach(item => {
//           result += generateNode("-", item, level + 1);
//         });
//       } else if (value !== null && value !== undefined) {
//         result += `${"  ".repeat(level)}* ${key}: ${value}\n`;
//       }

//       return result;
//     };

//     let plantUML = "@startmindmap\n";
//     plantUML += `* ${type}\n`;
//     for (const [key, value] of Object.entries(data || {})) {
//       plantUML += generateNode(key, value, 1);
//     }
//     plantUML += "@endmindmap";
//     return plantUML;
//   }

//   // Default case for unsupported types
//   console.warn("Unsupported type provided. Returning an empty PlantUML.");
//   return "@startmindmap\n* Unsupported Type\n@endmindmap";
// };
