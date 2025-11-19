// src/pages/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Landing } from "./Landing";
import { Login } from "./Login";
import { Register } from "./Register";
import Dashboard from "./Dashboard";
import { MasterEdit } from "./MasterEdit";
import { SnackbarProvider } from "../components/SnackbarContext";

function App() {
  return (
    <BrowserRouter>
      <SnackbarProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/masteredit" element={<MasterEdit />} />
        </Routes>
      </SnackbarProvider>
    </BrowserRouter>
  );
}

export default App;
