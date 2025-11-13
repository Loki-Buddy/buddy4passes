// src/pages/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Landing } from "./Landing";
import { Login } from "./Login";
import { Register } from "./Register";
import Dashboard from "./Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
