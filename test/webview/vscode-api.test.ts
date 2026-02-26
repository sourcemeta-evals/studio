import * as assert from 'assert';

// Mock the VS Code API
interface MockVSCodeApi {
  postMessage(message: unknown): void;
  getState(): unknown;
  setState(state: unknown): void;
}

function createMockVSCodeApi(): MockVSCodeApi & { messages: unknown[]; state: unknown } {
  const mock = {
    messages: [] as unknown[],
    state: undefined as unknown,
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

suite('VSCodeAPIWrapper', () => {
  let mockApi: ReturnType<typeof createMockVSCodeApi>;

  setup(() => {
    mockApi = createMockVSCodeApi();
    (global as unknown as { window: { acquireVsCodeApi: () => MockVSCodeApi } }).window = {
      acquireVsCodeApi: () => mockApi
    };
  });

  teardown(() => {
    // Clean up cached module so each test gets a fresh instance
    // Use a pattern that matches the module but not the test file
    for (const key of Object.keys(require.cache)) {
      if (key.includes('vscode-api') && !key.includes('.test.')) {
        delete require.cache[key];
      }
    }
  });

  test('openExternal sends correct message', () => {
    const { vscode } = require('../../webview/src/vscode-api');
    vscode.openExternal('https://example.com');
    assert.strictEqual(mockApi.messages.length, 1);
    assert.deepStrictEqual(mockApi.messages[0], {
      command: 'openExternal',
      url: 'https://example.com'
    });
  });

  test('formatSchema sends correct message', () => {
    const { vscode } = require('../../webview/src/vscode-api');
    vscode.formatSchema();
    assert.strictEqual(mockApi.messages.length, 1);
    assert.deepStrictEqual(mockApi.messages[0], {
      command: 'formatSchema'
    });
  });

  test('goToPosition sends correct message', () => {
    const { vscode } = require('../../webview/src/vscode-api');
    const position: [number, number, number, number] = [1, 2, 3, 4];
    vscode.goToPosition(position);
    assert.strictEqual(mockApi.messages.length, 1);
    assert.deepStrictEqual(mockApi.messages[0], {
      command: 'goToPosition',
      position: [1, 2, 3, 4]
    });
  });

  test('getActiveTab returns undefined when no state', () => {
    mockApi.state = undefined;
    const { vscode } = require('../../webview/src/vscode-api');
    assert.strictEqual(vscode.getActiveTab(), undefined);
  });

  test('getActiveTab returns saved tab', () => {
    mockApi.state = { activeTab: 'format' };
    const { vscode } = require('../../webview/src/vscode-api');
    assert.strictEqual(vscode.getActiveTab(), 'format');
  });

  test('setActiveTab persists tab state', () => {
    const { vscode } = require('../../webview/src/vscode-api');
    vscode.setActiveTab('metaschema');
    assert.deepStrictEqual(mockApi.state, { activeTab: 'metaschema' });
  });

  test('setActiveTab then getActiveTab round-trips correctly', () => {
    const { vscode } = require('../../webview/src/vscode-api');
    vscode.setActiveTab('lint');
    assert.strictEqual(vscode.getActiveTab(), 'lint');
    vscode.setActiveTab('format');
    assert.strictEqual(vscode.getActiveTab(), 'format');
    vscode.setActiveTab('metaschema');
    assert.strictEqual(vscode.getActiveTab(), 'metaschema');
  });

  test('openExternal does not affect state', () => {
    const { vscode } = require('../../webview/src/vscode-api');
    vscode.setActiveTab('lint');
    vscode.openExternal('https://example.com');
    assert.deepStrictEqual(mockApi.state, { activeTab: 'lint' });
  });

  test('multiple messages accumulate correctly', () => {
    const { vscode } = require('../../webview/src/vscode-api');
    vscode.openExternal('https://a.com');
    vscode.formatSchema();
    vscode.goToPosition([10, 20, 30, 40]);
    assert.strictEqual(mockApi.messages.length, 3);
    assert.deepStrictEqual(mockApi.messages[0], { command: 'openExternal', url: 'https://a.com' });
    assert.deepStrictEqual(mockApi.messages[1], { command: 'formatSchema' });
    assert.deepStrictEqual(mockApi.messages[2], { command: 'goToPosition', position: [10, 20, 30, 40] });
  });
});
