import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import "../styles/LostAndFound.css";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const FoundItems = () => {
  const [formData, setFormData] = useState({
    image: null,
    possession: "With the person",
    dateTimeFound: "",
  });
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false); // New loading state for submission
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to report a found item.");
      navigate("/login");
    } else {
      setLoading(false);
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const filePath = `found-items/${Date.now()}-${file.name}`;
      try {
        const { data, error: uploadError } = await supabase.storage
          .from("found-images")
          .upload(filePath, file);

        if (uploadError) {
          setError("Failed to upload image.");
          console.error("Upload Error:", uploadError);
          return;
        }

        const { data: { publicUrl }, error: urlError } = supabase.storage
          .from("found-images")
          .getPublicUrl(filePath);

        if (urlError) {
          setError("Failed to retrieve image URL.");
          console.error("URL Error:", urlError);
          return;
        }

        setImageUrl(publicUrl);
      } catch (error) {
        setError("An unexpected error occurred while uploading the image.");
        console.error("Unexpected Upload Error:", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); // Show loading popup

    if (!imageUrl || !formData.dateTimeFound) {
      setError("Please upload an image and select a date and time.");
      setSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to report a found item.");
        setSubmitting(false);
        return;
      }

      await axios.post("http://localhost:5000/found", {
        image_url: imageUrl,
        possession: formData.possession,
        date_time_found: formData.dateTimeFound,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setFormData({
        image: null,
        possession: "With the person",
        dateTimeFound: "",
      });
      setError("");
      navigate("/home");
    } catch (error) {
      setError("Failed to submit the found item.");
      console.error("Submission Error:", error);
    } finally {
      setSubmitting(false); // Hide loading popup
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="lost-found-container">
      <h2>Report a Found Item</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="file" name="image" accept="image/*" onChange={handleImageUpload} />
        <select name="possession" value={formData.possession} onChange={handleChange}>
          <option value="With the person">With the person</option>
          <option value="Old Academic">Old Academic</option>
          <option value="Control room">Control room</option>
          <option value="New Academic">New Academic</option>
        </select>
        <input type="datetime-local" name="dateTimeFound" value={formData.dateTimeFound} onChange={handleChange} />
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

export default FoundItems;
