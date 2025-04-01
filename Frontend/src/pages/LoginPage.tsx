import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import "../styles/login.css";

const Login = () => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string>("");
    const navigate = useNavigate();
    const auth = useContext(AuthContext);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            setError("Email and Password cannot be empty");
            return;
        }

        setError(""); // Clear previous errors

        try {
            // Send login request to the backend
            const response = await axios.post("http://localhost:5000/login", { email, password });

            console.log("Backend response:", response.data); // Log the response for debugging
            console.log("authtoken",response.data.access_token);

            if (response.data.message='Login succesful') {
                // Store token in localStorage & AuthContext
                auth?.setToken(response.data.access_token);
                localStorage.setItem("token", response.data.access_token);

                // Navigate to Home Page
                navigate("/home");
            } else {
                setError("Login failed. Please try again.");
            }
        } catch (error: any) {
            console.error("Login error:", error.response || error);

            // Handle the error gracefully and display message
            setError(error.response?.data?.error || "Login failed. Check credentials.");
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit} className="login-form">
                <h2>Login</h2>
                {error && <p className="error-message">{error}</p>}
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <input type="submit" value="Login" />
            </form>
        </div>
    );
};

export default Login;
