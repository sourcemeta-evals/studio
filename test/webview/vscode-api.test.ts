import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

interface MockVSCodeApi {
  postMessage(message: unknown): void;
  getState(): unknown;
  setState(state: unknown): void;
}

let mockApi: MockVSCodeApi;
let postMessageCalls: unknown[];
let setStateCalls: unknown[];
let getStateReturn: unknown;

beforeEach(() => {
  postMessageCalls = [];
  setStateCalls = [];
  getStateReturn = undefined;

  mockApi = {
    postMessage(message: unknown) {
      postMessageCalls.push(message);
    },
    getState() {
      return getStateReturn;
    },
    setState(state: unknown) {
      setStateCalls.push(state);
    }
  };

  (globalThis as unknown as { window: unknown }).window = {
    acquireVsCodeApi: () => mockApi,
    addEventListener: () => {},
    removeEventListener: () => {}
  };
});

async function loadVSCodeAPI() {
  const uniqueQuery = `?t=${Date.now()}-${Math.random()}`;
  const mod = await import(`../../webview/src/vscode-api.ts${uniqueQuery}`);
  return mod.vscode;
}

describe('VSCodeAPIWrapper', () => {
  describe('openExternal', () => {
    it('should post an openExternal message with the given URL', async () => {
      const vscode = await loadVSCodeAPI();
      vscode.openExternal('https://example.com');
      assert.equal(postMessageCalls.length, 1);
      assert.deepEqual(postMessageCalls[0], {
        command: 'openExternal',
        url: 'https://example.com'
      });
    });

    it('should handle different URLs', async () => {
      const vscode = await loadVSCodeAPI();
      vscode.openExternal('https://github.com/sourcemeta/studio');
      vscode.openExternal('https://www.sourcemeta.com/');
      assert.equal(postMessageCalls.length, 2);
      assert.deepEqual(postMessageCalls[0], {
        command: 'openExternal',
        url: 'https://github.com/sourcemeta/studio'
      });
      assert.deepEqual(postMessageCalls[1], {
        command: 'openExternal',
        url: 'https://www.sourcemeta.com/'
      });
    });
  });

  describe('formatSchema', () => {
    it('should post a formatSchema message', async () => {
      const vscode = await loadVSCodeAPI();
      vscode.formatSchema();
      assert.equal(postMessageCalls.length, 1);
      assert.deepEqual(postMessageCalls[0], { command: 'formatSchema' });
    });
  });

  describe('goToPosition', () => {
    it('should post a goToPosition message with the given position', async () => {
      const vscode = await loadVSCodeAPI();
      const position: [number, number, number, number] = [10, 5, 10, 20];
      vscode.goToPosition(position);
      assert.equal(postMessageCalls.length, 1);
      assert.deepEqual(postMessageCalls[0], {
        command: 'goToPosition',
        position: [10, 5, 10, 20]
      });
    });
  });

  describe('getActiveTab', () => {
    it('should return undefined when no state is saved', async () => {
      getStateReturn = undefined;
      const vscode = await loadVSCodeAPI();
      assert.equal(vscode.getActiveTab(), undefined);
    });

    it('should return undefined when state has no activeTab', async () => {
      getStateReturn = {};
      const vscode = await loadVSCodeAPI();
      assert.equal(vscode.getActiveTab(), undefined);
    });

    it('should return the saved active tab', async () => {
      getStateReturn = { activeTab: 'format' };
      const vscode = await loadVSCodeAPI();
      assert.equal(vscode.getActiveTab(), 'format');
    });
  });

  describe('setActiveTab', () => {
    it('should save the active tab to vscode state', async () => {
      const vscode = await loadVSCodeAPI();
      vscode.setActiveTab('lint');
      assert.equal(setStateCalls.length, 1);
      assert.deepEqual(setStateCalls[0], { activeTab: 'lint' });
    });

    it('should handle metaschema tab', async () => {
      const vscode = await loadVSCodeAPI();
      vscode.setActiveTab('metaschema');
      assert.equal(setStateCalls.length, 1);
      assert.deepEqual(setStateCalls[0], { activeTab: 'metaschema' });
    });
  });
});
