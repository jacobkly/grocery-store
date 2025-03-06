import { useState, useEffect } from 'react';
import './App.css';

const instructions: string[] = [
  `
  Welcome to the TCSS 445 final project UI! This interface includes seven typical scenarios and six 
  analytical queries (one extra!). The scenarios are numbered to indicate their intended order, but 
  they need to be separated to function properly, as each typical scenario is designed to work 
  independently.
  `,
  `
  To begin testing, click any of the buttons. Note that typical scenarios 1, 2, 3a, 4a and analytical 
  query 3 require user input. Please refer to the instructions below for proper testing (the project 
  description did not mention handling edge cases, and unfortunately, I didn't have time to implement 
  them due to a challenging couple of weeks).
  `,
  `
  NOTE: 'Morning', 'Evening', and 'Night' represent employee shift timings. Based on the script, 
  customer IDs range from 1-5, employee IDs from 1-8, discount IDs from 1-4, and supplier IDs from 
  1-4. For analytical query 3, the expected date-time format is '2025-02-22 00:00:00.000'. The 
  review data inserted corresponds to the past two weeks prior to the project submission. The 
  different role names are 'Manager', 'Cashier', 'Driver', 'Warehouse Worker', 'Stocker', 'Janitor'.
  `
];

export default function App() {
  const [typical, setTypical] = useState<any[]>([]);
  const [analytical, setAnalytical] = useState<any[]>([]);
  const [selectedOption, setSelectedOption] = useState<any | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [jsonData, setJsonData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const typicalRes = await fetch('/typical.json');
        const analyticalRes = await fetch('/analytical.json');
        setTypical(await typicalRes.json());
        setAnalytical(await analyticalRes.json());
      } catch (error) {
        console.error("Error loading JSON files:", error);
      }
    };
    fetchData();
  }, []);

  const handleSelect = (option: any) => {
    setSelectedOption(option);
    setJsonData(null);
    setFormData({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOption) return;

    try {
      const response = await fetch(`http://localhost:3000/${selectedOption.route}`, {
        method: selectedOption.method,
        headers: { "Content-Type": "application/json" },
        body: selectedOption.method === "POST" ? JSON.stringify(formData) : undefined,
      });

      const data = await response.json();

      if (selectedOption.method === "POST") {
        if (response.status === 201 && data) {
          setJsonData(data);
        } else {
          setJsonData(null);
        }
      } else {
        setJsonData(data);
      }
    } catch (error) {
      console.error("Error during fetch:", error);
    }
  };

  const renderTable = (data: any) => {
    if (data === null || data.length === 0) {
      return <p>No table for you.</p>;
    }

    return (
      <div className="box" id="json-output">
        {data ? (
          Object.keys(data).map((tableKey) => {
            const tableData = data[tableKey];
            return (
              <div key={tableKey}>
                <h3>{tableKey}</h3>
                <table>
                  <thead>
                    <tr>
                      {tableData[0] && Object.keys(tableData[0]).map((header) => (
                        <th key={header}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row: any, rowIndex: number) => (
                      <tr key={rowIndex}>
                        {Object.values(row).map((value, cellIndex) => (
                          <td key={cellIndex}>{value as React.ReactNode}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })
        ) : (
          <p>No data to display.</p>
        )}
      </div>
    );
  };

  return (
    <div className="app-container">
      <div className="instructions">
        <h1>Instructions</h1>
        <div id='instruction-items'>
          <p>{instructions[0]}</p>
          <p>{instructions[1]}</p>
          <p>{instructions[2]}</p>
        </div>
      </div>

      <div className="content-container">
        <div className="box">
          <h2>Typical Scenarios</h2>
          {typical.map((item) => (
            <button key={item.route} onClick={() => handleSelect(item)}>
              {item.name}
            </button>
          ))}
        </div>

        <div className="box">
          <h2>Analytical Queries</h2>
          {analytical.map((item) => (
            <button key={item.route} onClick={() => handleSelect(item)}>
              {item.name}
            </button>
          ))}
        </div>

        <div className="box">
          {selectedOption ? (
            <>
              <h2>Selected: {selectedOption.name}</h2>
              {selectedOption.method === "POST" && (
                <div>
                  {selectedOption.fields.map((field: string) => (
                    <div key={field}>
                      <label>{field}</label>
                      <input
                        type="text"
                        name={field}
                        value={formData[field] || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                  ))}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <button>
                  {selectedOption.method === "POST" ? "Submit Data" : "Fetch Data"}
                </button>
              </form>
            </>
          ) : (
            <p>Select an option to proceed.</p>
          )}
        </div>
      </div>

      <div className="output-box">
        <h2>Output</h2>
        {jsonData !== null ? renderTable(jsonData) : <p>No data available for table.</p>}
      </div>
    </div>
  );
}
