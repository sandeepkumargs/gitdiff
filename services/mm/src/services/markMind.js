import React, { useEffect, useRef } from "react";
import { Markmap } from "markmap-view";
import { Transformer } from "markmap-lib";
import { Toolbar } from "markmap-toolbar";
import { renderAll } from "markmap-autoloader";

function jsonToMarkmap(json, type) {
  const traverse = (key, value, depth = 0) => {
    const indent = "  ".repeat(depth);

    // Exclude entries with "Main Category" or "Sub Category"
    if (key === "Main Category" || key === "Sub Category") {
      return "";
    }

    // Handle arrays
    if (Array.isArray(value)) {
      return `${indent}- **${key}**\n${value
        .map((item) => {
          if (typeof item === "object" && item !== null) {
            // Check for numbered keys and treat them as points with descriptions
            const numberedKeys = Object.keys(item).filter((k) =>
              /^\d+$/.test(k),
            );
            if (numberedKeys.length > 0) {
              return numberedKeys
                .map(
                  (numKey) => `${indent}  - **${numKey}**: ${item[numKey]}\n`,
                )
                .join("");
            }
            // Handle "name" and "description" keys
            const point = item.name || item.Point || "Unnamed Point";
            const description =
              item.description || item.Description || "No Description";
            return `${indent}  - **${point}**\n${indent}    - ${description}\n`;
          } else if (typeof item === "string") {
            return `${indent}  - ${item}\n`; // Handle plain strings
          } else {
            return ""; // Ignore unsupported types
          }
        })
        .join("")}`;
    }

    // Handle nested objects
    else if (typeof value === "object" && value !== null) {
      return `${indent}- **${key}**\n${Object.entries(value)
        .map(([subKey, subValue]) => {
          if (subKey === "Main Category" || subKey === "Sub Category") {
            return ""; // Skip these keys
          }
          if (typeof subValue === "string") {
            return `${indent}  - ${subKey}: ${subValue}\n`; // Handle strings
          } else {
            return traverse(subKey, subValue, depth + 1); // Recurse for nested objects
          }
        })
        .join("")}`;
    }

    // Handle leaf nodes
    else {
      return `${indent}- ${key}: ${value}\n`;
    }
  };

  const generateMarkmapMarkdown = (data, type) => {
    let markdown = `---
markmap:
  initialExpandLevel: 1
---\n
# **${type === 'reliability' ? 'Functional' : type === 'availability' ? 'Non-Functional' : type}**\n`;

    const generateNode = (key, value, depth = 1) => {
      const indent = "  ".repeat(depth);

      // Exclude "Main Category" and "Sub Category"
      if (key === "Main Category" || key === "Sub Category") {
        return;
      }

      // Handle objects
      if (typeof value === "object" && !Array.isArray(value)) {
        markdown += `${indent}- **${key}**\n`;
        Object.entries(value).forEach(([subKey, subValue]) => {
          if (subKey === "Main Category" || subKey === "Sub Category") {
            return; // Skip these keys
          }
          if (typeof subValue === "string") {
            markdown += `${indent}  - ${subKey}: ${subValue}\n`;
          } else {
            generateNode(subKey, subValue, depth + 1);
          }
        });
      }
      // Handle arrays
      else if (Array.isArray(value)) {
        markdown += `${indent}- **${key}**\n`;
        value.forEach((item) => {
          if (typeof item === "object" && item !== null) {
            const numberedKeys = Object.keys(item).filter((k) =>
              /^\d+$/.test(k),
            );
            if (numberedKeys.length > 0) {
              numberedKeys.forEach((numKey) => {
                markdown += `${indent}  - **${numKey}**: ${item[numKey]}\n`;
              });
            } else {
              const point = item.name || item.Point || "Unnamed Point";
              const description =
                item.description || item.Description || "No Description";
              markdown += `${indent}  - **${point}**\n${indent}    - ${description}\n`;
            }
          } else if (typeof item === "string") {
            markdown += `${indent}  - ${item}\n`;
          }
        });
      } else {
        markdown += `${indent}- ${key}: ${value}\n`;
      }
    };

    for (const [key, value] of Object.entries(data)) {
      generateNode(key, value);
    }

    return markdown;
  };

  // Generate Markmap Markdown
  return generateMarkmapMarkdown(json, type);
}

const MindMap = ({ markdown, type }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const markmapInstance = useRef(null);
  markdown = jsonToMarkmap(markdown, type);


  useEffect(() => {
    const initializeMarkmap = () => {
      if (svgRef.current) {
        try {
          // Clear the previous content
          svgRef.current.innerHTML = "";
  
          const transformer = new Transformer();
          const { root } = transformer.transform(markdown);
  
          markmapInstance.current = Markmap.create(
            svgRef.current,
            {
              initialExpandLevel: 2,
              layout: {
                preset: "tree",
                preset: "tree",
              },
              node: {
                width: 250,
                height: 50,
                paddingX: 20,
                paddingY: 10,
              },
            },
            root
          );
  
          // Create and attach the toolbar
          const { el: toolbarEl } = Toolbar.create(markmapInstance.current);
          toolbarEl.style.position = "absolute";
          toolbarEl.style.top = "0.5rem";
          toolbarEl.style.left = "0.5rem"; // Changed from right to left
          toolbarEl.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
          toolbarEl.style.color = "#BA000";
          toolbarEl.style.padding = "0.75rem 1.25rem";
          toolbarEl.style.fontFamily = "'Inter', sans-serif";
          toolbarEl.style.fontSize = "18px";
          toolbarEl.style.display = "flex";
          toolbarEl.style.gap = "16px";
          toolbarEl.style.alignItems = "center";
          toolbarEl.style.justifyContent = "flex-start"; // Changed from flex-end to flex-start
          toolbarEl.style.border = "1px solid #BA000";
          toolbarEl.style.borderRadius = "12px";
          toolbarEl.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
          toolbarEl.style.cursor = "pointer";
          toolbarEl.style.zIndex = "20";
  
          Array.from(toolbarEl.children).forEach((child) => {
            child.style.transition = "transform 0.2s ease-in-out";
            child.addEventListener("mouseenter", () => {
              child.style.transform = "scale(1.2)";
            });
            child.addEventListener("mouseleave", () => {
              child.style.transform = "scale(1)";
            });
          });
  
          Array.from(toolbarEl.children).forEach((child) => {
            if (child.tagName === "A" && child.href.includes("markmap")) {
              toolbarEl.removeChild(child);
            }
          });
  
          if (containerRef.current) {
            containerRef.current.append(toolbarEl);
          }
        } catch (error) {
          console.error("Error initializing Markmap:", error);
        }
      }
    };
  
    const disableScroll = (event) => {
      event.preventDefault();
      event.stopPropagation();
    };
  
    initializeMarkmap();
  
    // Add scroll disabling
    const containerElement = containerRef.current;
    const svgElement = svgRef.current;
  
    if (containerElement) {
      containerElement.addEventListener("wheel", disableScroll, { passive: false });
      containerElement.addEventListener("touchmove", disableScroll, { passive: false });
    }
  
    if (svgElement) {
      svgElement.addEventListener("wheel", disableScroll, { passive: false });
      svgElement.addEventListener("touchmove", disableScroll, { passive: false });
    }
  
    return () => {
      if (containerElement) {
        containerElement.removeEventListener("wheel", disableScroll);
        containerElement.removeEventListener("touchmove", disableScroll);
      }
  
      if (svgElement) {
        svgElement.removeEventListener("wheel", disableScroll);
        svgElement.removeEventListener("touchmove", disableScroll);
      }
    };  
  }, [markdown]);
  

  const repositionMindmap = () => {
    if (markmapInstance.current) {
      markmapInstance.current.fit();
    }
  };

  // Function to generate HTML content
  const generateHTML = () => {
    const svgContent = svgRef.current.outerHTML;
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Mindmap Export</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/markmap-view/0.15.5/index.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/markmap-toolbar/0.15.5/index.min.js"></script>
    <style>
        body { margin: 0; }
        #mindmap-container {
            width: 100vw;
            height: 100vh;
            background-color: white;
        }
        svg { width: 100%; height: 100%; }
    </style>
</head>
<body>
    <div id="mindmap-container">
        ${svgContent}
    </div>
</body>
</html>`;
  };

  // Function to handle download
  const handleDownload = () => {
    const htmlContent = generateHTML();
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mindmap.html";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "750px",
        border: "1px solid #ddd",
        backgroundColor: "white",
        overflow: "hidden",
      }}blue
    >
      {/* SVG for the mindmap */}
      <svg
        ref={svgRef}
        style={{
          width: "100%",
          height: "100%",
        }}
      />

<button
        onClick={handleDownload}
        style={{
          position: "absolute",
          bottom: "10px",
          right: "10px", // Positioned on the right side
          padding: "8px 16px",
          backgroundColor: "#BA0000",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <i className="pi pi-download" style={{ fontSize: "16px" }}></i>
        Download HTML
      </button>

      {/* Button positioned inside the canvas */}
      <button
        onClick={repositionMindmap}
        style={{
          position: "absolute",
          bottom: "10px",
          left: "10px",
          padding: "8px",
          backgroundColor: "#BA0000",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <i className="pi pi-expand" style={{ fontSize: "20px" }}></i>
      </button>
    </div>
  );
};

export default MindMap;