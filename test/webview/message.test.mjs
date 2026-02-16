import { describe, it, beforeEach } from 'node:test';
import * as assert from 'node:assert/strict';

let messages = [];
let storedState = undefined;

Object.defineProperty(globalThis, 'window', {
  value: {
    acquireVsCodeApi: () => ({
      postMessage: (message) => { messages.push(message); },
      getState: () => storedState,
      setState: (state) => { storedState = state; }
    })
  },
  writable: true
});

const messageModule = await import('../../webview/src/message.ts');

describe('message module exports', () => {
  beforeEach(() => {
    messages = [];
    storedState = undefined;
  });

  it('should export openExternal as a function', () => {
    assert.strictEqual(typeof messageModule.openExternal, 'function');
  });

  it('should export formatSchema as a function', () => {
    assert.strictEqual(typeof messageModule.formatSchema, 'function');
  });

  it('should export goToPosition as a function', () => {
    assert.strictEqual(typeof messageModule.goToPosition, 'function');
  });

  it('should export getActiveTab as a function', () => {
    assert.strictEqual(typeof messageModule.getActiveTab, 'function');
  });

  it('should export setActiveTab as a function', () => {
    assert.strictEqual(typeof messageModule.setActiveTab, 'function');
  });

  it('should NOT export a vscode object', () => {
    assert.strictEqual('vscode' in messageModule, false);
  });

  it('should NOT re-export TabType', () => {
    assert.strictEqual('TabType' in messageModule, false);
  });

  it('openExternal should post correct message', () => {
    messageModule.openExternal('https://example.com');
    assert.deepStrictEqual(messages[0], { command: 'openExternal', url: 'https://example.com' });
  });

  it('formatSchema should post correct message', () => {
    messageModule.formatSchema();
    assert.deepStrictEqual(messages[0], { command: 'formatSchema' });
  });

  it('goToPosition should post correct message', () => {
    messageModule.goToPosition([1, 2]);
    assert.deepStrictEqual(messages[0], { command: 'goToPosition', position: [1, 2] });
  });

  it('setActiveTab and getActiveTab should persist tab state', () => {
    messageModule.setActiveTab('format');
    const result = messageModule.getActiveTab();
    assert.strictEqual(result, 'format');
  });

  it('getActiveTab should return undefined when no state is set', () => {
    const result = messageModule.getActiveTab();
    assert.strictEqual(result, undefined);
  });
});
