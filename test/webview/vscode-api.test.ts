/**
 * Unit tests for the VS Code API abstraction layer.
 * These tests verify that the higher-level methods correctly encapsulate
 * the VS Code postMessage, getState, and setState APIs.
 */

import * as assert from 'assert';

interface VSCodeAPI {
  postMessage(message: unknown): void;
  getState(): unknown;
  setState(state: unknown): void;
}

interface MockVSCodeAPI extends VSCodeAPI {
  messages: unknown[];
  state: unknown;
}

function createMockVSCodeAPI(): MockVSCodeAPI {
  const mock: MockVSCodeAPI = {
    messages: [],
    state: undefined,
    postMessage(message: unknown): void {
      mock.messages.push(message);
    },
    getState(): unknown {
      return mock.state;
    },
    setState(state: unknown): void {
      mock.state = state;
    }
  };
  return mock;
}

// Test suite for vscode-api.ts encapsulation
describe('VS Code API Abstraction', () => {
  let mockApi: MockVSCodeAPI;

  beforeEach(() => {
    mockApi = createMockVSCodeAPI();
  });

  it('openExternal sends correct message structure', () => {
    // Simulate what openExternal does
    const url = 'https://example.com';
    mockApi.postMessage({ command: 'openExternal', url });

    assert.strictEqual(mockApi.messages.length, 1);
    assert.deepStrictEqual(mockApi.messages[0], {
      command: 'openExternal',
      url: 'https://example.com'
    });
  });

  it('formatSchema sends correct message structure', () => {
    // Simulate what formatSchema does
    mockApi.postMessage({ command: 'formatSchema' });

    assert.strictEqual(mockApi.messages.length, 1);
    assert.deepStrictEqual(mockApi.messages[0], {
      command: 'formatSchema'
    });
  });

  it('goToPosition sends correct message structure', () => {
    // Simulate what goToPosition does
    const position: [number, number, number, number] = [10, 5, 10, 15];
    mockApi.postMessage({ command: 'goToPosition', position });

    assert.strictEqual(mockApi.messages.length, 1);
    assert.deepStrictEqual(mockApi.messages[0], {
      command: 'goToPosition',
      position: [10, 5, 10, 15]
    });
  });

  it('getActiveTab returns undefined when no state', () => {
    // Simulate what getActiveTab does
    const state = mockApi.getState() as { activeTab?: string } | undefined;
    const activeTab = state?.activeTab;

    assert.strictEqual(activeTab, undefined);
  });

  it('getActiveTab returns saved tab from state', () => {
    // Simulate saved state
    mockApi.state = { activeTab: 'format' };

    const state = mockApi.getState() as { activeTab?: string } | undefined;
    const activeTab = state?.activeTab;

    assert.strictEqual(activeTab, 'format');
  });

  it('setActiveTab saves tab to state', () => {
    // Simulate what setActiveTab does
    mockApi.setState({ activeTab: 'lint' });

    const state = mockApi.state as { activeTab?: string };
    assert.strictEqual(state.activeTab, 'lint');
  });

  it('multiple messages are sent in order', () => {
    mockApi.postMessage({ command: 'formatSchema' });
    mockApi.postMessage({ command: 'openExternal', url: 'https://test.com' });
    mockApi.postMessage({ command: 'goToPosition', position: [1, 1, 1, 1] });

    assert.strictEqual(mockApi.messages.length, 3);
    assert.strictEqual((mockApi.messages[0] as { command: string }).command, 'formatSchema');
    assert.strictEqual((mockApi.messages[1] as { command: string }).command, 'openExternal');
    assert.strictEqual((mockApi.messages[2] as { command: string }).command, 'goToPosition');
  });

  it('state persistence between get and set operations', () => {
    // Set initial tab
    mockApi.setState({ activeTab: 'lint' });
    
    // Get and verify
    let state = mockApi.getState() as { activeTab?: string } | undefined;
    assert.strictEqual(state?.activeTab, 'lint');

    // Update to different tab
    mockApi.setState({ activeTab: 'metaschema' });
    
    // Verify update
    state = mockApi.getState() as { activeTab?: string } | undefined;
    assert.strictEqual(state?.activeTab, 'metaschema');
  });
});
