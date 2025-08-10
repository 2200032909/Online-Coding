import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Usersubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        // Add token here if your API needs authentication
        // const token = localStorage.getItem("token");

        const res = await axios.get("http://localhost:5000/api/users/submissions"
          // , { headers: { Authorization: `Bearer ${token}` } }
        );

        setSubmissions(res.data.submissions);
      } catch (err) {
        console.error("Failed to fetch submissions:", err);
        setError("Failed to load submissions");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  if (loading) return <p className="text-center">Loading submissions...</p>;

  if (error) return <p className="text-center text-red-600">{error}</p>;

  if (submissions.length === 0) return <p className="text-center">No submissions found.</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Submissions</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2 border">User</th>
              <th className="px-4 py-2 border">Email</th>
              <th className="px-4 py-2 border">Problem</th>
              <th className="px-4 py-2 border">Language</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Submitted At</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((s) => (
              <tr key={s._id} className="text-center">
                <td className="px-4 py-2 border">{s.userId?.name}</td>
                <td className="px-4 py-2 border">{s.userId?.email}</td>
                <td className="px-4 py-2 border">{s.problemId?.title}</td>
                <td className="px-4 py-2 border">{s.language}</td>
                <td
                  className={`px-4 py-2 border font-bold ${
                    s.status === "passed" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {s.status}
                </td>
                <td className="px-4 py-2 border">
                  {new Date(s.submittedAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
