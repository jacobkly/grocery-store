import { useState } from 'react';
import './App.css';

const scenarios = [
  { name: "Register Employee", route: "typical/employees/register", method: "POST", fields: ["firstName", "lastName", "shiftTiming", "roleName", "roleAssignments"] },
  { name: "Process Receipts", route: "typical/receipts/process", method: "POST", fields: ["numItems", "subtotal", "tax", "total", "transactionTime", "paymentType", "registerNumber", "employeeID", "customerID", "discountID"] },
  { name: "Create Stock Order", route: "typical/stock-order/create", method: "POST", fields: ["invoicePDF", "subtotal", "tax", "total", "paymentType", "employeeID", "supplierID"] },
  { name: "Submit Review", route: "typical/reviews/submit", method: "POST", fields: ["reviewText", "numStars", "customerID"] },
  { name: "Check Stock", route: "typical/stock-order/check", method: "GET" },
  { name: "Review Statistics", route: "typical/reviews/statistics", method: "GET" },
  { name: "Stocker Assignments", route: "typical/stockers/assignments", method: "GET" },
  { name: "Employee Shifts", route: "typical/employees/shift", method: "GET" },
  { name: "Delivery Orders", route: "typical/delivery/orders", method: "GET" }
];

const queries = [
  { name: "High-Value Customers", route: "analytical/customers/high-value" },
  { name: "Fastest Cashier", route: "analytical/cashiers/fastest" },
  { name: "Review Trends", route: "analytical/reviews/trend" },
  { name: "Certified Morning Warehouse Workers", route: "analytical/warehouse-workers/certified" },
  { name: "Customer Spending Behavior", route: "analytical/customers/spending-behavior" },
  { name: "Low Inventory Products", route: "analytical/products/low-inventory" }
];

export default function App() {
  const [selectedOption, setSelectedOption] = useState<any | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [jsonData, setJsonData] = useState<any>(null);

  const handleSelect = (option: any) => {
    setSelectedOption(option);
    setJsonData('');
    setFormData({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!selectedOption) return;

    const response = await fetch(`http://localhost:3000/${selectedOption.route}`, {
      method: selectedOption.method,
      headers: { "Content-Type": "application/json" },
      body: selectedOption.method === "POST" ? JSON.stringify(formData) : undefined,
    });
    const data = await response.json();
    setJsonData(data);
    console.log(JSON.stringify(data));
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <h2 className="sidebar-title">Typical Scenarios</h2>
        {scenarios.map((scenario) => (
          <button
            key={scenario.route}
            className="sidebar-button"
            onClick={() => handleSelect(scenario)}
          >
            {scenario.name}
          </button>
        ))}
        <h2 className="sidebar-title mt-4">Analytical Queries</h2>
        {queries.map((query) => (
          <button
            key={query.route}
            className="sidebar-button"
            onClick={() => handleSelect(query)}
          >
            {query.name}
          </button>
        ))}
      </div>

      <div className="main-content">
        <h1 className="main-title">Instructions</h1>
        <p className="main-text">Fill in instructions here...</p>

        {selectedOption && (
          <div className="selected-option">
            <h2 className="selected-option-title">Selected: {selectedOption.name}</h2>
            {selectedOption.method === "POST" && (
              <div className="fields-container">
                {selectedOption.fields.map((field: string) => (
                  <div key={field} className="field">
                    <label className="field-label">{field}</label>
                    <input
                      type="text"
                      name={field}
                      value={formData[field] || ""}
                      onChange={handleInputChange}
                      className="field-input"
                    />
                  </div>
                ))}
              </div>
            )}
            <button className="submit-button" onClick={handleSubmit}>
              {selectedOption.method === "POST" ? "Submit Data" : "Fetch Data"}
            </button>
            {jsonData && (
              <pre className="json-output">{JSON.stringify(jsonData, null, 2)}</pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
