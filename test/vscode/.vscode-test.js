const { defineConfig } = require('@vscode/test-cli');
const path = require('path');

// Build directory for compiled test files
// This is where the TypeScript compiler outputs the test files
// after they have been transpiled from TypeScript to JavaScript
const buildTestDir = path.resolve(__dirname, '../../build/test/vscode');

// VS Code test configuration
// This configuration is used by the @vscode/test-cli package
// to run the extension tests in a VS Code instance
module.exports = defineConfig({
  // Path to the compiled test files
  // Updated to match the new build output structure
  files: '../../build/test/vscode/test/vscode/**/*.test.js',
  // Path to the extension being tested
  extensionDevelopmentPath: '../../vscode',
  // Cache directory for VS Code test instance
  cachePath: path.join(buildTestDir, '.vscode-test'),
  // Arguments to pass to VS Code when launching
  launchArgs: [
    '--user-data-dir', path.join(buildTestDir, '.vscode-test/user-data'),
    '--extensions-dir', path.join(buildTestDir, '.vscode-test/extensions'),
    // Add --disable-extensions to avoid interference from other extensions
    '--disable-extensions'
  ],
  mocha: {
    ui: 'tdd',
    timeout: 20000,
    color: true
  }
});
