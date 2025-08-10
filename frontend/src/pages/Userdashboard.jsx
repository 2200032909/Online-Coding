import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Import Heroicons (you may need to install @heroicons/react)
import { SunIcon, MoonIcon, CheckCircleIcon, UserCircleIcon } from "@heroicons/react/24/solid";

export default function UserDashboard() {
  const [problems, setProblems] = useState([]);
  const [user, setUser] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [loadingProblems, setLoadingProblems] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    // Try to load from localStorage or default false
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    setLoadingProblems(true);
    axios.get("http://localhost:5000/api/problems")
      .then((res) => setProblems(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoadingProblems(false));

    if (token) {
      setLoadingUser(true);
      // Fetch logged-in user info
      axios.get("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data))
      .catch((err) => console.error("Error fetching user:", err))
      .finally(() => setLoadingUser(false));

      // Fetch user's solved problems
      axios.get("http://localhost:5000/api/auth/submissions", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setSolvedProblems(res.data.submissions || []))
      .catch((err) => console.error("Error fetching solved problems:", err));
    }
  }, [token]);

  // Save dark mode preference and toggle class on <html>
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const handleProblemClick = (id) => {
    navigate(`/problem/${id}`);
  };

  const toggleUserDetails = () => {
    setShowDetails((prev) => !prev);
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 sm:p-8 transition-colors duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-10">
        <h1 className="text-4xl font-extrabold text-indigo-700 dark:text-indigo-400 tracking-wide select-none mb-4 sm:mb-0">
          Welcome <span className="text-blue-600 dark:text-blue-400">{user ? user.name : "CodeChamp"}</span>
        </h1>

        <div className="flex items-center space-x-6">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            aria-label={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="p-2 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-700 transition-colors"
            title="Toggle Dark Mode"
          >
            {darkMode ? (
              <SunIcon className="h-6 w-6 text-yellow-400" />
            ) : (
              <MoonIcon className="h-6 w-6 text-indigo-700" />
            )}
          </button>

          {/* Profile Icon */}
          {loadingUser ? (
            <div className="w-12 h-12 rounded-full bg-indigo-300 animate-pulse" />
          ) : user ? (
            <div className="relative">
              <button
                onClick={toggleUserDetails}
                className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-blue-500 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-lg hover:scale-110 transform transition-transform duration-300 ease-out ring-2 ring-indigo-400 hover:ring-blue-500"
                title="Toggle User Details"
                aria-expanded={showDetails}
              >
                {user.name.charAt(0).toUpperCase()}
              </button>

              {/* User Details Dropdown */}
              <div
                className={`absolute right-0 mt-3 w-72 bg-white dark:bg-gray-800 shadow-xl rounded-xl p-5 text-gray-800 dark:text-gray-200
                  transform transition-all duration-300 ease-in-out origin-top-right
                  ${showDetails ? "opacity-100 scale-100 visible" : "opacity-0 scale-90 invisible"}
                `}
              >
                <p className="font-semibold text-lg mb-3 border-b border-indigo-200 dark:border-indigo-700 pb-2 select-text">
                  User Details
                </p>
                <p className="text-sm mb-1">
                  <span className="font-semibold">Name:</span> {user.name}
                </p>
                <p className="text-sm mb-1">
                  <span className="font-semibold">Email:</span> {user.email}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Role:</span> {user.role}
                </p>
                <button
                  className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold py-2 rounded-lg transition-colors"
                  onClick={() => navigate('/user-profile')}
                >
                  Go to Profile
                </button>
              </div>
            </div>
          ) : (
            <UserCircleIcon className="h-12 w-12 text-indigo-400" />
          )}
        </div>
      </div>

      {/* Problem List */}
      {loadingProblems ? (
        <div className="flex justify-center items-center mt-20">
          <svg
            className="animate-spin h-10 w-10 text-indigo-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none" viewBox="0 0 24 24"
            aria-label="Loading"
          >
            <circle
              className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"
            />
            <path
              className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        </div>
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          style={{ perspective: "1000px" }}
        >
          {problems.map((problem) => {
            const solvedEntry = Array.isArray(solvedProblems)
              ? solvedProblems.find(sp => {
                  if (!sp.problemId) return false;
                  if (typeof sp.problemId === "string") {
                    return sp.problemId === problem._id;
                  } else if (typeof sp.problemId === "object") {
                    return sp.problemId._id.toString() === problem._id.toString();
                  }
                  return false;
                })
              : undefined;

            const isSolved = !!solvedEntry;

            return (
              <div
                key={problem._id}
                className={`
                  bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-md cursor-pointer
                  transition-transform duration-400 ease-out
                  hover:scale-[1.04] hover:shadow-2xl
                  transform-gpu
                  relative
                  border-4 ${isSolved ? "border-green-400" : "border-transparent"}
                  group
                `}
                onClick={() => handleProblemClick(problem._id)}
                aria-label={`Problem: ${problem.title}, ${isSolved ? "Solved" : "Unsolved"}`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleProblemClick(problem._id);
                  }
                }}
              >
                <h2 className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 flex items-center justify-between select-none">
                  {problem.title}

                  {isSolved && (
                    <CheckCircleIcon
                      className="ml-3 h-7 w-7 text-green-500 animate-popIn"
                      title="Solved"
                      aria-label="Solved"
                    />
                  )}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mt-3 line-clamp-3 select-text">{problem.description}</p>

                {/* subtle shine animation on hover */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-30
                  bg-gradient-to-r from-transparent via-white to-transparent
                  dark:from-transparent dark:via-gray-600 dark:to-transparent
                  animate-shimmer"
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes popIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          70% {
            opacity: 1;
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }

        .animate-popIn {
          animation: popIn 0.4s ease forwards;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        .animate-shimmer {
          background-size: 200% 100%;
          animation: shimmer 1.8s linear infinite;
        }
      `}</style>
    </div>
  );
}
