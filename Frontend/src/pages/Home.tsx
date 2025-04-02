import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    const createParticle = (type: 'glow-orb' | 'sparkle') => {
      const particle = document.createElement("div");
      particle.className = `particle ${type}`;
      
      if (type === 'glow-orb') {
        particle.style.left = `${Math.random() * 100}vw`;
        particle.style.top = `${Math.random() * 100}vh`;
        particle.style.animationDuration = `${Math.random() * 10 + 10}s`;
      } else {
        particle.style.left = `${Math.random() * 100}vw`;
        particle.style.top = '-10px';
        particle.style.animationDuration = `${Math.random() * 3 + 2}s`;
      }

      document.body.appendChild(particle);
      particle.addEventListener("animationend", () => particle.remove());
    };

    // Initial burst
    for (let i = 0; i < 15; i++) {
      setTimeout(() => createParticle('glow-orb'), i * 200);
      setTimeout(() => createParticle('sparkle'), i * 100);
    }

    // Continuous creation
    const intervals = [
      setInterval(() => createParticle('glow-orb'), 2500),
      setInterval(() => createParticle('sparkle'), 150)
    ];

    return () => intervals.forEach(clearInterval);
  }, []);

  const handleNavigation = (path: string) => {
    if (!localStorage.getItem("token")) {
      setError("Please login first");
      setTimeout(() => setError(""), 3000);
    } else {
      navigate(path);
    }
  };

  return (
    <div className="container">
      {error && <div className="error-message">{error}</div>}
      
      <h1 className="title">Find My Stuff</h1>
      
      <div className="action-buttons">
        <button onClick={() => handleNavigation("/lost")}>Lost an Item</button>
        <button onClick={() => handleNavigation("/found")}>Found an Item</button>
      </div>
    </div>
  );
};


export default Home;