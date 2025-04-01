import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Dashboard from "./Dashboard"; // Import Dashboard component
import "../styles/LostAndFound.css";

const LostAndFound = ({ type }: { type: "lost" | "found" }) => {
  const [items, setItems] = useState([
    {
      id: 1,
      name: "Backpack",
      description: "Black backpack with laptop inside",
      date: "2025-03-20",
      location: "Library",
      status: "Not Found",
      image: "/images/backpack.jpg",
    },
    {
      id: 2,
      name: "Keys",
      description: "Set of house keys with a red keychain",
      date: "2025-03-18",
      location: "Cafeteria",
      status: "Found",
      image: "/images/keys.jpg",
    },
  ]);

  const [formData, setFormData] = useState({
    description: "",
    location: "",
    dateLost: "",
    image: null, // For found items
    possession: "Keep with me", // Default possession option
    subLocation: "", // For security checkpoint sub-dropdown
    dateTimeFound: "", // Date and time for found items
  });

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null; // Get the uploaded file
    setFormData({ ...formData, image: file });
  };

  const handleSubmit = () => {
    if (type === "lost") {
      // Validate lost form
      if (!formData.description || !formData.location || !formData.dateLost) {
        alert("Please fill out all fields before submitting.");
        return;
      }

      const newItem = {
        id: items.length + 1,
        name: "Unknown Item",
        description: formData.description,
        date: formData.dateLost,
        location: formData.location,
        status: "Not Found",
        image: "/images/default.jpg", // Placeholder image for lost items
      };

      setItems([...items, newItem]);
      setFormData({ ...formData, description: "", location: "", dateLost: "" });
    } else if (type === "found") {
      // Validate found form
      if (!formData.image || !formData.dateTimeFound) {
        alert("Please upload an image and select a date and time.");
        return;
      }

      const location =
        formData.possession === "Give to a security checkpoint"
          ? formData.subLocation
          : "Kept with Finder";

      const newItem = {
        id: items.length + 1,
        name: "Found Item",
        description: "No description provided.", // Placeholder description
        date: formData.dateTimeFound,
        location: location,
        status: "Found",
        image: formData.image ? URL.createObjectURL(formData.image) : "/images/default.jpg", // Preview image
      };

      setItems([...items, newItem]);
      setFormData({
        ...formData,
        image: null,
        possession: "Keep with me",
        subLocation: "",
        dateTimeFound: "",
      });
    }
  };

  return (
    <div className="lost-found-container">
      <div className="report-form">
        {type === "lost" ? (
          <h2>Report a Lost Item</h2>
        ) : (
          <h2>Report a Found Item</h2>
        )}
        {/* Form inputs */}
        {/* (Same form fields for both lost and found items as before) */}
        <button onClick={handleSubmit}>Submit</button>
      </div>

      <Dashboard type={type} /> {/* Add the dashboard here on the side */}
    </div>
  );
};

export default LostAndFound;
