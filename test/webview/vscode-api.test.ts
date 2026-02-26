import * as assert from 'assert';

interface MockMessage {
  command: string;
  url?: string;
  position?: [number, number, number, number];
}

// Track messages and state from the mock
const mockMessages: MockMessage[] = [];
let mockState: unknown = undefined;

// Set up the VS Code API mock on globalThis before the module loads
Object.assign(globalThis, {
  window: {
    acquireVsCodeApi: () => ({
      postMessage: (message: MockMessage) => { mockMessages.push(message); },
      getState: () => mockState,
      setState: (state: unknown) => { mockState = state; }
    })
  }
});

// Load the module after the mock is in place
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { vscode } = require('../../webview/src/vscode-api') as {
  vscode: {
    openExternal(url: string): void;
    formatSchema(): void;
    goToPosition(position: [number, number, number, number]): void;
    getActiveTab(): string | undefined;
    setActiveTab(activeTab: string): void;
  };
};

suite('VSCode API Wrapper', () => {
  setup(() => {
    mockMessages.length = 0;
    mockState = undefined;
  });

  test('openExternal posts an openExternal command with the given URL', () => {
    vscode.openExternal('https://example.com');
    assert.strictEqual(mockMessages.length, 1);
    assert.deepStrictEqual(mockMessages[0], {
      command: 'openExternal',
      url: 'https://example.com'
    });
  });

  test('formatSchema posts a formatSchema command', () => {
    vscode.formatSchema();
    assert.strictEqual(mockMessages.length, 1);
    assert.deepStrictEqual(mockMessages[0], { command: 'formatSchema' });
  });

  test('goToPosition posts a goToPosition command with the position', () => {
    const position: [number, number, number, number] = [10, 5, 20, 15];
    vscode.goToPosition(position);
    assert.strictEqual(mockMessages.length, 1);
    assert.deepStrictEqual(mockMessages[0], {
      command: 'goToPosition',
      position: [10, 5, 20, 15]
    });
  });

  test('getActiveTab returns undefined when state is undefined', () => {
    mockState = undefined;
    const result = vscode.getActiveTab();
    assert.strictEqual(result, undefined);
  });

  test('getActiveTab returns the activeTab from saved state', () => {
    mockState = { activeTab: 'format' };
    const result = vscode.getActiveTab();
    assert.strictEqual(result, 'format');
  });

  test('getActiveTab returns undefined when state has no activeTab', () => {
    mockState = {};
    const result = vscode.getActiveTab();
    assert.strictEqual(result, undefined);
  });

  test('setActiveTab persists the activeTab in state', () => {
    vscode.setActiveTab('metaschema');
    assert.deepStrictEqual(mockState, { activeTab: 'metaschema' });
  });

  test('setActiveTab overwrites the previous activeTab', () => {
    vscode.setActiveTab('lint');
    assert.deepStrictEqual(mockState, { activeTab: 'lint' });
    vscode.setActiveTab('format');
    assert.deepStrictEqual(mockState, { activeTab: 'format' });
  });
});
