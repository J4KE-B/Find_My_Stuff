import React, { useState, useEffect } from "react";
import axios from "axios";  // Import axios
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";  // Import Supabase client
import "../styles/LostAndFound.css";  // Ensure the styles are shared

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,  // Supabase URL from env variable
  import.meta.env.VITE_SUPABASE_ANON_KEY  // Supabase Anon Key from env variable
);

const FoundItems = () => {
  const [formData, setFormData] = useState({
    image: null,
    possession: "With the person",  // Default possession
    dateTimeFound: "",
  });
  const [error, setError] = useState<string>("");  // Error state
  const [imageUrl, setImageUrl] = useState<string>("");  // To store the image URL
  const [loading, setLoading] = useState<boolean>(true);  // Track loading state to prevent redirect issues
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the token exists in localStorage
    const token = localStorage.getItem("token");

    // If no token, redirect to login
    if (!token) {
      setError("You must be logged in to report a found item.");
      navigate("/login");
    } else {
      setLoading(false);  // If token exists, stop loading
    }
  }, [navigate]);  // Dependency array to make sure this only runs once

  // Handle form data changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const filePath = `found-items/${Date.now()}-${file.name}`;  // Ensure unique file path by appending timestamp

      try {
        // Upload the file to Supabase storage
        const { data, error: uploadError } = await supabase.storage
          .from("found-images")  // Replace with your Supabase bucket name
          .upload(filePath, file);

        if (uploadError) {
          setError("Failed to upload image.");
          console.error("Upload Error:", uploadError);
          return;
        }

        // Retrieve the public URL using the uploaded file path
        const { data: { publicUrl }, error: urlError } = supabase.storage
          .from("found-images")
          .getPublicUrl(filePath);

        if (urlError) {
          setError("Failed to retrieve image URL.");
          console.error("URL Error:", urlError);
          return;
        }

        setImageUrl(publicUrl);  // Save the public URL
      } catch (error) {
        setError("An unexpected error occurred while uploading the image.");
        console.error("Unexpected Upload Error:", error);
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageUrl || !formData.dateTimeFound) {
      setError("Please upload an image and select a date and time.");
      return;
    }

    const { possession, dateTimeFound } = formData;

    try {
      // Get the token from localStorage
      const token = localStorage.getItem("token");

      if (!token) {
        setError("You must be logged in to report a found item.");
        return;
      }

      // Make an axios POST request to report the found item to the backend
      const response = await axios.post("http://localhost:5000/found", {
        image_url: imageUrl,
        possession,
        date_time_found: dateTimeFound,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,  // Use the Supabase auth token from localStorage
        }
      });

      // Clear form data on success
      setFormData({
        image: null,
        possession: "With the person",  // Reset to default
        dateTimeFound: "",
      });
      setError("");  // Clear error if successful
      navigate("/home");  // Redirect to the dashboard
    } catch (error) {
      setError("Failed to submit the found item.");
      console.error("Submission Error:", error);
    }
  };

  // If loading (while checking localStorage), render a loading message or spinner
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="lost-found-container">
      <h2>Report a Found Item</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleImageUpload}
        />

        {/* Updated possession dropdown */}
        <select
          name="possession"
          value={formData.possession}
          onChange={handleChange}
        >
          <option value="With the person">With the person</option>
          <option value="Old Academic">Old Academic</option>
          <option value="Control room">Control room</option>
          <option value="New Academic">New Academic</option>
        </select>

        <input
          type="datetime-local"
          name="dateTimeFound"
          value={formData.dateTimeFound}
          onChange={handleChange}
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default FoundItems;
