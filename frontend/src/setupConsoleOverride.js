// src/setupConsoleOverride.js

const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    args.length > 0 &&
    typeof args[0] === "string" &&
    args[0].includes("ResizeObserver loop completed with undelivered notifications")
  ) {
    return; // Ignore this specific warning
  }
  originalConsoleError(...args);
};
