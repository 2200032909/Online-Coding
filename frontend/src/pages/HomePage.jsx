import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100); // slight delay for animation
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#1f2937] via-[#4f46e5] to-[#9333ea] flex items-center justify-center px-4 py-10 font-inter">
      <div
        className={`bg-white shadow-2xl rounded-3xl max-w-6xl w-full flex flex-col md:flex-row overflow-hidden transform transition-all duration-700 ${
          loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Left Content */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Welcome to <span className="text-indigo-600">CodeChamp</span>
          </h1>
          <p className="text-gray-700 mb-6 text-lg">
            Build your coding skills with our powerful online judge platform.
            Solve problems, test your logic, and level up like a pro.
          </p>
          <div className="space-x-4">
            <Link to="/login">
              <button className="px-6 py-3 bg-indigo-600 text-white rounded-full font-semibold shadow-md hover:scale-105 hover:shadow-lg transform transition duration-300 hover:bg-indigo-700">
                Login
              </button>
            </Link>
            <Link to="/register">
              <button className="px-6 py-3 bg-white text-indigo-600 border border-indigo-600 rounded-full font-semibold shadow-md hover:scale-105 hover:shadow-md transform transition duration-300 hover:bg-gray-100">
                Register
              </button>
            </Link>
          </div>
        </div>

        {/* Right Image */}
        <div className="w-full md:w-1/2 bg-indigo-50 flex items-center justify-center p-6 animate-fade-in delay-100">
          <img
            src="https://illustrations.popsy.co/orange/app-launch.svg"
            alt="coding illustration"
            className="max-w-full h-auto"
          />
        </div>
      </div>
    </div>
  );
}
