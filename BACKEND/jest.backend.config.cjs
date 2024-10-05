module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'], // Updated pattern to match the new test file name
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.mjs$': 'babel-jest' // Add this line to handle .mjs files
  },
  transformIgnorePatterns: ['/node_modules/']
};