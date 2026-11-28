// Jest es el framework idiomático de NestJS (capítulo 8, Guideline 8b).
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testRegex: '.*\\.spec\\.ts$',
  collectCoverageFrom: ['src/**/*.ts', '!src/main.ts', '!src/migraciones/**', '!src/**/*.entity.ts'],
  coverageDirectory: 'coverage',
};
