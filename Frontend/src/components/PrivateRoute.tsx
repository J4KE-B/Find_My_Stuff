import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ element }: { element: React.ReactElement }) => {
  const [authUser, setAuthUser] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if the token exists in localStorage
    const token = localStorage.getItem("token");
    setAuthUser(!!token); // If token exists, user is authenticated
  }, []);

  // Handle sign out
  const handleSignOut = () => {
    localStorage.removeItem("token"); // Remove the token
    window.location.href = "/"; // Redirect to login
  };

  if (authUser === null) return <p>Loading...</p>;

  return authUser ? (
    <div>
      {/* Sign Out button at the top right */}
      <button
        onClick={handleSignOut}
        style={{
          position: "absolute",
          top: "10px",
          right: "20px",
          padding: "8px 16px",
          backgroundColor: "#ff4d4d",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: "bold",
          transition: "background-color 0.3s",
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#cc0000")}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#ff4d4d")}
      >
        Sign Out
      </button>

      {element}
    </div>
  ) : (
    <Navigate to="/" />
  );
};

export default PrivateRoute;
