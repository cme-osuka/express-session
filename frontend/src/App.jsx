import { useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import axios from "axios";

axios.defaults.withCredentials = true;

function App() {
  const [result, setResult] = useState({ message: "" });
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const handleLogin = async () => {
    const result = await axios.post("http://localhost:4000/login", credentials);
    setResult(result.data);
  };

  const handleLogout = async () => {
    const result = await axios.post("http://localhost:4000/logout");
    setResult(result.data);
  }

  const handleTest = async () => {
    const result = await axios.post("http://localhost:4000/test")
    console.log(result.data);
    setResult(result.data);
  }

  return (
    <div className="App">
      <header className="App-header">
        <p>Message: {result.message}</p>
        <p>Session ID: {result.session_id ? result.session_id : "none"}</p>
        <input
          name="username"
          id="username"
          onChange={(e) =>
            setCredentials({ ...credentials, username: e.target.value })
          }
        />
        <input
          type="password"
          name="password"
          id="password"
          onChange={(e) =>
            setCredentials({ ...credentials, password: e.target.value })
          }
        />
        <button onClick={handleLogin}>Login</button>
        <button onClick={handleTest}>Test session</button>
        <button onClick={handleLogout}>Logout</button>
      </header>
    </div>
  );
}

export default App;
