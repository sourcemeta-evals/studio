import * as assert from 'node:assert';
import { test } from 'node:test';

interface RecordingHost {
    messages: unknown[];
    state: unknown;
    stateWrites: number;
    acquisitions: number;
}

interface WebviewApi {
    openExternal(url: string): void;
    formatSchema(): void;
    goToPosition(position: [number, number, number, number]): void;
    getActiveTab(): string | undefined;
    setActiveTab(tab: string): void;
}

function installRecordingHost(initialState?: unknown): RecordingHost {
    const host: RecordingHost = { messages: [], state: initialState, stateWrites: 0, acquisitions: 0 };

    (globalThis as { window?: unknown }).window = {
        acquireVsCodeApi: () => {
            host.acquisitions += 1;

            return {
                postMessage(message: unknown): void {
                    host.messages.push(message);
                },
                getState(): unknown {
                    return host.state;
                },
                setState(state: unknown): void {
                    host.stateWrites += 1;
                    host.state = state;
                }
            };
        }
    };

    return host;
}

let generation = 0;

// The module instantiates its wrapper on first evaluation, so every case needs
// a distinct specifier to get an instance bound to the host installed for it
async function loadWebviewApi(): Promise<WebviewApi> {
    generation += 1;
    const module = await import(`../../webview/src/vscode-api.ts?generation=${generation}`) as { vscode: WebviewApi };
    return module.vscode;
}

test('opening an external URL dispatches one command carrying that URL', async () => {
    const urls = [
        'https://github.com/sourcemeta/studio',
        'https://github.com/sourcemeta/studio/issues/new',
        'https://www.sourcemeta.com/',
        'https://example.com/path?query=one&other=two#fragment'
    ];

    for (const url of urls) {
        const host = installRecordingHost();
        const api = await loadWebviewApi();
        api.openExternal(url);
        assert.deepStrictEqual(host.messages, [{ command: 'openExternal', url }]);
    }
});

test('formatting dispatches one command with no further payload', async () => {
    const host = installRecordingHost();
    const api = await loadWebviewApi();
    api.formatSchema();
    assert.deepStrictEqual(host.messages, [{ command: 'formatSchema' }]);
});

test('navigating to a position dispatches one command carrying that position', async () => {
    const positions: [number, number, number, number][] = [[3, 14, 15, 92], [1, 0, 2, 7]];

    for (const position of positions) {
        const expected = [...position];
        const host = installRecordingHost();
        const api = await loadWebviewApi();
        api.goToPosition(position);
        assert.deepStrictEqual(host.messages, [{ command: 'goToPosition', position: expected }]);
        assert.deepStrictEqual([...position], expected);
    }
});

test('storing the active tab writes editor state without dispatching a command', async () => {
    const host = installRecordingHost();
    const api = await loadWebviewApi();
    api.setActiveTab('format');
    assert.deepStrictEqual(host.state, { activeTab: 'format' });
    assert.deepStrictEqual(host.messages, []);
});

test('reading the active tab returns the stored tab without dispatching a command', async () => {
    for (const tab of ['lint', 'format', 'metaschema']) {
        const host = installRecordingHost({ activeTab: tab });
        const api = await loadWebviewApi();
        assert.strictEqual(api.getActiveTab(), tab);
        assert.deepStrictEqual(host.messages, []);
    }
});

test('reading the active tab before anything is stored leaves the default selection', async () => {
    for (const initialState of [undefined, {}]) {
        const host = installRecordingHost(initialState);
        const api = await loadWebviewApi();
        assert.strictEqual(api.getActiveTab() ?? 'lint', 'lint');
        assert.deepStrictEqual(host.messages, []);
    }
});

test('each successive tab selection replaces the stored one', async () => {
    const host = installRecordingHost();
    const writer = await loadWebviewApi();

    for (const tab of ['format', 'lint', 'metaschema', 'lint']) {
        writer.setActiveTab(tab);

        const reader = await loadWebviewApi();
        assert.strictEqual(reader.getActiveTab(), tab);
    }

    assert.deepStrictEqual(host.messages, []);
});

test('only storing a tab writes editor state', async () => {
    const host = installRecordingHost({ activeTab: 'format' });
    const api = await loadWebviewApi();

    api.openExternal('https://www.sourcemeta.com/');
    api.formatSchema();
    api.goToPosition([1, 2, 3, 4]);
    api.getActiveTab();

    assert.strictEqual(host.stateWrites, 0);
    assert.deepStrictEqual(host.state, { activeTab: 'format' });
});

test('a stored active tab survives being read more than once', async () => {
    const host = installRecordingHost({ activeTab: 'metaschema' });
    const api = await loadWebviewApi();

    assert.strictEqual(api.getActiveTab(), 'metaschema');
    assert.strictEqual(api.getActiveTab(), 'metaschema');
    assert.deepStrictEqual(host.state, { activeTab: 'metaschema' });
});

test('one wrapper acquires the editor API once however often it is used', async () => {
    const host = installRecordingHost({ activeTab: 'lint' });
    const api = await loadWebviewApi();

    api.openExternal('https://www.sourcemeta.com/');
    api.formatSchema();
    api.goToPosition([1, 2, 3, 4]);
    api.setActiveTab('format');
    assert.strictEqual(api.getActiveTab(), 'format');

    assert.strictEqual(host.acquisitions, 1);
});

test('a stored active tab survives a new wrapper over the same editor state', async () => {
    const host = installRecordingHost();
    const writer = await loadWebviewApi();
    writer.setActiveTab('metaschema');

    const reader = await loadWebviewApi();
    assert.strictEqual(reader.getActiveTab(), 'metaschema');
    assert.deepStrictEqual(host.messages, []);
});
