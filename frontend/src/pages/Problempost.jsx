import React, { useState } from 'react';
import axios from 'axios';

export default function AdminProblemForm() {
  const [problem, setProblem] = useState({
    title: '',
    description: '',
    difficulty: 'Easy',
    constraints: '',
    sampleInput: '',
    sampleOutput: '',
    testCases: [{ input: '', expectedOutput: '', isHidden: false }],
    tags: '',
  });

  const handleChange = (e) => {
    setProblem({ ...problem, [e.target.name]: e.target.value });
  };

  const handleTestChange = (index, field, value) => {
    const updated = [...problem.testCases];
    updated[index][field] = value;
    setProblem({ ...problem, testCases: updated });
  };

  const addTestCase = (isHidden = false) => {
    setProblem({
      ...problem,
      testCases: [
        ...problem.testCases,
        { input: '', expectedOutput: '', isHidden },
      ],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...problem,
        tags: problem.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag !== ''),
      };
      await axios.post('http://localhost:5000/api/problems/create', payload);
      alert('Problem posted successfully!');
      // Optionally reset form
    } catch (err) {
      console.error(err);
      alert('Error posting problem');
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Post a New Problem</h2>
      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          name="title"
          placeholder="Problem Title"
          className="w-full border p-2"
          onChange={handleChange}
          value={problem.title}
          required
        />

        <select
          name="difficulty"
          className="w-full border p-2"
          onChange={handleChange}
          value={problem.difficulty}
          required
        >
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>

        <textarea
          name="description"
          placeholder="Problem Description (explain input/output format)"
          className="w-full border p-2 h-28"
          onChange={handleChange}
          value={problem.description}
          required
        />

        <textarea
          name="constraints"
          placeholder="Constraints"
          className="w-full border p-2 h-24"
          onChange={handleChange}
          value={problem.constraints}
        />

        <textarea
          name="sampleInput"
          placeholder="Sample Input"
          className="w-full border p-2 h-20"
          onChange={handleChange}
          value={problem.sampleInput}
          required
        />

        <textarea
          name="sampleOutput"
          placeholder="Sample Output"
          className="w-full border p-2 h-20"
          onChange={handleChange}
          value={problem.sampleOutput}
          required
        />

        <input
          name="tags"
          placeholder="Tags (comma-separated)"
          className="w-full border p-2"
          onChange={handleChange}
          value={problem.tags}
        />

        <div>
          <h4 className="font-medium mt-4">Test Cases</h4>
          {problem.testCases.map((tc, idx) => (
            <div key={idx} className="mb-3">
              <div className="flex gap-2">
                <textarea
                  className="w-1/2 border p-2"
                  placeholder="Input"
                  value={tc.input}
                  onChange={(e) =>
                    handleTestChange(idx, 'input', e.target.value)
                  }
                />
                <textarea
                  className="w-1/2 border p-2"
                  placeholder="Expected Output"
                  value={tc.expectedOutput}
                  onChange={(e) =>
                    handleTestChange(idx, 'expectedOutput', e.target.value)
                  }
                />
              </div>
              <label className="text-sm flex items-center gap-2 mt-1">
                <input
                  type="checkbox"
                  checked={tc.isHidden}
                  onChange={(e) =>
                    handleTestChange(idx, 'isHidden', e.target.checked)
                  }
                />
                Hidden Test Case
              </label>
            </div>
          ))}

          <button
            type="button"
            className="text-blue-500 mr-4"
            onClick={() => addTestCase(false)}
          >
            + Add Visible Test Case
          </button>
          <button
            type="button"
            className="text-purple-500"
            onClick={() => addTestCase(true)}
          >
            + Add Hidden Test Case
          </button>
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
        >
          Post Problem
        </button>
      </form>
    </div>
  );
}
