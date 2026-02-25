import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';

function readWebviewSource(relativePath: string): string {
    return fs.readFileSync(path.resolve(__dirname, '../../../webview/src', relativePath), 'utf8');
}

suite('Webview VSCode API Abstraction', () => {
    test('vscode-api.ts exposes only high-level methods', () => {
        const source = readWebviewSource('vscode-api.ts');

        assert.match(source, /public openExternal\(/);
        assert.match(source, /public formatSchema\(/);
        assert.match(source, /public goToPosition\(/);
        assert.match(source, /public getActiveTab\(/);
        assert.match(source, /public setActiveTab\(/);

        assert.doesNotMatch(source, /public postMessage\(/);
        assert.doesNotMatch(source, /public getState\(/);
        assert.doesNotMatch(source, /public setState\(state/);
    });

    test('vscode-api.ts maps methods to command payloads', () => {
        const source = readWebviewSource('vscode-api.ts');

        assert.match(source, /postMessage\(\{ command: 'openExternal', url \}\)/);
        assert.match(source, /postMessage\(\{ command: 'formatSchema' \}\)/);
        assert.match(source, /postMessage\(\{ command: 'goToPosition', position \}\)/);
    });

    test('webview consumers use only high-level wrapper methods', () => {
        const appSource = readWebviewSource('App.tsx');
        const footerSource = readWebviewSource('components/Footer.tsx');
        const lintSource = readWebviewSource('components/LintTab.tsx');
        const formatSource = readWebviewSource('components/FormatTab.tsx');
        const metaschemaSource = readWebviewSource('components/MetaschemaTab.tsx');

        assert.doesNotMatch(appSource, /vscode\.getState\(/);
        assert.doesNotMatch(appSource, /vscode\.setState\(/);

        assert.doesNotMatch(footerSource, /vscode\.postMessage\(/);
        assert.doesNotMatch(lintSource, /vscode\.postMessage\(/);
        assert.doesNotMatch(formatSource, /vscode\.postMessage\(/);
        assert.doesNotMatch(metaschemaSource, /vscode\.postMessage\(/);
    });
});
