import { useState, useEffect } from "react";
import "../styles/LostAndFound.css";
import React from "react";

const LostAndFound = ({ type }: { type: "lost" | "found" }) => {
  const [items, setItems] = useState([
    {
      id: 1,
      name: "Backpack",
      description: "Black backpack with laptop inside",
      date: "2025-03-20 14:30",
      location: "Library",
      possession: "Keep with me",
      status: "Not Found",
      image: "/images/backpack.jpg",
    },
    {
      id: 2,
      name: "Keys",
      description: "Set of house keys with a red keychain",
      date: "2025-03-18 16:00",
      location: "Cafeteria",
      possession: "Control Room",
      status: "Found",
      image: "/images/keys.jpg",
    },
  ]);

  const [formData, setFormData] = useState({
    image: null, // Image file
    possession: "Keep with me", // Default option
    subLocation: "", // Security checkpoint sub-dropdown
    dateTime: "",
  });

  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null; // Get the uploaded file
    setFormData({ ...formData, image: file });
  };

  const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, possession: e.target.value, subLocation: "" });
  };

  const handleSubmit = () => {
    if (!formData.image || !formData.dateTime) {
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
      description: "No description provided.",
      date: formData.dateTime,
      location,
      possession: formData.possession,
      status: "Found",
      image: formData.image ? URL.createObjectURL(formData.image) : "/images/default.jpg", // Convert image to preview URL
    };

    setItems([...items, newItem]);
    setFormData({
      image: null,
      possession: "Keep with me",
      subLocation: "",
      dateTime: "",
    });
  };

  return (
    <div className={`lost-found-container ${fadeIn ? "fade-in" : ""}`}>
      <div className="items-list">
        <h2>{type === "lost" ? "Lost Items" : "Found Items"}</h2>
        <div className="cards-container">
          {items.map((item) => (
            <div className="card floating" key={item.id}>
              <img src={item.image} alt={item.name} className="card-image" />
              <h3>{item.name}</h3>
              <p>Date Found: {item.date}</p>
              <p>Location: {item.location}</p>
              <p>Possession: {item.possession}</p>
              <p>Status: {item.status}</p>
            </div>
          ))}
        </div>
      </div>

      {type === "found" && (
        <div className="report-form slide-in">
          <h2>Report a Found Item</h2>
          <input type="file" name="image" accept="image/*" onChange={handleImageUpload} />
          <select name="possession" value={formData.possession} onChange={handleDropdownChange}>
            <option value="Keep with me">Keep with me</option>
            <option value="Give to a security checkpoint">
              Give to a security checkpoint
            </option>
          </select>
          {formData.possession === "Give to a security checkpoint" && (
            <select
              name="subLocation"
              value={formData.subLocation}
              onChange={(e) => setFormData({ ...formData, subLocation: e.target.value })}
            >
              <option value="">Select checkpoint</option>
              <option value="New Academic Block">New Academic Block</option>
              <option value="Control Room">Control Room</option>
              <option value="Old Academic Block">Old Academic Block</option>
            </select>
          )}
          <input
            type="datetime-local"
            name="dateTime"
            value={formData.dateTime}
            onChange={handleChange}
          />
          <button className="submit-btn hover-glow" onClick={handleSubmit}>
            Submit
          </button>
        </div>
      )}
    </div>
  );
};

export default LostAndFound;
