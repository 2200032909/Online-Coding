// src/pages/AdminDashboard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Post Problems",
      description: "Add new coding problems for users.",
      route: "/problempost",
    },
    {
      title: "View Users",
      description: "See all registered users and their details.",
      route: "/userdetails",
    },
    
    {
      title: "All Problems",
      description: "Manage and update the problem list.",
      route: "/all",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            onClick={() => navigate(card.route)}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 cursor-pointer border border-gray-200 hover:border-blue-500"
          >
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              {card.title}
            </h2>
            <p className="text-gray-500">{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
