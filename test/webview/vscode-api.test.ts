import * as assert from 'assert';

/**
 * Tests for the VSCodeAPIWrapper class in webview/src/vscode-api.ts
 *
 * Since the module depends on `window.acquireVsCodeApi`, we replicate
 * the wrapper logic here against a mock so the tests can run in plain
 * Node without a browser environment.
 */

// ---------------------------------------------------------------------------
// Mock helpers
// ---------------------------------------------------------------------------

interface MockVSCodeApi {
  postMessage(message: unknown): void;
  getState(): unknown;
  setState(state: unknown): void;
}

function createMockVSCodeApi(): MockVSCodeApi & {
  messages: unknown[];
  currentState: unknown;
} {
  const mock = {
    messages: [] as unknown[],
    currentState: undefined as unknown,
    postMessage(message: unknown): void {
      mock.messages.push(message);
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

// ---------------------------------------------------------------------------
// Minimal replica of VSCodeAPIWrapper (mirrors webview/src/vscode-api.ts)
// ---------------------------------------------------------------------------

type TabName = 'lint' | 'format' | 'metaschema';

class VSCodeAPIWrapper {
  private readonly vsCodeApi: MockVSCodeApi;

  constructor(vsCodeApi: MockVSCodeApi) {
    this.vsCodeApi = vsCodeApi;
  }

  public openExternal(url: string): void {
    this.vsCodeApi.postMessage({ command: 'openExternal', url });
  }

  public formatSchema(): void {
    this.vsCodeApi.postMessage({ command: 'formatSchema' });
  }

  public goToPosition(position: [number, number, number, number]): void {
    this.vsCodeApi.postMessage({ command: 'goToPosition', position });
  }

  public getActiveTab(): TabName | undefined {
    const state = this.vsCodeApi.getState() as { activeTab?: TabName } | undefined;
    return state?.activeTab;
  }

  public setActiveTab(tab: TabName): void {
    this.vsCodeApi.setState({ activeTab: tab });
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void): void {
  try {
    fn();
    passed++;
    console.log(`  PASS: ${name}`);
  } catch (err) {
    failed++;
    console.error(`  FAIL: ${name}`);
    console.error(`    ${err instanceof Error ? err.message : err}`);
  }
}

console.log('VSCodeAPIWrapper tests');
console.log('======================');

// ---- openExternal --------------------------------------------------------

test('openExternal sends correct message', () => {
  const mock = createMockVSCodeApi();
  const wrapper = new VSCodeAPIWrapper(mock);
  wrapper.openExternal('https://example.com');
  assert.strictEqual(mock.messages.length, 1);
  assert.deepStrictEqual(mock.messages[0], {
    command: 'openExternal',
    url: 'https://example.com',
  });
});

test('openExternal sends multiple messages', () => {
  const mock = createMockVSCodeApi();
  const wrapper = new VSCodeAPIWrapper(mock);
  wrapper.openExternal('https://a.com');
  wrapper.openExternal('https://b.com');
  assert.strictEqual(mock.messages.length, 2);
  assert.deepStrictEqual(mock.messages[1], {
    command: 'openExternal',
    url: 'https://b.com',
  });
});

// ---- formatSchema --------------------------------------------------------

test('formatSchema sends correct message', () => {
  const mock = createMockVSCodeApi();
  const wrapper = new VSCodeAPIWrapper(mock);
  wrapper.formatSchema();
  assert.strictEqual(mock.messages.length, 1);
  assert.deepStrictEqual(mock.messages[0], { command: 'formatSchema' });
});

// ---- goToPosition --------------------------------------------------------

test('goToPosition sends correct message', () => {
  const mock = createMockVSCodeApi();
  const wrapper = new VSCodeAPIWrapper(mock);
  const pos: [number, number, number, number] = [10, 5, 10, 20];
  wrapper.goToPosition(pos);
  assert.strictEqual(mock.messages.length, 1);
  assert.deepStrictEqual(mock.messages[0], {
    command: 'goToPosition',
    position: [10, 5, 10, 20],
  });
});

test('goToPosition preserves exact position values', () => {
  const mock = createMockVSCodeApi();
  const wrapper = new VSCodeAPIWrapper(mock);
  const pos: [number, number, number, number] = [1, 1, 100, 200];
  wrapper.goToPosition(pos);
  const sent = mock.messages[0] as { position: number[] };
  assert.deepStrictEqual(sent.position, [1, 1, 100, 200]);
});

// ---- getActiveTab --------------------------------------------------------

test('getActiveTab returns undefined when no state', () => {
  const mock = createMockVSCodeApi();
  const wrapper = new VSCodeAPIWrapper(mock);
  assert.strictEqual(wrapper.getActiveTab(), undefined);
});

test('getActiveTab returns undefined when state has no activeTab', () => {
  const mock = createMockVSCodeApi();
  mock.currentState = {};
  const wrapper = new VSCodeAPIWrapper(mock);
  assert.strictEqual(wrapper.getActiveTab(), undefined);
});

test('getActiveTab returns saved tab name', () => {
  const mock = createMockVSCodeApi();
  mock.currentState = { activeTab: 'format' };
  const wrapper = new VSCodeAPIWrapper(mock);
  assert.strictEqual(wrapper.getActiveTab(), 'format');
});

// ---- setActiveTab --------------------------------------------------------

test('setActiveTab persists tab via setState', () => {
  const mock = createMockVSCodeApi();
  const wrapper = new VSCodeAPIWrapper(mock);
  wrapper.setActiveTab('metaschema');
  assert.deepStrictEqual(mock.currentState, { activeTab: 'metaschema' });
});

test('setActiveTab then getActiveTab round-trips', () => {
  const mock = createMockVSCodeApi();
  const wrapper = new VSCodeAPIWrapper(mock);
  wrapper.setActiveTab('lint');
  assert.strictEqual(wrapper.getActiveTab(), 'lint');
  wrapper.setActiveTab('format');
  assert.strictEqual(wrapper.getActiveTab(), 'format');
  wrapper.setActiveTab('metaschema');
  assert.strictEqual(wrapper.getActiveTab(), 'metaschema');
});

// ---- mixed operations ----------------------------------------------------

test('messages and state are independent', () => {
  const mock = createMockVSCodeApi();
  const wrapper = new VSCodeAPIWrapper(mock);
  wrapper.openExternal('https://example.com');
  wrapper.setActiveTab('lint');
  wrapper.formatSchema();
  assert.strictEqual(mock.messages.length, 2);
  assert.strictEqual(wrapper.getActiveTab(), 'lint');
});

// ---- no raw postMessage / getState / setState exposed --------------------

test('wrapper does not expose postMessage', () => {
  const wrapper = new VSCodeAPIWrapper(createMockVSCodeApi());
  assert.strictEqual('postMessage' in wrapper, false);
});

test('wrapper does not expose getState', () => {
  const wrapper = new VSCodeAPIWrapper(createMockVSCodeApi());
  assert.strictEqual('getState' in wrapper, false);
});

test('wrapper does not expose setState', () => {
  const wrapper = new VSCodeAPIWrapper(createMockVSCodeApi());
  assert.strictEqual('setState' in wrapper, false);
});

// ---- summary -------------------------------------------------------------

console.log();
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
}
