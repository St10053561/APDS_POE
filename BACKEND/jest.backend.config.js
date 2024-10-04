module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*Regtest.js'],
    transform: {
        '^.+\\.jsx?$': 'babel-jest'
    },
    transformIgnorePatterns: ['/node_modules/']
};