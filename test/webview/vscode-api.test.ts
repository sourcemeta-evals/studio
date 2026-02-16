import * as assert from 'assert';

interface MockVSCodeApi {
  postMessage(message: unknown): void;
  getState(): unknown;
  setState(state: unknown): void;
}

interface PostedMessage {
  command: string;
  [key: string]: unknown;
}

function createMockVSCodeApi(): MockVSCodeApi & {
  messages: PostedMessage[];
  currentState: unknown;
} {
  const mock = {
    messages: [] as PostedMessage[],
    currentState: undefined as unknown,
    postMessage(message: unknown): void {
      mock.messages.push(message as PostedMessage);
    },
    getState(): unknown {
      return mock.currentState;
    },
    setState(state: unknown): void {
      mock.currentState = state;
    },
  };
  return mock;
}

suite('VSCodeAPIWrapper', () => {
  let mockApi: ReturnType<typeof createMockVSCodeApi>;

  setup(() => {
    mockApi = createMockVSCodeApi();
    (globalThis as Record<string, unknown>)['window'] = {
      acquireVsCodeApi: () => mockApi,
    };
  });

  teardown(() => {
    delete (globalThis as Record<string, unknown>)['window'];
  });

  function loadWrapper(): { vscode: {
    openExternal(url: string): void;
    formatSchema(): void;
    goToPosition(position: [number, number, number, number]): void;
    getActiveTab(): string | undefined;
    setActiveTab(tab: string): void;
  }} {
    const modulePath = require.resolve('../../webview-api/vscode-api.js');
    delete require.cache[modulePath];
    return require(modulePath);
  }

  test('openExternal posts openExternal command with url', () => {
    const { vscode } = loadWrapper();
    vscode.openExternal('https://example.com');
    assert.strictEqual(mockApi.messages.length, 1);
    assert.deepStrictEqual(mockApi.messages[0], {
      command: 'openExternal',
      url: 'https://example.com',
    });
  });

  test('formatSchema posts formatSchema command', () => {
    const { vscode } = loadWrapper();
    vscode.formatSchema();
    assert.strictEqual(mockApi.messages.length, 1);
    assert.deepStrictEqual(mockApi.messages[0], {
      command: 'formatSchema',
    });
  });

  test('goToPosition posts goToPosition command with position', () => {
    const { vscode } = loadWrapper();
    const position: [number, number, number, number] = [10, 5, 10, 20];
    vscode.goToPosition(position);
    assert.strictEqual(mockApi.messages.length, 1);
    assert.deepStrictEqual(mockApi.messages[0], {
      command: 'goToPosition',
      position: [10, 5, 10, 20],
    });
  });

  test('getActiveTab returns undefined when no state is set', () => {
    const { vscode } = loadWrapper();
    assert.strictEqual(vscode.getActiveTab(), undefined);
  });

  test('getActiveTab returns the saved active tab', () => {
    mockApi.currentState = { activeTab: 'format' };
    const { vscode } = loadWrapper();
    assert.strictEqual(vscode.getActiveTab(), 'format');
  });

  test('setActiveTab persists the active tab in state', () => {
    const { vscode } = loadWrapper();
    vscode.setActiveTab('metaschema');
    assert.deepStrictEqual(mockApi.currentState, { activeTab: 'metaschema' });
  });

  test('setActiveTab then getActiveTab round-trips correctly', () => {
    const { vscode } = loadWrapper();
    vscode.setActiveTab('lint');
    assert.strictEqual(vscode.getActiveTab(), 'lint');
  });

  test('multiple openExternal calls post separate messages', () => {
    const { vscode } = loadWrapper();
    vscode.openExternal('https://a.com');
    vscode.openExternal('https://b.com');
    assert.strictEqual(mockApi.messages.length, 2);
    assert.deepStrictEqual(mockApi.messages[0], {
      command: 'openExternal',
      url: 'https://a.com',
    });
    assert.deepStrictEqual(mockApi.messages[1], {
      command: 'openExternal',
      url: 'https://b.com',
    });
  });

  test('no messages are posted by state operations', () => {
    const { vscode } = loadWrapper();
    vscode.setActiveTab('format');
    vscode.getActiveTab();
    assert.strictEqual(mockApi.messages.length, 0);
  });
});
