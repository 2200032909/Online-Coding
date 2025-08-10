import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [submissions, setSubmissions] = useState([]); 
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchData() {
      try {
        const [userRes, solvedRes] = await Promise.all([
          axios.get("http://localhost:5000/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/auth/submissions", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setUser(userRes.data);

        setSubmissions(solvedRes.data.submissions || solvedRes.data.solvedProblems || []);
      } catch (err) {
        console.error("Error loading profile data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <svg
          className="animate-spin h-12 w-12 text-indigo-600"
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
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600 text-lg font-semibold">
        User not found or not logged in.
      </div>
    );
  }

  // Group submissions by problemId
  const groupedByProblem = (submissions || []).reduce((acc, sub) => {
    const pid = sub.problemId._id;
    if (!acc[pid]) acc[pid] = { problem: sub.problemId, submissions: [] };
    acc[pid].submissions.push(sub);
    return acc;
  }, {});

  const totalSolved = Object.keys(groupedByProblem).length;

  // Dummy chart data
  const dummyChartData = [
    { day: 'Mon', solved: 2 },
    { day: 'Tue', solved: 1 },
    { day: 'Wed', solved: 3 },
    { day: 'Thu', solved: 0 },
    { day: 'Fri', solved: 1 },
    { day: 'Sat', solved: 0 },
    { day: 'Sun', solved: 2 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-6 sm:p-12 max-w-7xl mx-auto">
      <button
        onClick={() => navigate('/')}
        className="mb-8 inline-flex items-center space-x-2 px-5 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none" viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        <span>Back to Dashboard</span>
      </button>

      <h1 className="text-5xl font-extrabold mb-10 text-indigo-900 drop-shadow-md select-none">
        User Profile
      </h1>

      {/* User Info Card */}
      <section className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-8 mb-12 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-indigo-900 dark:text-indigo-300">{user.name}</h2>
          <p className="text-gray-700 dark:text-gray-300 mt-1">{user.email}</p>
          <p className="text-gray-600 dark:text-gray-400 mt-2 capitalize">Role: {user.role}</p>
        </div>
        <div className="mt-6 md:mt-0 text-center md:text-right">
          <p className="text-lg font-semibold text-green-700 dark:text-green-400 tracking-wide uppercase">
            Problems Solved
          </p>
          <p className="text-5xl font-extrabold text-green-600 dark:text-green-500">{totalSolved}</p>
        </div>
      </section>

      {/* Performance Chart */}
      <section className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-8 mb-12">
        <h3 className="text-2xl font-semibold mb-6 text-indigo-900 dark:text-indigo-300">Weekly Problem Solving Activity</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={dummyChartData} margin={{ top: 0, right: 15, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="day"
              stroke="#4F46E5"
              tickLine={false}
              axisLine={{ stroke: '#A5B4FC' }}
              style={{ fontWeight: '600' }}
            />
            <YAxis
              allowDecimals={false}
              stroke="#4F46E5"
              tickLine={false}
              axisLine={{ stroke: '#A5B4FC' }}
              style={{ fontWeight: '600' }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#4F46E5', color: 'white', borderRadius: 8, fontWeight: 600 }}
              cursor={{ fill: 'rgba(79, 70, 229, 0.2)' }}
            />
            <Bar dataKey="solved" fill="#4F46E5" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* Solved Problems List */}
      <section className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-8 max-h-[480px] overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-400 scrollbar-track-indigo-100 dark:scrollbar-thumb-indigo-600 dark:scrollbar-track-gray-700">
        <h3 className="text-2xl font-semibold mb-6 text-indigo-900 dark:text-indigo-300">Solved Problems & Submissions</h3>
        {totalSolved === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            You haven't solved any problems yet. Start coding now!
          </p>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedByProblem).map(([problemId, { problem, submissions }]) => (
              <div
                key={problemId}
                className="border border-indigo-300 dark:border-indigo-700 rounded-lg p-5 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/code-editor/${submissions[0]._id}`, { state: { submission: submissions[0] } })}
              >
                <h4 className="font-semibold text-xl mb-4 text-indigo-700 dark:text-indigo-400">
                  {problem.title}
                </h4>
                <ul className="space-y-2">
                  {submissions.map(submission => (
                    <li
                      key={submission._id}
                      className="flex justify-between items-center bg-indigo-50 dark:bg-indigo-900 rounded px-4 py-2 hover:bg-indigo-100 dark:hover:bg-indigo-800 transition"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering parent onClick
                        navigate(`/code-editor/${submission._id}`, { state: { submission } });
                      }}
                    >
                      <span className="font-medium text-indigo-900 dark:text-indigo-200">
                        Language: <span className="capitalize">{submission.language}</span>
                      </span>
                      <span className="text-green-600 font-bold select-none" title="Solved">✔️</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
