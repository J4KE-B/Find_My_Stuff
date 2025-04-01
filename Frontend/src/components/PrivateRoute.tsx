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
    // Remove the token from localStorage
    localStorage.removeItem("token");
    // Redirect to the login page
    window.location.href = "/";
  };

  if (authUser === null) return <p>Loading...</p>;

  return authUser ? (
    <div>
      {/* Display the sign out button */}
      <button onClick={handleSignOut}>Sign Out</button>
      {element}
    </div>
  ) : (
    <Navigate to="/" />
  );
};

export default PrivateRoute;
