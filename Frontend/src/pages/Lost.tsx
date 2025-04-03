import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/LostAndFound.css";

const LostItems = () => {
  const [formData, setFormData] = useState({
    description: "",
    location: "",
    dateLost: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false); // New loading state for submission
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); // Show loading popup

    console.log("Form data being submitted:", formData);

    if (!formData.description || !formData.location || !formData.dateLost) {
      setError("Please fill in all fields.");
      console.log("Validation failed: Missing required fields.");
      setSubmitting(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to submit a lost item.");
      setSubmitting(false);
      return;
    }

    try {
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
            Authorization: `Bearer ${token}`,
          }
        }
      );

      console.log("Response from backend:", response);

      if (response.status === 200) {
        setFormData({
          description: "",
          location: "",
          dateLost: "",
        });
        setError("");
        navigate("/home");
      }
    } catch (error) {
      console.error("Error during request:", error);
      setError("Failed to submit the lost item.");
    } finally {
      setSubmitting(false); // Hide loading popup
    }
  };

  return (
    <div className="lost-found-container">
      <h2>Report a Lost Item</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <textarea
          name="description"
          placeholder="Describe the lost item with color and accurate mode name, eg:Titanium Iphone 14 pro"
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
      {submitting && (
        <div className="loading-popup">
          <div className="loading-spinner"></div>
          <p>Submitting, please wait...</p>
        </div>
      )}
    </div>
  );
};

export default LostItems;
