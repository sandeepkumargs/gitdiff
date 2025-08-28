import React, { useState } from 'react';
import Papa from 'papaparse';

const DataSource = () => {
  const [csvData, setCsvData] = useState([]);
  const [headers, setHeaders] = useState([]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];

    if (file && file.type === "text/csv") {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
          setHeaders(Object.keys(results.data[0]));
          setCsvData(results.data);
        },
      });
    } else {
      alert("Please upload a valid CSV file.");
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>📁 Data Source</h2>
      <input type="file" accept=".csv" onChange={handleFileUpload} />

      {csvData.length > 0 && (
        <div style={{ overflowX: 'auto', marginTop: '20px' }}>
          <table style={{
            borderCollapse: 'collapse',
            width: '100%',
            textAlign: 'left',
            border: '1px solid #ccc'
          }}>
            <thead>
              <tr>
                {headers.map((header, index) => (
                  <th key={index} style={{ border: '1px solid #ccc', padding: '8px', backgroundColor: '#f5f5f5' }}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {csvData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {headers.map((header, colIndex) => (
                    <td key={colIndex} style={{ border: '1px solid #ccc', padding: '8px' }}>
                      {row[header]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DataSource;
