import React, { useState } from "react";
import axios from "axios";  // Import axios
import { useNavigate } from "react-router-dom";
import "../styles/LostAndFound.css"; // Make sure the styles are shared

const LostItems = () => {
  const [formData, setFormData] = useState({
    description: "",
    location: "",
    dateLost: "",
  });
  const [error, setError] = useState<string>(""); 
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Debug: Log form data before sending it to the backend
    console.log("Form data being submitted:", formData);

    if (!formData.description || !formData.location || !formData.dateLost) {
      setError("Please fill in all fields.");
      console.log("Validation failed: Missing required fields.");
      return;
    }

    // Retrieve the token from localStorage (which should be set after login)
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to submit a lost item.");
      return;
    }

    try {
      // Debug: Log the URL and the data being sent
      console.log("Making POST request to backend...");

      const response = await axios.post(
        "http://localhost:5000/lost", 
        {
          description: formData.description,
          location: formData.location,
          date_lost: formData.dateLost,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add the token here
          }
        }
      );

      // Debug: Log the response from the backend
      console.log("Response from backend:", response);

      if (response.status === 200) {
        setFormData({
          description: "",
          location: "",
          dateLost: "",
        });
        setError(""); // Clear any error if successful
        navigate("/dashboard"); // Redirect to dashboard after submission
      }
    } catch (error) {
      // Debug: Log the error from the request
      console.error("Error during request:", error);

      // Display the error to the user
      setError("Failed to submit the lost item.");
    }
  };

  return (
    <div className="lost-found-container">
      <h2>Report a Lost Item</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <textarea
          name="description"
          placeholder="Describe the lost item"
          value={formData.description}
          onChange={handleChange}
        />
        <input
          type="text"
          name="location"
          placeholder="Where was it lost?"
          value={formData.location}
          onChange={handleChange}
        />
        <input
          type="date"
          name="dateLost"
          value={formData.dateLost}
          onChange={handleChange}
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default LostItems;
