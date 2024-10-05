module.exports = {
  // Use babel-jest to transform JavaScript files using Babel
  transform: {
    "^.+\\.mjs$": "babel-jest",  // This handles .mjs files
    "^.+\\.js$": "babel-jest"    // This handles .js files
  },
  moduleFileExtensions: ["js", "mjs"],
  transformIgnorePatterns: [
    "/node_modules/" // Ignore node_modules
  ],
  testEnvironment: "node",  // Since you're testing a Node.js backend
};