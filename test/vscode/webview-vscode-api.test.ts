import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';

suite('Webview VSCode API Wrapper', () => {
    const repoRoot = path.resolve(__dirname, '../../../');
    const apiWrapperPath = path.join(repoRoot, 'webview', 'src', 'vscode-api.ts');
    const appPath = path.join(repoRoot, 'webview', 'src', 'App.tsx');
    const footerPath = path.join(repoRoot, 'webview', 'src', 'components', 'Footer.tsx');
    const formatTabPath = path.join(repoRoot, 'webview', 'src', 'components', 'FormatTab.tsx');
    const lintTabPath = path.join(repoRoot, 'webview', 'src', 'components', 'LintTab.tsx');
    const metaschemaTabPath = path.join(repoRoot, 'webview', 'src', 'components', 'MetaschemaTab.tsx');

    test('should expose only high-level wrapper methods', () => {
        const source = fs.readFileSync(apiWrapperPath, 'utf8');

        assert.match(source, /public openExternal\(/);
        assert.match(source, /public formatSchema\(/);
        assert.match(source, /public goToPosition\(/);
        assert.match(source, /public getActiveTab\(/);
        assert.match(source, /public setActiveTab\(/);

        assert.doesNotMatch(source, /public postMessage\(/);
        assert.doesNotMatch(source, /public getState\(/);
        assert.doesNotMatch(source, /public setState\(/);
    });

    test('should update webview components to use high-level wrapper methods', () => {
        const sources = [
            fs.readFileSync(appPath, 'utf8'),
            fs.readFileSync(footerPath, 'utf8'),
            fs.readFileSync(formatTabPath, 'utf8'),
            fs.readFileSync(lintTabPath, 'utf8'),
            fs.readFileSync(metaschemaTabPath, 'utf8')
        ];

        for (const source of sources) {
            assert.doesNotMatch(source, /vscode\.(postMessage|getState|setState)\(/);
        }
    });
});
