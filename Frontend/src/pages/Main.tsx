import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");

  // Function to check if user is logged in
  const isAuthenticated = () => {
    if(!localStorage.getItem("token") !== null){
      console.log("authenticated");
    }
    return localStorage.getItem("token") !== null;
    
  };

  // Function to handle navigation with login check
  const handleNavigation = (path: string) => {
    if (!isAuthenticated()) {
      setError("Please login first.");
      setTimeout(() => setError(""), 3000); // Clear error after 3 seconds
    } else {
      navigate(path);
    }
  };

  return (
    <div className="container">
   
      {/* Header with Login button */}
      <div className="auth-buttons">
        <button onClick={() => navigate("/login")}>Login</button>
      </div>

      {/* Display error message if not logged in */}
      {error && (
        <p className="error-message" style={{ color: "red", fontWeight: "bold", marginTop: "10px" }}>
          {error}
        </p>
      )}

      {/* Main Title */}
      <h1 className="title">Find My Stuff</h1>

      {/* Lost & Found Section */}
      <div className="lost-found-section">
        <p>Lost something? Found something?</p>
        <div className="action-buttons">
          <button onClick={() => handleNavigation("/lost")}>Lost an Item</button>
          <button onClick={() => handleNavigation("/found")}>Found an Item</button>
        </div>
      </div>
    </div>
  );
};

export default Home;
