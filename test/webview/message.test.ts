import assert from 'node:assert/strict';
import { describe, it, before } from 'node:test';

const postedMessages: unknown[] = [];
let storedState: unknown = undefined;

(globalThis as Record<string, unknown>).window = {
  acquireVsCodeApi: () => ({
    postMessage: (message: unknown) => { postedMessages.push(message); },
    getState: () => storedState,
    setState: (state: unknown) => { storedState = state; }
  })
};

describe('message module exports', () => {
  let message: typeof import('../../webview/src/message.ts');

  before(async () => {
    message = await import('../../webview/src/message.ts');
  });

  it('exports openExternal as a function', () => {
    assert.equal(typeof message.openExternal, 'function');
  });

  it('exports formatSchema as a function', () => {
    assert.equal(typeof message.formatSchema, 'function');
  });

  it('exports goToPosition as a function', () => {
    assert.equal(typeof message.goToPosition, 'function');
  });

  it('exports getActiveTab as a function', () => {
    assert.equal(typeof message.getActiveTab, 'function');
  });

  it('exports setActiveTab as a function', () => {
    assert.equal(typeof message.setActiveTab, 'function');
  });

  it('does not export vscode', () => {
    assert.equal('vscode' in message, false);
  });

  it('does not re-export TabType at runtime', () => {
    assert.equal('TabType' in message, false);
  });

  it('openExternal posts the correct message', () => {
    postedMessages.length = 0;
    message.openExternal('https://example.com');
    assert.deepEqual(postedMessages, [
      { command: 'openExternal', url: 'https://example.com' }
    ]);
  });

  it('formatSchema posts the correct message', () => {
    postedMessages.length = 0;
    message.formatSchema();
    assert.deepEqual(postedMessages, [
      { command: 'formatSchema' }
    ]);
  });

  it('goToPosition posts the correct message', () => {
    postedMessages.length = 0;
    message.goToPosition([10, 5]);
    assert.deepEqual(postedMessages, [
      { command: 'goToPosition', position: [10, 5] }
    ]);
  });

  it('setActiveTab persists the tab and getActiveTab retrieves it', () => {
    storedState = undefined;
    assert.equal(message.getActiveTab(), undefined);

    message.setActiveTab('lint');
    assert.equal(message.getActiveTab(), 'lint');

    message.setActiveTab('format');
    assert.equal(message.getActiveTab(), 'format');

    message.setActiveTab('metaschema');
    assert.equal(message.getActiveTab(), 'metaschema');
  });

  it('getActiveTab returns undefined when state is null', () => {
    storedState = undefined;
    assert.equal(message.getActiveTab(), undefined);
  });
});
