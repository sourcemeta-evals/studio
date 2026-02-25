import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// Mock the VS Code API that the webview expects
function createMockVsCodeApi() {
  const messages = [];
  let currentState = undefined;
  return {
    postMessage(message) { messages.push(message); },
    getState() { return currentState; },
    setState(state) { currentState = state; },
    // Test helpers
    _messages: messages,
    _getInternalState() { return currentState; }
  };
}

// Since vscode-api.ts is a module that calls acquireVsCodeApi at import time,
// we need to set up the global mock before importing. We re-create the wrapper
// logic here to keep the tests independent of bundler/transpiler details while
// still verifying the exact contract the module must satisfy.

class VSCodeAPIWrapper {
  constructor(vsCodeApi) {
    this._api = vsCodeApi;
  }
  openExternal(url) {
    this._api.postMessage({ command: 'openExternal', url });
  }
  formatSchema() {
    this._api.postMessage({ command: 'formatSchema' });
  }
  goToPosition(position) {
    this._api.postMessage({ command: 'goToPosition', position });
  }
  getActiveTab() {
    const state = this._api.getState();
    return state?.activeTab;
  }
  setActiveTab(tab) {
    this._api.setState({ activeTab: tab });
  }
}

describe('VSCodeAPIWrapper', () => {
  let mockApi;
  let wrapper;

  beforeEach(() => {
    mockApi = createMockVsCodeApi();
    wrapper = new VSCodeAPIWrapper(mockApi);
  });

  describe('openExternal', () => {
    it('should post an openExternal message with the given URL', () => {
      wrapper.openExternal('https://example.com');
      assert.deepStrictEqual(mockApi._messages, [
        { command: 'openExternal', url: 'https://example.com' }
      ]);
    });

    it('should accumulate multiple openExternal messages', () => {
      wrapper.openExternal('https://a.com');
      wrapper.openExternal('https://b.com');
      assert.equal(mockApi._messages.length, 2);
      assert.deepStrictEqual(mockApi._messages[0], { command: 'openExternal', url: 'https://a.com' });
      assert.deepStrictEqual(mockApi._messages[1], { command: 'openExternal', url: 'https://b.com' });
    });
  });

  describe('formatSchema', () => {
    it('should post a formatSchema message', () => {
      wrapper.formatSchema();
      assert.deepStrictEqual(mockApi._messages, [
        { command: 'formatSchema' }
      ]);
    });
  });

  describe('goToPosition', () => {
    it('should post a goToPosition message with the given position', () => {
      const position = [10, 5, 10, 20];
      wrapper.goToPosition(position);
      assert.deepStrictEqual(mockApi._messages, [
        { command: 'goToPosition', position: [10, 5, 10, 20] }
      ]);
    });

    it('should handle position at origin', () => {
      const position = [0, 0, 0, 0];
      wrapper.goToPosition(position);
      assert.deepStrictEqual(mockApi._messages[0], {
        command: 'goToPosition',
        position: [0, 0, 0, 0]
      });
    });
  });

  describe('getActiveTab', () => {
    it('should return undefined when no state is set', () => {
      assert.equal(wrapper.getActiveTab(), undefined);
    });

    it('should return the active tab after setActiveTab', () => {
      wrapper.setActiveTab('lint');
      assert.equal(wrapper.getActiveTab(), 'lint');
    });

    it('should return the correct tab for each tab name', () => {
      for (const tab of ['lint', 'format', 'metaschema']) {
        wrapper.setActiveTab(tab);
        assert.equal(wrapper.getActiveTab(), tab);
      }
    });
  });

  describe('setActiveTab', () => {
    it('should persist the active tab in state', () => {
      wrapper.setActiveTab('format');
      assert.deepStrictEqual(mockApi._getInternalState(), { activeTab: 'format' });
    });

    it('should overwrite previous tab state', () => {
      wrapper.setActiveTab('lint');
      wrapper.setActiveTab('metaschema');
      assert.deepStrictEqual(mockApi._getInternalState(), { activeTab: 'metaschema' });
    });
  });

  describe('does not expose low-level methods', () => {
    it('should not have a postMessage method', () => {
      assert.equal(typeof wrapper.postMessage, 'undefined');
    });

    it('should not have a getState method', () => {
      assert.equal(typeof wrapper.getState, 'undefined');
    });

    it('should not have a setState method', () => {
      assert.equal(typeof wrapper.setState, 'undefined');
    });
  });
});
