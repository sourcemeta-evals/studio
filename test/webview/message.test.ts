import * as assert from 'node:assert';
import { describe, it, before } from 'node:test';

declare const globalThis: {
  window: {
    acquireVsCodeApi: () => {
      postMessage: (message: unknown) => void;
      getState: () => unknown;
      setState: (state: unknown) => void;
    };
  };
};

describe('message module exports', () => {
  const postedMessages: unknown[] = [];
  let storedState: unknown = undefined;

  before(() => {
    globalThis.window = {
      acquireVsCodeApi: () => ({
        postMessage: (message: unknown) => {
          postedMessages.push(message);
        },
        getState: () => storedState,
        setState: (state: unknown) => {
          storedState = state;
        },
      }),
    };
  });

  it('should export openExternal as a function', async () => {
    const { openExternal } = await import('../../webview/src/message.ts');
    assert.strictEqual(typeof openExternal, 'function');
  });

  it('should export formatSchema as a function', async () => {
    const { formatSchema } = await import('../../webview/src/message.ts');
    assert.strictEqual(typeof formatSchema, 'function');
  });

  it('should export goToPosition as a function', async () => {
    const { goToPosition } = await import('../../webview/src/message.ts');
    assert.strictEqual(typeof goToPosition, 'function');
  });

  it('should export getActiveTab as a function', async () => {
    const { getActiveTab } = await import('../../webview/src/message.ts');
    assert.strictEqual(typeof getActiveTab, 'function');
  });

  it('should export setActiveTab as a function', async () => {
    const { setActiveTab } = await import('../../webview/src/message.ts');
    assert.strictEqual(typeof setActiveTab, 'function');
  });

  it('should NOT export a vscode wrapper object', async () => {
    const messageModule = await import('../../webview/src/message.ts');
    assert.strictEqual('vscode' in messageModule, false);
  });

  it('should NOT re-export TabType', async () => {
    const messageModule = await import('../../webview/src/message.ts');
    assert.strictEqual('TabType' in messageModule, false);
  });

  it('openExternal should post the correct message', async () => {
    postedMessages.length = 0;
    const { openExternal } = await import('../../webview/src/message.ts');
    openExternal('https://example.com');
    assert.deepStrictEqual(postedMessages[postedMessages.length - 1], {
      command: 'openExternal',
      url: 'https://example.com',
    });
  });

  it('formatSchema should post the correct message', async () => {
    postedMessages.length = 0;
    const { formatSchema } = await import('../../webview/src/message.ts');
    formatSchema();
    assert.deepStrictEqual(postedMessages[postedMessages.length - 1], {
      command: 'formatSchema',
    });
  });

  it('goToPosition should post the correct message', async () => {
    postedMessages.length = 0;
    const { goToPosition } = await import('../../webview/src/message.ts');
    goToPosition([10, 5]);
    assert.deepStrictEqual(postedMessages[postedMessages.length - 1], {
      command: 'goToPosition',
      position: [10, 5],
    });
  });

  it('setActiveTab and getActiveTab should persist state', async () => {
    const { setActiveTab, getActiveTab } = await import('../../webview/src/message.ts');
    setActiveTab('format');
    assert.strictEqual(getActiveTab(), 'format');
    setActiveTab('metaschema');
    assert.strictEqual(getActiveTab(), 'metaschema');
  });
});
