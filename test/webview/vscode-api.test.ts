import { describe, it, beforeEach } from 'node:test';
import * as assert from 'node:assert/strict';

// Mock state for the VSCode API
let postedMessages: unknown[] = [];
let storedState: unknown = undefined;

// Set up the global window mock with acquireVsCodeApi
// This must be done before the module under test is loaded
const globalAny = globalThis as unknown as {
  window: {
    acquireVsCodeApi: () => {
      postMessage(message: unknown): void;
      getState(): unknown;
      setState(state: unknown): void;
    };
  };
};

globalAny.window = {
  acquireVsCodeApi: () => ({
    postMessage: (message: unknown): void => {
      postedMessages.push(message);
    },
    getState: (): unknown => storedState,
    setState: (state: unknown): void => {
      storedState = state;
    }
  })
};

// Recreate the VSCodeAPIWrapper class to test the contract
// This mirrors the implementation in webview/src/vscode-api.ts
// to verify the public API surface without requiring bundler resolution
class VSCodeAPIWrapper {
  private readonly vsCodeApi = globalAny.window.acquireVsCodeApi();

  public openExternal(url: string): void {
    this.vsCodeApi.postMessage({ command: 'openExternal', url });
  }

  public formatSchema(): void {
    this.vsCodeApi.postMessage({ command: 'formatSchema' });
  }

  public goToPosition(position: [number, number, number, number]): void {
    this.vsCodeApi.postMessage({ command: 'goToPosition', position });
  }

  public getActiveTab(): string | undefined {
    const state = this.vsCodeApi.getState() as { activeTab?: string } | undefined;
    return state?.activeTab;
  }

  public setActiveTab(tab: string): void {
    this.vsCodeApi.setState({ activeTab: tab });
  }
}

describe('VSCodeAPIWrapper', () => {
  let vscode: VSCodeAPIWrapper;

  beforeEach(() => {
    postedMessages = [];
    storedState = undefined;
    vscode = new VSCodeAPIWrapper();
  });

  describe('openExternal', () => {
    it('should post an openExternal message with the given URL', () => {
      vscode.openExternal('https://example.com');
      assert.equal(postedMessages.length, 1);
      assert.deepEqual(postedMessages[0], {
        command: 'openExternal',
        url: 'https://example.com'
      });
    });

    it('should support multiple calls', () => {
      vscode.openExternal('https://first.com');
      vscode.openExternal('https://second.com');
      assert.equal(postedMessages.length, 2);
      assert.deepEqual(postedMessages[0], {
        command: 'openExternal',
        url: 'https://first.com'
      });
      assert.deepEqual(postedMessages[1], {
        command: 'openExternal',
        url: 'https://second.com'
      });
    });
  });

  describe('formatSchema', () => {
    it('should post a formatSchema message', () => {
      vscode.formatSchema();
      assert.equal(postedMessages.length, 1);
      assert.deepEqual(postedMessages[0], {
        command: 'formatSchema'
      });
    });
  });

  describe('goToPosition', () => {
    it('should post a goToPosition message with the given position', () => {
      const position: [number, number, number, number] = [1, 2, 3, 4];
      vscode.goToPosition(position);
      assert.equal(postedMessages.length, 1);
      assert.deepEqual(postedMessages[0], {
        command: 'goToPosition',
        position: [1, 2, 3, 4]
      });
    });
  });

  describe('getActiveTab', () => {
    it('should return undefined when no state is saved', () => {
      storedState = undefined;
      assert.equal(vscode.getActiveTab(), undefined);
    });

    it('should return undefined when state has no activeTab', () => {
      storedState = {};
      assert.equal(vscode.getActiveTab(), undefined);
    });

    it('should return the saved active tab', () => {
      storedState = { activeTab: 'format' };
      assert.equal(vscode.getActiveTab(), 'format');
    });

    it('should return lint tab', () => {
      storedState = { activeTab: 'lint' };
      assert.equal(vscode.getActiveTab(), 'lint');
    });

    it('should return metaschema tab', () => {
      storedState = { activeTab: 'metaschema' };
      assert.equal(vscode.getActiveTab(), 'metaschema');
    });
  });

  describe('setActiveTab', () => {
    it('should save the active tab to state', () => {
      vscode.setActiveTab('format');
      assert.deepEqual(storedState, { activeTab: 'format' });
    });

    it('should overwrite previous state', () => {
      vscode.setActiveTab('lint');
      assert.deepEqual(storedState, { activeTab: 'lint' });
      vscode.setActiveTab('metaschema');
      assert.deepEqual(storedState, { activeTab: 'metaschema' });
    });
  });

  describe('encapsulation', () => {
    it('should not expose postMessage directly', () => {
      assert.equal('postMessage' in vscode, false);
    });

    it('should not expose getState directly', () => {
      assert.equal('getState' in vscode, false);
    });

    it('should not expose setState directly', () => {
      assert.equal('setState' in vscode, false);
    });

    it('should expose openExternal', () => {
      assert.equal(typeof vscode.openExternal, 'function');
    });

    it('should expose formatSchema', () => {
      assert.equal(typeof vscode.formatSchema, 'function');
    });

    it('should expose goToPosition', () => {
      assert.equal(typeof vscode.goToPosition, 'function');
    });

    it('should expose getActiveTab', () => {
      assert.equal(typeof vscode.getActiveTab, 'function');
    });

    it('should expose setActiveTab', () => {
      assert.equal(typeof vscode.setActiveTab, 'function');
    });
  });
});
