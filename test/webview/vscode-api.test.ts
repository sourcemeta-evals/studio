import * as assert from 'node:assert/strict';
import { describe, it, beforeEach } from 'node:test';

// Mock the VSCode API before importing the module under test
interface MockVSCodeApi {
  postMessage: (message: unknown) => void;
  getState: () => unknown;
  setState: (state: unknown) => void;
}

let mockApi: MockVSCodeApi;
let postedMessages: unknown[];
let storedState: unknown;

// Set up the global mock before each test
beforeEach(() => {
  postedMessages = [];
  storedState = undefined;
  mockApi = {
    postMessage: (message: unknown) => { postedMessages.push(message); },
    getState: () => storedState,
    setState: (state: unknown) => { storedState = state; }
  };

  (globalThis as unknown as { window: { acquireVsCodeApi: () => MockVSCodeApi } }).window = {
    acquireVsCodeApi: () => mockApi
  };
});

// We need to freshly load the module for each test since VSCodeAPIWrapper
// calls acquireVsCodeApi() at construction time. Use dynamic import with
// cache busting.
async function loadVSCodeApi() {
  // Clear module cache by using a unique query parameter
  const timestamp = Date.now() + Math.random();
  const module = await import(`../../webview/src/vscode-api.ts?t=${timestamp}`);
  return module.vscode;
}

describe('VSCodeAPIWrapper', () => {

  describe('openExternal', () => {
    it('should post an openExternal message with the given URL', async () => {
      const vscode = await loadVSCodeApi();
      vscode.openExternal('https://example.com');
      assert.equal(postedMessages.length, 1);
      assert.deepEqual(postedMessages[0], {
        command: 'openExternal',
        url: 'https://example.com'
      });
    });

    it('should handle different URLs', async () => {
      const vscode = await loadVSCodeApi();
      vscode.openExternal('https://github.com/sourcemeta/studio');
      vscode.openExternal('https://www.sourcemeta.com/');
      assert.equal(postedMessages.length, 2);
      assert.deepEqual(postedMessages[0], {
        command: 'openExternal',
        url: 'https://github.com/sourcemeta/studio'
      });
      assert.deepEqual(postedMessages[1], {
        command: 'openExternal',
        url: 'https://www.sourcemeta.com/'
      });
    });
  });

  describe('formatSchema', () => {
    it('should post a formatSchema message', async () => {
      const vscode = await loadVSCodeApi();
      vscode.formatSchema();
      assert.equal(postedMessages.length, 1);
      assert.deepEqual(postedMessages[0], { command: 'formatSchema' });
    });
  });

  describe('goToPosition', () => {
    it('should post a goToPosition message with the given position', async () => {
      const vscode = await loadVSCodeApi();
      const position: [number, number, number, number] = [10, 5, 10, 20];
      vscode.goToPosition(position);
      assert.equal(postedMessages.length, 1);
      assert.deepEqual(postedMessages[0], {
        command: 'goToPosition',
        position: [10, 5, 10, 20]
      });
    });

    it('should handle different positions', async () => {
      const vscode = await loadVSCodeApi();
      vscode.goToPosition([1, 1, 1, 1]);
      vscode.goToPosition([100, 50, 200, 75]);
      assert.equal(postedMessages.length, 2);
      assert.deepEqual(postedMessages[0], {
        command: 'goToPosition',
        position: [1, 1, 1, 1]
      });
      assert.deepEqual(postedMessages[1], {
        command: 'goToPosition',
        position: [100, 50, 200, 75]
      });
    });
  });

  describe('getActiveTab', () => {
    it('should return undefined when no state is saved', async () => {
      storedState = undefined;
      const vscode = await loadVSCodeApi();
      assert.equal(vscode.getActiveTab(), undefined);
    });

    it('should return undefined when state has no activeTab', async () => {
      storedState = {};
      const vscode = await loadVSCodeApi();
      assert.equal(vscode.getActiveTab(), undefined);
    });

    it('should return the saved active tab', async () => {
      storedState = { activeTab: 'lint' };
      const vscode = await loadVSCodeApi();
      assert.equal(vscode.getActiveTab(), 'lint');
    });

    it('should return format tab when saved', async () => {
      storedState = { activeTab: 'format' };
      const vscode = await loadVSCodeApi();
      assert.equal(vscode.getActiveTab(), 'format');
    });

    it('should return metaschema tab when saved', async () => {
      storedState = { activeTab: 'metaschema' };
      const vscode = await loadVSCodeApi();
      assert.equal(vscode.getActiveTab(), 'metaschema');
    });
  });

  describe('setActiveTab', () => {
    it('should save the active tab to state', async () => {
      const vscode = await loadVSCodeApi();
      vscode.setActiveTab('lint');
      assert.deepEqual(storedState, { activeTab: 'lint' });
    });

    it('should overwrite previous state', async () => {
      const vscode = await loadVSCodeApi();
      vscode.setActiveTab('lint');
      vscode.setActiveTab('format');
      assert.deepEqual(storedState, { activeTab: 'format' });
    });

    it('should save metaschema tab', async () => {
      const vscode = await loadVSCodeApi();
      vscode.setActiveTab('metaschema');
      assert.deepEqual(storedState, { activeTab: 'metaschema' });
    });
  });

  describe('integration', () => {
    it('should round-trip active tab through set and get', async () => {
      const vscode = await loadVSCodeApi();
      vscode.setActiveTab('format');
      assert.equal(vscode.getActiveTab(), 'format');
    });

    it('should not produce messages when getting/setting state', async () => {
      const vscode = await loadVSCodeApi();
      vscode.setActiveTab('lint');
      vscode.getActiveTab();
      assert.equal(postedMessages.length, 0);
    });

    it('should not modify state when posting messages', async () => {
      storedState = { activeTab: 'lint' };
      const vscode = await loadVSCodeApi();
      vscode.openExternal('https://example.com');
      vscode.formatSchema();
      vscode.goToPosition([1, 2, 3, 4]);
      assert.deepEqual(storedState, { activeTab: 'lint' });
    });
  });
});
