import * as assert from 'assert';

/**
 * Tests for the vscode-api wrapper encapsulation
 * 
 * These tests verify that the VSCodeAPIWrapper properly encapsulates
 * the low-level postMessage, getState, and setState methods and only
 * exposes the high-level methods: openExternal, formatSchema, 
 * goToPosition, getActiveTab, and setActiveTab.
 */

suite('VSCode API Wrapper Test Suite', () => {
    function getRepoRoot() {
        const path = require('path');
        let root = path.resolve(__dirname, '../..');
        if (root.endsWith('/build')) {
            root = path.resolve(root, '..');
        }
        return root;
    }

    test('VSCodeAPIWrapper should encapsulate low-level methods', () => {
        
        const fs = require('fs');
        const path = require('path');
        const repoRoot = getRepoRoot();
        const apiFilePath = path.join(repoRoot, 'webview/src/vscode-api.ts');
        const apiContent = fs.readFileSync(apiFilePath, 'utf8');
        
        assert.ok(apiContent.includes('public openExternal'), 
            'VSCodeAPIWrapper should have openExternal method');
        assert.ok(apiContent.includes('public formatSchema'), 
            'VSCodeAPIWrapper should have formatSchema method');
        assert.ok(apiContent.includes('public goToPosition'), 
            'VSCodeAPIWrapper should have goToPosition method');
        assert.ok(apiContent.includes('public getActiveTab'), 
            'VSCodeAPIWrapper should have getActiveTab method');
        assert.ok(apiContent.includes('public setActiveTab'), 
            'VSCodeAPIWrapper should have setActiveTab method');
        
        const publicPostMessageMatch = apiContent.match(/public\s+postMessage/);
        const publicGetStateMatch = apiContent.match(/public\s+getState/);
        const publicSetStateMatch = apiContent.match(/public\s+setState/);
        
        assert.strictEqual(publicPostMessageMatch, null, 
            'postMessage should not be a public method');
        assert.strictEqual(publicGetStateMatch, null, 
            'getState should not be a public method');
        assert.strictEqual(publicSetStateMatch, null, 
            'setState should not be a public method');
    });

    test('Components should use high-level API methods only', () => {
        const fs = require('fs');
        const path = require('path');
        const repoRoot = getRepoRoot();
        
        const componentsDir = path.join(repoRoot, 'webview/src/components');
        const appFile = path.join(repoRoot, 'webview/src/App.tsx');
        
        const componentFiles = [
            path.join(componentsDir, 'LintTab.tsx'),
            path.join(componentsDir, 'FormatTab.tsx'),
            path.join(componentsDir, 'MetaschemaTab.tsx'),
            path.join(componentsDir, 'Footer.tsx'),
            appFile
        ];
        
        for (const file of componentFiles) {
            const content = fs.readFileSync(file, 'utf8');
            
            const directPostMessageMatch = content.match(/vscode\.postMessage\s*\(\s*\{/);
            assert.strictEqual(directPostMessageMatch, null, 
                `${path.basename(file)} should not use vscode.postMessage directly`);
            
            if (!file.includes('App.tsx')) {
                const directGetStateMatch = content.match(/vscode\.getState\s*\(/);
                assert.strictEqual(directGetStateMatch, null, 
                    `${path.basename(file)} should not use vscode.getState directly`);
            }
            
            const directSetStateMatch = content.match(/vscode\.setState\s*\(\s*\{/);
            assert.strictEqual(directSetStateMatch, null, 
                `${path.basename(file)} should not use vscode.setState directly`);
        }
    });

    test('High-level methods should use proper message types', () => {
        const fs = require('fs');
        const path = require('path');
        const repoRoot = getRepoRoot();
        const apiFilePath = path.join(repoRoot, 'webview/src/vscode-api.ts');
        const apiContent = fs.readFileSync(apiFilePath, 'utf8');
        
        assert.ok(apiContent.includes("command: 'openExternal'"), 
            'openExternal should send openExternal command');
        assert.ok(apiContent.includes("command: 'formatSchema'"), 
            'formatSchema should send formatSchema command');
        assert.ok(apiContent.includes("command: 'goToPosition'"), 
            'goToPosition should send goToPosition command');
        
        assert.ok(apiContent.includes("import type { WebviewMessage }"), 
            'vscode-api should import WebviewMessage type');
    });

    test('State management should be encapsulated', () => {
        const fs = require('fs');
        const path = require('path');
        const repoRoot = getRepoRoot();
        const apiFilePath = path.join(repoRoot, 'webview/src/vscode-api.ts');
        const apiContent = fs.readFileSync(apiFilePath, 'utf8');
        
        assert.ok(apiContent.includes('getActiveTab'), 
            'API should have getActiveTab method');
        assert.ok(apiContent.includes('setActiveTab'), 
            'API should have setActiveTab method');
        
        assert.ok(apiContent.includes("type TabType"), 
            'TabType should be defined for type safety');
        
        assert.ok(apiContent.includes("interface TabState"), 
            'TabState interface should be defined');
    });

    test('API wrapper should maintain backward compatibility', () => {
        const fs = require('fs');
        const path = require('path');
        const repoRoot = getRepoRoot();
        
        const apiFilePath = path.join(repoRoot, 'webview/src/vscode-api.ts');
        const apiContent = fs.readFileSync(apiFilePath, 'utf8');
        
        assert.ok(apiContent.includes('export const vscode'), 
            'vscode constant should be exported');
        assert.ok(apiContent.includes('new VSCodeAPIWrapper()'), 
            'vscode should be an instance of VSCodeAPIWrapper');
    });
});
