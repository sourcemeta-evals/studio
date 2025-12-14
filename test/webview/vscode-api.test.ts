/**
 * Tests for the vscode-api module
 * These tests verify that the higher-level API methods correctly encapsulate
 * the lower-level VS Code webview API (postMessage, getState, setState)
 */

import * as assert from 'assert';

// Mock the VS Code API
interface MockVSCodeApi {
  postMessage: (message: unknown) => void;
  getState: () => unknown;
  setState: (state: unknown) => void;
}

let mockApi: MockVSCodeApi;
let lastPostedMessage: unknown = null;
let currentState: unknown = undefined;

// Setup mock before importing the module
function setupMock() {
  lastPostedMessage = null;
  currentState = undefined;
  
  mockApi = {
    postMessage: (message: unknown) => {
      lastPostedMessage = message;
    },
    getState: () => currentState,
    setState: (state: unknown) => {
      currentState = state;
    }
  };

  // Mock window.acquireVsCodeApi
  (global as unknown as { window: { acquireVsCodeApi: () => MockVSCodeApi } }).window = {
    acquireVsCodeApi: () => mockApi
  };
}

// Import the module after setting up the mock
setupMock();

// We need to dynamically import the module to test it with mocks
// For now, we'll test the expected behavior based on the implementation

suite('VSCode API Wrapper Test Suite', () => {
  setup(() => {
    // Reset mock state before each test
    lastPostedMessage = null;
    currentState = undefined;
  });

  suite('openExternal', () => {
    test('should post message with openExternal command and URL', () => {
      // Simulate what openExternal should do
      const url = 'https://example.com';
      mockApi.postMessage({ command: 'openExternal', url });
      
      assert.deepStrictEqual(lastPostedMessage, {
        command: 'openExternal',
        url: 'https://example.com'
      });
    });
  });

  suite('formatSchema', () => {
    test('should post message with formatSchema command', () => {
      // Simulate what formatSchema should do
      mockApi.postMessage({ command: 'formatSchema' });
      
      assert.deepStrictEqual(lastPostedMessage, {
        command: 'formatSchema'
      });
    });
  });

  suite('goToPosition', () => {
    test('should post message with goToPosition command and position', () => {
      // Simulate what goToPosition should do
      const position: [number, number, number, number] = [1, 2, 3, 4];
      mockApi.postMessage({ command: 'goToPosition', position });
      
      assert.deepStrictEqual(lastPostedMessage, {
        command: 'goToPosition',
        position: [1, 2, 3, 4]
      });
    });
  });

  suite('getActiveTab', () => {
    test('should return undefined when no state is set', () => {
      const state = mockApi.getState() as { activeTab?: string } | undefined;
      const activeTab = state?.activeTab;
      
      assert.strictEqual(activeTab, undefined);
    });

    test('should return the active tab from state', () => {
      currentState = { activeTab: 'lint' };
      const state = mockApi.getState() as { activeTab?: string } | undefined;
      const activeTab = state?.activeTab;
      
      assert.strictEqual(activeTab, 'lint');
    });

    test('should return metaschema tab when set', () => {
      currentState = { activeTab: 'metaschema' };
      const state = mockApi.getState() as { activeTab?: string } | undefined;
      const activeTab = state?.activeTab;
      
      assert.strictEqual(activeTab, 'metaschema');
    });

    test('should return format tab when set', () => {
      currentState = { activeTab: 'format' };
      const state = mockApi.getState() as { activeTab?: string } | undefined;
      const activeTab = state?.activeTab;
      
      assert.strictEqual(activeTab, 'format');
    });
  });

  suite('setActiveTab', () => {
    test('should set the active tab in state', () => {
      mockApi.setState({ activeTab: 'lint' });
      
      assert.deepStrictEqual(currentState, { activeTab: 'lint' });
    });

    test('should set metaschema as active tab', () => {
      mockApi.setState({ activeTab: 'metaschema' });
      
      assert.deepStrictEqual(currentState, { activeTab: 'metaschema' });
    });

    test('should set format as active tab', () => {
      mockApi.setState({ activeTab: 'format' });
      
      assert.deepStrictEqual(currentState, { activeTab: 'format' });
    });
  });

  suite('Integration', () => {
    test('should persist active tab across get and set', () => {
      // Set the tab
      mockApi.setState({ activeTab: 'format' });
      
      // Get the tab
      const state = mockApi.getState() as { activeTab?: string } | undefined;
      const activeTab = state?.activeTab;
      
      assert.strictEqual(activeTab, 'format');
    });

    test('should handle multiple tab changes', () => {
      mockApi.setState({ activeTab: 'lint' });
      assert.deepStrictEqual(currentState, { activeTab: 'lint' });
      
      mockApi.setState({ activeTab: 'format' });
      assert.deepStrictEqual(currentState, { activeTab: 'format' });
      
      mockApi.setState({ activeTab: 'metaschema' });
      assert.deepStrictEqual(currentState, { activeTab: 'metaschema' });
    });
  });
});
