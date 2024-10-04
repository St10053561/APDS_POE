module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*Regtest.js'],
    transform: {
      '^.+\\.jsx?$': 'babel-jest',
      '^.+\\.mjs$': 'babel-jest' // Add this line to handle .mjs files
    },
    transformIgnorePatterns: ['/node_modules/']
  };