const { execSync } = require("child_process");
const fs = require("fs");

const code = process.env.CODE || "";
const input = process.env.INPUT || "";
const language = process.env.LANG || "python";

const runners = {
  python: "./runners/python_runner.sh",
  cpp: "./runners/cpp_runner.sh",
  java: "./runners/java_runner.sh",
};

try {
  const runner = runners[language];
  if (!runner) throw new Error("Unsupported language");

  const output = execSync(`${runner} "${code}" "${input}"`, {
    timeout: 5000,
    encoding: "utf-8",
  });

  console.log(output);
} catch (error) {
  console.error("Runtime Error:", error.message);
}
