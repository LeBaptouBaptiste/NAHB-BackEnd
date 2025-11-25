/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.test.ts'],
    moduleFileExtensions: ['ts', 'js', 'json'],
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/index.ts',
        '!src/config/**',
    ],
    coverageDirectory: 'coverage',
    setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
    testTimeout: 30000,
};

