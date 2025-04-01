import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect unauthorized users if they aren't from the Admin route
  useEffect(() => {
    if (!location.state?.fromAdmin) {
      navigate("/admin"); // Redirect unauthorized users back to Admin
    }
  }, [location, navigate]);

  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Make API request using axios instead of fetch
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/register`, {
        email: formData.email,
        password: formData.password,
      });

      // Check if the response is successful
      if (response.status === 200) {
        setMessage("User registered successfully!");
        setTimeout(() => navigate("/admin"), 1500); // Redirect after success
      }
    } catch (error: any) {
      // Handle error
      setMessage(error.response?.data?.error || error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-2xl mb-4">Register</h2>
      {message && <p className="mb-2 text-red-500">{message}</p>}
      <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
        <input
          name="name"
          type="text"
          placeholder="Name"
          onChange={handleChange}
          className="p-2 border rounded"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleChange}
          className="p-2 border rounded"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          className="p-2 border rounded"
        />
        <button
          type="submit"
          className="bg-green-500 text-white p-2 rounded"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default Register;
