import { useState } from "react";

const AmbiguitiesPanel = ({ data }: { data: any }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const ambiguitySections = Object.entries(data?.ambiguities || {})?.map(([category, items]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    items: items.length > 0 ? items.map((item, i) => `${i + 1}. ${item.val}`) : ["No ambiguities in this category"],
  }));

  return (
    <div className="mb-6">
      <div
        className="flex items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-center w-full hover:bg-gray-100 p-2 rounded-md transition-colors duration-200">
          <h2 className="text-md font-semibold mr-2">Ambiguities</h2>
          <i className={`pi pi-chevron-${isExpanded ? 'up' : 'down'} text-gray-600 text-sm hover:text-indigo-600`} />
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 rounded-md mt-2"style={{ backgroundColor: "#fef2f2" }}>
          {ambiguitySections.map((section, index) => (
            <div key={index} className="mb-4">
              <p className="text-md font-semibold text-gray-800">
                {section.category}
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {section.items.map((item, i) => (
                  <li key={i} className="text-sm text-gray-800">{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AmbiguitiesPanel;
