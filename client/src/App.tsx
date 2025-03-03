import { useEffect, useState } from "react";
import axios from 'axios';
import './App.css'

const App = () => {
  const [message, setMessage] = useState<string>("Loading...");

  useEffect(() => {
    axios.get("http://localhost:3000/")
      .then((res) => {
        setMessage(res.data.message);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <div id='outer'>
      <p id='test'>{message}</p>
    </div>
  );
};

export default App;
