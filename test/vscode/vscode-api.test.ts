import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';

function findRepoRoot(startDir: string): string {
    let currentDir = startDir;

    for (let depth = 0; depth < 12; depth += 1) {
        const vscodeApiPath = path.join(currentDir, 'webview', 'src', 'vscode-api.ts');
        if (fs.existsSync(vscodeApiPath)) {
            return currentDir;
        }
        const parentDir = path.dirname(currentDir);
        if (parentDir === currentDir) {
            break;
        }
        currentDir = parentDir;
    }

    throw new Error('Unable to locate repository root from test directory');
}

function readRepoFile(relativePath: string): string {
    const repoRoot = findRepoRoot(__dirname);
    const absolutePath = path.join(repoRoot, relativePath);
    return fs.readFileSync(absolutePath, 'utf8');
}

suite('VSCode API encapsulation', () => {
    test('vscode-api should expose only high-level methods', () => {
        const source = readRepoFile('webview/src/vscode-api.ts');

        assert.match(source, /public openExternal\(/);
        assert.match(source, /public formatSchema\(/);
        assert.match(source, /public goToPosition\(/);
        assert.match(source, /public getActiveTab\(/);
        assert.match(source, /public setActiveTab\(/);

        assert.doesNotMatch(source, /public postMessage\(/);
        assert.doesNotMatch(source, /public getState\(/);
        assert.doesNotMatch(source, /public setState\(/);
    });

    test('webview components should use high-level vscode API methods', () => {
        const filesToCheck = [
            'webview/src/App.tsx',
            'webview/src/components/Footer.tsx',
            'webview/src/components/FormatTab.tsx',
            'webview/src/components/LintTab.tsx',
            'webview/src/components/MetaschemaTab.tsx'
        ];

        for (const filePath of filesToCheck) {
            const source = readRepoFile(filePath);
            assert.doesNotMatch(source, /vscode\.postMessage\(/, `${filePath} should not call postMessage directly`);
            assert.doesNotMatch(source, /vscode\.getState\(/, `${filePath} should not call getState directly`);
            assert.doesNotMatch(source, /vscode\.setState\(/, `${filePath} should not call setState directly`);
        }
    });
});
