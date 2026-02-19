import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import axios from "axios";

export default function ProblemView() {
  const { id } = useParams();

  const [problem, setProblem] = useState(null);
  const [language, setLanguage] = useState("cpp");
  const [userCode, setUserCode] = useState("");
  const [output, setOutput] = useState("");
  const [success, setSuccess] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const editorRef = useRef(null);

  useEffect(() => {
    async function fetchProblem() {
      try {
        const res = await axios.get(`http://localhost:5000/api/problems/${id}`);
        setProblem(res.data);
      } catch (err) {
        console.error("Failed to load problem", err);
      }
    }
    fetchProblem();
  }, [id]);

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
  };

  const handleRun = async () => {
    if (!problem) return;

    setIsRunning(true);
    setOutput("Running test cases...");
    setSuccess(null);

    try {
      const res = await axios.post("http://localhost:5000/api/run", {
        code: userCode,
        language,
        problemId: problem._id,
      });

      setSuccess(res.data.success);

      const formattedOutput = res.data.results
        .map(
          (r, i) =>
            `Test case #${i + 1}:
Input:
${r.input}
Expected Output:
${r.expected}
Your Output:
${r.output}
Result: ${r.passed ? "✅ Passed" : "❌ Failed"}
${r.error ? "Error: " + r.error : ""}`
        )
        .join("\n---------------------------\n");

      setOutput(formattedOutput);
    } catch (err) {
      console.error(err);
      setOutput("Error running code.");
      setSuccess(false);
    }

    setIsRunning(false);
  };

  const handleSubmit = async () => {
    if (!problem) return;

    setIsRunning(true);
    setOutput("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setOutput("You must be logged in to submit.");
        setSuccess(false);
        setIsRunning(false);
        return;
      }

      const res = await axios.post(
        "http://localhost:5000/api/submit",
        {
          code: userCode,
          language,
          problemId: id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const { results, passedAll } = res.data;

      let formatted = results
        .map(
          (r, i) =>
            `Test case #${i + 1}:
Input:
${r.input}
Expected:
${r.expected}
Output:
${r.output}
Passed: ${r.passed ? "✅" : "❌"}`
        )
        .join("\n------------------\n");

      formatted += passedAll
        ? "\n🎉 All test cases passed!"
        : "\n❌ Some test cases failed.";

      setOutput(formatted);
      setSuccess(passedAll);
    } catch (err) {
      console.error(err);
      setOutput("Error submitting code.");
      setSuccess(false);
    }

    setIsRunning(false);
  };

  if (!problem) return <div>Loading problem...</div>;

  return (
    <div className="flex h-screen">
      {/* LEFT PANEL */}
      <div className="w-1/2 p-6 overflow-y-auto bg-gray-50">
        <h1 className="text-3xl font-bold">{problem.title}</h1>
        <p className="whitespace-pre-line mt-4">{problem.description}</p>

        {problem.difficulty && (
          <p className="mt-2">
            <strong>Difficulty:</strong> {problem.difficulty}
          </p>
        )}

        {problem.constraints && (
          <>
            <h3 className="mt-6 font-semibold">Constraints:</h3>
            <p className="whitespace-pre-line">{problem.constraints}</p>
          </>
        )}

        <h3 className="mt-6 font-semibold">Sample Input:</h3>
        <pre className="bg-white p-2 rounded border">
          {problem.sampleInput}
        </pre>

        <h3 className="mt-4 font-semibold">Sample Output:</h3>
        <pre className="bg-white p-2 rounded border">
          {problem.sampleOutput}
        </pre>

        {/* ✅ TAGS */}
        {problem.tags && problem.tags.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Tags:</h3>
            <div className="flex flex-wrap gap-2">
              {problem.tags.map((tag, i) => (
                <span
                  key={i}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ✅ VISIBLE TEST CASES */}
        {problem.testCases &&
          problem.testCases.some((tc) => !tc.isHidden) && (
            <div className="mt-6">
              <h3 className="font-semibold mb-3">Visible Test Cases:</h3>
              <div className="space-y-4">
                {problem.testCases
                  .filter((tc) => !tc.isHidden)
                  .map((tc, i) => (
                    <div
                      key={i}
                      className="p-4 bg-white border rounded shadow-sm"
                    >
                      <p className="font-semibold">Test Case #{i + 1}</p>

                      <p className="mt-2">Input:</p>
                      <pre className="bg-gray-100 p-2 rounded">
                        {tc.input}
                      </pre>

                      <p className="mt-2">Expected Output:</p>
                      <pre className="bg-gray-100 p-2 rounded">
                        {tc.expectedOutput}
                      </pre>
                    </div>
                  ))}
              </div>
            </div>
          )}

        {/* ✅ META INFO */}
        <div className="mt-6 text-sm text-gray-600">
          <p>
            <strong>Problem ID:</strong> {problem._id}
          </p>
          {problem.createdAt && (
            <p>
              <strong>Created At:</strong>{" "}
              {new Date(problem.createdAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-1/2 p-6 flex flex-col bg-white min-h-0">
        <label className="mb-2 font-semibold">Language:</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="mb-4 p-2 border rounded"
        >
          <option value="cpp">C++</option>
          <option value="c">C</option>
          <option value="java">Java</option>
          <option value="python">Python</option>
        </select>

        <div className="flex-1 min-h-0 border rounded overflow-hidden">
          <Editor
            language={language}
            value={userCode}
            onChange={setUserCode}
            onMount={handleEditorMount}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              automaticLayout: true, // ✅ fixes ResizeObserver error
            }}
          />
        </div>

        <div className="flex gap-4 mt-4">
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="bg-yellow-500 text-white py-2 px-5 rounded"
          >
            {isRunning ? "Running..." : "Run Code"}
          </button>

          <button
            onClick={handleSubmit}
            disabled={isRunning}
            className="bg-indigo-600 text-white py-2 px-5 rounded"
          >
            Submit
          </button>
        </div>

        {output && (
          <pre
            className={`mt-6 p-4 rounded border text-sm whitespace-pre-wrap overflow-y-auto ${
              success === true
                ? "bg-green-100 border-green-400"
                : success === false
                ? "bg-red-100 border-red-400"
                : "bg-gray-100"
            }`}
            style={{ maxHeight: "220px" }}
          >
            {output}
          </pre>
        )}
      </div>
    </div>
  );
}
