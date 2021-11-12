require('nock').disableNetConnect()

module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.spec.js'],
  testRunner: 'jest-circus/runner',
  verbose: true
}
