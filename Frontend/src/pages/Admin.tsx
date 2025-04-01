import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios
import "../styles/Admin.css";

const Admin = () => {
  const navigate = useNavigate(); // For navigation

  const [reports, setReports] = useState([
    { id: 1, name: "Laptop", type: "Lost", date: "2025-03-15", status: "Pending" },
    { id: 2, name: "Wallet", type: "Found", date: "2025-03-16", status: "Resolved" },
  ]);

  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleAction = (id: number, action: string) => {
    setReports((prevReports) =>
      prevReports.map((report) =>
        report.id === id ? { ...report, status: action } : report
      )
    );
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData({ ...registerData, [name]: value });
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!registerData.email || !registerData.password) {
      setError("Email and Password are required!");
      return;
    }

    try {
      // Make an axios POST request to the backend to register the user
      const response = await axios.post("http://localhost:5000/register", {
        email: registerData.email,
        password: registerData.password,
      });

      alert("User Registered Successfully");
      setRegisterData({ email: "", password: "" });
      setError(""); // Clear any errors after successful registration
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to register user");
    }
  };

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <h2>Admin Panel</h2>
        <ul>
          <li>Dashboard</li>
          <li>Manage Reports</li>
          <li>Settings</li>
        </ul>
        {/* Register New User Button */}
        <button
          className="register-btn"
          onClick={() => navigate("/register", { state: { fromAdmin: true } })}
        >
          Register New User
        </button>
      </aside>

      <main className="admin-content">
        <h1>Manage Lost & Found Reports</h1>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Type</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id}>
                <td>{report.name}</td>
                <td>{report.type}</td>
                <td>{report.date}</td>
                <td>{report.status}</td>
                <td>
                  <button
                    className="approve-btn"
                    onClick={() => handleAction(report.id, "Approved")}
                  >
                    Approve
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleAction(report.id, "Deleted")}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Register User Form */}
        <div className="register-form">
          <h3>Register New User</h3>
          {error && <p className="error-message">{error}</p>}
          <form onSubmit={handleRegisterSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={registerData.email}
              onChange={handleRegisterChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={registerData.password}
              onChange={handleRegisterChange}
              required
            />
            <button type="submit">Register</button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Admin;
