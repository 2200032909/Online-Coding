import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Login failed');
        setLoading(false);
        return;
      }

      if (data.role === 'admin' && data.otpSent) {
        localStorage.setItem('tempToken', data.token);
        autoLogout(data.token, 'tempToken');
        navigate('/verify-otp');
      } else {
        localStorage.setItem('token', data.token);
        autoLogout(data.token, 'token');
        navigate('/user-dashboard');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
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
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-tr from-indigo-100 to-indigo-300 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-10 rounded-xl shadow-xl w-full max-w-md"
        noValidate
      >
        <h2 className="text-3xl font-extrabold mb-8 text-center text-indigo-700">Login</h2>

        {/* Email Input */}
        <div className="relative mb-6">
          <input
            id="email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="email"
            className="peer placeholder-transparent h-12 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-indigo-600"
            placeholder="Email address"
          />
          <label
            htmlFor="email"
            className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:-top-3.5 peer-focus:text-indigo-600 peer-focus:text-sm"
          >
            Email address
          </label>
        </div>

        {/* Password Input */}
        <div className="relative mb-2">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
            className="peer placeholder-transparent h-12 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-indigo-600"
            placeholder="Password"
          />
          <label
            htmlFor="password"
            className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:-top-3.5 peer-focus:text-indigo-600 peer-focus:text-sm"
          >
            Password
          </label>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-0 top-2/4 -translate-y-2/4 text-sm text-indigo-600 hover:text-indigo-800 focus:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <p className="mb-4 text-sm text-red-600 font-semibold select-none">{error}</p>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-full text-white font-semibold transition ${
            loading
              ? "bg-indigo-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
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
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              ></path>
            </svg>
          )}
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
