const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');
const express = require('express');
const router = express.Router();
const Problem = require('../models/problem');

router.post("/", async (req, res) => {
  console.log("Received /api/run POST request");
  const { code, language, problemId } = req.body;
  console.log("Request body:", { language, problemId });

  try {
    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ output: "Problem not found" });
    console.log("Problem found:", problem.title);

    // Get all visible test cases
    const visibleTestCases = problem.testCases.filter(tc => !tc.isHidden);
    if (visibleTestCases.length === 0) return res.status(400).json({ output: "No visible test cases found" });
    console.log(`Found ${visibleTestCases.length} visible test case(s)`);

    const tempDir = path.join(__dirname, '..', 'temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const extMap = { java: 'java', python: 'py', cpp: 'cpp', c: 'c' };
    const fileExtension = extMap[language] || 'txt';
    const fileName = `Main.${fileExtension}`;
    const filePath = path.join(tempDir, fileName);

    fs.writeFileSync(filePath, code);

    // Run a single test case for Java with spawn
    function runJavaTestCase(testCase) {
      return new Promise((resolve) => {
        console.log(`Running Java test case with input:\n${testCase.input}`);

        const inputFilePath = path.join(tempDir, 'input.txt');
        fs.writeFileSync(inputFilePath, testCase.input.trim() + '\n');

        // Compile first
        exec(`javac Main.java`, { cwd: tempDir, timeout: 10000 }, (compileErr, compileStdout, compileStderr) => {
          if (compileErr) {
            console.log("Compilation error:", compileStderr);
            resolve({
              input: testCase.input,
              expected: testCase.expectedOutput,
              output: "",
              passed: false,
              error: "Compilation error:\n" + compileStderr,
            });
            return;
          }
          console.log("Compilation successful");

          const javaProcess = spawn('java', ['Main'], { cwd: tempDir });

          let stdout = "";
          let stderr = "";

          // Timeout safeguard to kill the process after 10 seconds
          const timeoutId = setTimeout(() => {
            javaProcess.kill('SIGKILL');
            console.log("Java process killed due to timeout");
            resolve({
              input: testCase.input,
              expected: testCase.expectedOutput,
              output: "",
              passed: false,
              error: "Execution timeout",
            });
          }, 10000);

          // Pipe input.txt to the process stdin
          const inputStream = fs.createReadStream(inputFilePath);
          inputStream.pipe(javaProcess.stdin);

          javaProcess.stdout.on('data', (data) => {
            stdout += data.toString();
          });

          javaProcess.stderr.on('data', (data) => {
            stderr += data.toString();
          });

          javaProcess.on('close', (code) => {
            clearTimeout(timeoutId);
            console.log(`Java process exited with code ${code}`);
            const output = stdout.trim();
            const expected = testCase.expectedOutput.trim();
            const passed = code === 0 && output === expected;

            try {
              const classFile = path.join(tempDir, 'Main.class');
              if (fs.existsSync(classFile)) fs.unlinkSync(classFile);
            } catch (e) {}

            resolve({
              input: testCase.input,
              expected,
              output,
              passed,
              error: passed ? null : (stderr || "Runtime error or output mismatch"),
            });
          });

          javaProcess.on('error', (err) => {
            clearTimeout(timeoutId);
            console.log("Failed to start java process:", err);
            resolve({
              input: testCase.input,
              expected: testCase.expectedOutput,
              output: "",
              passed: false,
              error: "Failed to start java process: " + err.message,
            });
          });
        });
      });
    }

    // Function to run test cases for python, cpp, c using exec and docker
    function runOtherLanguageTestCase(testCase) {
      return new Promise((resolve) => {
        const inputFilePath = path.join(tempDir, 'input.txt');
        fs.writeFileSync(inputFilePath, testCase.input.trim() + '\n');

        let command;

        if (language === 'python') {
          command = `docker run --rm -v "${tempDir.replace(/\\/g, '/') }:/code" -w /code python:3.11 sh -c "python3 Main.py < input.txt"`;
        } else if (language === 'cpp' || language === 'c') {
          command = `docker run --rm -v "${tempDir.replace(/\\/g, '/') }:/code" -w /code gcc:latest sh -c "g++ Main.${fileExtension} -o Main && ./Main < input.txt"`;
        } else {
          resolve({
            input: testCase.input,
            expected: testCase.expectedOutput,
            output: "",
            passed: false,
            error: "Unsupported language",
          });
          return;
        }

        exec(command, { timeout: 60000 }, (err, stdout, stderr) => {
          const output = stdout ? stdout.trim() : "";
          const expected = testCase.expectedOutput.trim();
          const passed = !err && (output === expected);

          resolve({
            input: testCase.input,
            expected,
            output,
            passed,
            error: err ? stderr || err.message : null,
          });
        });
      });
    }

    // Run all visible test cases sequentially, stop on first fail
    const results = [];
    for (const tc of visibleTestCases) {
      let result;
      if (language === 'java') {
        result = await runJavaTestCase(tc);
      } else {
        result = await runOtherLanguageTestCase(tc);
      }
      results.push(result);
      if (!result.passed) break;
    }

    // Cleanup
    try { fs.unlinkSync(filePath); } catch {}
    try { fs.unlinkSync(path.join(tempDir, 'input.txt')); } catch {}

    const allPassed = results.every(r => r.passed);

    // THIS IS THE CRITICAL RESPONSE TO SEND BACK
    return res.json({
      success: allPassed,
      results,
      message: allPassed
        ? "✅ All visible test cases passed! You can proceed to submission."
        : "❌ Some visible test cases failed. Fix your code and try again.",
    });

  } catch (error) {
    console.log("Server error caught:", error);
    res.status(500).json({ output: "Server error", error: error.message });
  }
});

module.exports = router;
