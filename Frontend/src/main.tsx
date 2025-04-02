import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./styles/index.css";

import Main from "./pages/Main"
import Home from "./pages/Home";
import Login from "./pages/LoginPage";
import Register from "./pages/Register";
import Lost from "./pages/Lost";
import Found from "./pages/Found";
import Admin from "./pages/Admin";
import PrivateRoute from "./components/PrivateRoute";
import Dashboard from "./components/Dashboard";


const rootElement = document.getElementById("root");

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      
        <Router>
          <Routes>
          <Route path="/dashboard" element={<Dashboard type={"lost"} />} />
          <Route path="/" element={<Main />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/lost" element={<PrivateRoute element={<Lost />} />} />
          <Route path="/found" element={<PrivateRoute element={<Found />} />} />
          <Route path="/admin" element={<PrivateRoute element={<Admin />} />} />
          </Routes>
        </Router>
      
    </React.StrictMode>
  );
} else {
  console.error("Root element not found.");
}
