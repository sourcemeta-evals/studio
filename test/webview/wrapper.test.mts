import * as assert from 'node:assert';
import { test } from 'node:test';

const messages: unknown[] = [];
let storedState: unknown;

(globalThis as { window?: unknown }).window = {
    acquireVsCodeApi: () => ({
        postMessage(message: unknown): void {
            messages.push(message);
        },
        getState(): unknown {
            return storedState;
        },
        setState(state: unknown): void {
            storedState = state;
        }
    })
};

const { vscode } = await import('../../webview/src/vscode-api.ts');

test('openExternal sends a message', () => {
    vscode.openExternal('https://www.sourcemeta.com/');
    assert.strictEqual(messages.length, 1);
});

test('the active tab can be stored and read back', () => {
    vscode.setActiveTab('format');
    assert.strictEqual(vscode.getActiveTab(), 'format');
});
