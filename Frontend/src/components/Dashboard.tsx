import React, { useState, useEffect } from "react";

interface Item {
  id: number;
  name: string;
  description: string;
  date: string;
  location: string;
  status: string;
  image: string;
}

const Dashboard = ({ type }: { type: "lost" | "found" }) => {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    // Mock data; replace with an actual API call to fetch items from the database
    const mockData: Item[] = [
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
    ];

    setItems(mockData); // Fetch or mock the data here
  }, []);

  return (
    <div className="dashboard">
      <h3>{type === "lost" ? "Your Lost Items" : "Your Found Items"}</h3>
      <div className="dashboard-items">
        {items.map((item) => (
          <div key={item.id} className="dashboard-item">
            <img src={item.image} alt={item.name} className="dashboard-item-image" />
            <div>
              <h4>{item.name}</h4>
              <p>{item.description}</p>
              <p>{type === "lost" ? "Lost on: " : "Found on: "} {item.date}</p>
              <p>Status: {item.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
