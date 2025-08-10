import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function CodeEditor() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const submission = state?.submission;

  if (!submission) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-6">
        <p className="text-lg text-red-600 mb-4 font-semibold">No submission data found.</p>
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-8 max-w-5xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="mb-8 inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        <span>Back</span>
      </button>

      <h1 className="text-4xl font-extrabold text-indigo-900 mb-4 select-text">{submission.problemId.title}</h1>
      <p className="text-indigo-700 font-semibold mb-6">Language: <span className="capitalize">{submission.language}</span></p>

      <pre
        className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg p-6 shadow-lg overflow-auto max-h-[600px] font-mono text-sm leading-relaxed"
        style={{ whiteSpace: 'pre-wrap' }}
      >
        {submission.code}
      </pre>
    </div>
  );
}
