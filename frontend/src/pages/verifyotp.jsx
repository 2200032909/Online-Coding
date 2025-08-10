import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

export default function VerifyOtp() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('tempToken')}`,
        },
        body: JSON.stringify({ otp }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.removeItem('tempToken');
        localStorage.setItem('token', data.token);
        autoLogout(data.token);
        navigate('/admin-dashboard');
      } else {
        setError(data.message || 'OTP verification failed.');
      }
    } catch {
      setError('Network error. Please try again.');
    }

    setLoading(false);
  };

  const autoLogout = (token, key = 'token') => {
    try {
      const decoded = jwtDecode(token);
      const exp = decoded.exp * 1000;
      const now = Date.now();
      const timeLeft = exp - now;

      if (timeLeft > 0) {
        setTimeout(() => {
          localStorage.removeItem(key);
          alert('Session expired. You have been logged out.');
          navigate('/login');
        }, timeLeft);
      } else {
        localStorage.removeItem(key);
        navigate('/login');
      }
    } catch {
      localStorage.removeItem(key);
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 px-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8">
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-8">
          Admin OTP Verification
        </h2>

        <form onSubmit={handleSubmit} noValidate>
          <div className="relative mb-6">
            <input
              id="otp"
              name="otp"
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/, ''))} // only digits
              placeholder=" "
              className="peer placeholder-transparent w-full border-b-2 border-gray-300 focus:border-indigo-600 text-lg text-gray-900 py-3 outline-none transition duration-300"
              autoComplete="one-time-code"
            />
            <label
              htmlFor="otp"
              className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3.5 peer-focus:text-indigo-600 peer-focus:text-sm cursor-text select-none"
            >
              Enter 6-digit OTP
            </label>
          </div>

          {error && (
            <p className="text-center text-sm text-red-600 mb-4 select-none">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className={`w-full py-3 rounded-xl font-semibold text-white transition-colors duration-300 ${
              loading || otp.length !== 6
                ? 'bg-indigo-300 cursor-not-allowed'
                : 'bg-indigo-700 hover:bg-indigo-800 cursor-pointer'
            } flex justify-center items-center gap-2`}
          >
            {loading && (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
            )}
            Verify OTP
          </button>
        </form>
      </div>
    </div>
  );
}
