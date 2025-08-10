import React, { useEffect, useState } from 'react';
import axios from 'axios';


export default function AdminProblemList() {
  const [problems, setProblems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [editProblem, setEditProblem] = useState(null);

  const problemsPerPage = 5;

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/problems');
        setProblems(res.data);
      } catch (err) {
        console.error("Error fetching problems:", err);
      }
    };
    fetchProblems();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this problem?")) {
      try {
        await axios.delete(`http://localhost:5000/api/problems/delete/${id}`);
        setProblems(prev => prev.filter(p => p._id !== id));
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

  const handleEditClick = (problem) => {
    setEditProblem({
      ...problem,
      visibleTestCases: [...problem.visibleTestCases],
      hiddenTestCases: [...problem.hiddenTestCases]
    });
  };

  const handleEditChange = (e) => {
    setEditProblem({ ...editProblem, [e.target.name]: e.target.value });
  };

  const handleEditTestCaseChange = (type, index, field, value) => {
    const updatedTestCases = [...editProblem[type]];
    updatedTestCases[index][field] = value;
    setEditProblem({ ...editProblem, [type]: updatedTestCases });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/problems/edit/${editProblem._id}`, editProblem);
      alert("Problem updated successfully!");
      setEditProblem(null);
      const res = await axios.get('http://localhost:5000/api/problems');
      setProblems(res.data);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const filteredProblems = problems.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLast = currentPage * problemsPerPage;
  const indexOfFirst = indexOfLast - problemsPerPage;
  const currentProblems = filteredProblems.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredProblems.length / problemsPerPage);

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">All Problems</h2>

      <input
        type="text"
        placeholder="Search problems..."
        className="border px-3 py-2 mb-4 w-full"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <table className="w-full text-left border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Title</th>
            <th className="p-2">Difficulty</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentProblems.map(problem => (
            <tr key={problem._id} className="border-t">
              <td className="p-2">{problem.title}</td>
              <td className="p-2">{problem.difficulty}</td>
              <td className="p-2 space-x-2">
                <button
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  onClick={() => setSelectedProblem(problem)}
                >
                  Preview
                </button>
                <button
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  onClick={() => handleEditClick(problem)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  onClick={() => handleDelete(problem._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {currentProblems.length === 0 && (
            <tr>
              <td colSpan="3" className="text-center p-4">No problems found</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="mt-4 flex justify-center items-center space-x-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 rounded border ${currentPage === i + 1 ? 'bg-blue-600 text-white' : ''}`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Preview Modal */}
      {selectedProblem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-3/4 max-h-[90vh] overflow-y-auto p-6 rounded-lg shadow-lg relative">
            <h3 className="text-xl font-bold mb-2">{selectedProblem.title}</h3>
            <p><strong>Difficulty:</strong> {selectedProblem.difficulty}</p>
            <p><strong>Description:</strong> {selectedProblem.description}</p>
            <p><strong>Constraints:</strong> {selectedProblem.constraints}</p>
            <p><strong>Sample Input:</strong> {selectedProblem.sampleInput}</p>
            <p><strong>Sample Output:</strong> {selectedProblem.sampleOutput}</p>
            <p><strong>Tags:</strong> {selectedProblem.tags?.join(', ')}</p>

            <div className="mt-4">
              <p className="font-semibold">Visible Test Cases:</p>
              {selectedProblem.visibleTestCases?.map((tc, i) => (
                <div key={i} className="mb-2">
                  <div><strong>Input:</strong> {tc.input}</div>
                  <div><strong>Output:</strong> {tc.output}</div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <p className="font-semibold">Hidden Test Cases:</p>
              {selectedProblem.hiddenTestCases?.map((tc, i) => (
                <div key={i} className="mb-2">
                  <div><strong>Input:</strong> {tc.input}</div>
                  <div><strong>Output:</strong> {tc.output}</div>
                </div>
              ))}
            </div>

            <button onClick={() => setSelectedProblem(null)} className="absolute top-2 right-4 text-red-600 font-bold text-xl">×</button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editProblem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-3/4 max-h-[90vh] overflow-y-auto p-6 rounded-lg shadow-lg relative">
            <h3 className="text-xl font-bold mb-4">Edit Problem</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <input name="title" value={editProblem.title} onChange={handleEditChange} className="w-full border p-2" />
              <select name="difficulty" value={editProblem.difficulty} onChange={handleEditChange} className="w-full border p-2">
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
              <textarea name="description" value={editProblem.description} onChange={handleEditChange} className="w-full border p-2 h-24" />
              <textarea name="constraints" value={editProblem.constraints} onChange={handleEditChange} className="w-full border p-2 h-20" />
              <textarea name="sampleInput" value={editProblem.sampleInput} onChange={handleEditChange} className="w-full border p-2 h-20" />
              <textarea name="sampleOutput" value={editProblem.sampleOutput} onChange={handleEditChange} className="w-full border p-2 h-20" />
              <input
                name="tags"
                value={editProblem.tags?.join(', ')}
                onChange={(e) => setEditProblem({ ...editProblem, tags: e.target.value.split(',').map(tag => tag.trim()) })}
                className="w-full border p-2"
              />

              {/* Visible Test Cases */}
              <div>
                <p className="font-semibold mb-1">Visible Test Cases:</p>
                {editProblem.visibleTestCases.map((tc, i) => (
                  <div key={i} className="mb-2 space-y-1">
                    <input
                      type="text"
                      value={tc.input}
                      onChange={(e) => handleEditTestCaseChange('visibleTestCases', i, 'input', e.target.value)}
                      placeholder="Input"
                      className="w-full border p-2"
                    />
                    <input
                      type="text"
                      value={tc.output}
                      onChange={(e) => handleEditTestCaseChange('visibleTestCases', i, 'output', e.target.value)}
                      placeholder="Output"
                      className="w-full border p-2"
                    />
                  </div>
                ))}
              </div>

              {/* Hidden Test Cases */}
              <div>
                <p className="font-semibold mb-1">Hidden Test Cases:</p>
                {editProblem.hiddenTestCases.map((tc, i) => (
                  <div key={i} className="mb-2 space-y-1">
                    <input
                      type="text"
                      value={tc.input}
                      onChange={(e) => handleEditTestCaseChange('hiddenTestCases', i, 'input', e.target.value)}
                      placeholder="Input"
                      className="w-full border p-2"
                    />
                    <input
                      type="text"
                      value={tc.output}
                      onChange={(e) => handleEditTestCaseChange('hiddenTestCases', i, 'output', e.target.value)}
                      placeholder="Output"
                      className="w-full border p-2"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Update</button>
                <button type="button" onClick={() => setEditProblem(null)} className="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
