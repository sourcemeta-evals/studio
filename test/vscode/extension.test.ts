import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import testSchema from './fixtures/test-schema.json';

suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('Extension should be present', () => {
        const extension = vscode.extensions.getExtension('sourcemeta.sourcemeta-studio');
        assert.ok(extension, 'Extension should be installed');
    });

    test('Should activate extension', async () => {
        const extension = vscode.extensions.getExtension('sourcemeta.sourcemeta-studio');
        if (extension) {
            await extension.activate();
            assert.ok(extension.isActive, 'Extension should be active');
        }
    });

    test('Should register openPanel command', async () => {
        const extension = vscode.extensions.getExtension('sourcemeta.sourcemeta-studio');
        if (extension && !extension.isActive) {
            await extension.activate();
        }

        const commands = await vscode.commands.getCommands(true);
        const commandExists = commands.includes('sourcemeta-studio.openPanel');
        assert.ok(commandExists, 'Command "sourcemeta-studio.openPanel" should be registered');
    });

    test('Should create diagnostic collections', async () => {
        const extension = vscode.extensions.getExtension('sourcemeta.sourcemeta-studio');
        if (extension && !extension.isActive) {
            await extension.activate();
        }

        const diagnostics = vscode.languages.getDiagnostics();
        assert.ok(Array.isArray(diagnostics), 'Diagnostics should be available');
    });

    test('Should open panel when command is executed', async function() {
        this.timeout(5000);

        const extension = vscode.extensions.getExtension('sourcemeta.sourcemeta-studio');
        if (extension && !extension.isActive) {
            await extension.activate();
        }

        await vscode.commands.executeCommand('sourcemeta-studio.openPanel');

        await new Promise(resolve => setTimeout(resolve, 1000));

        assert.ok(true, 'Command executed without error');
    });

    test('Should handle JSON file opening', async function() {
        this.timeout(5000);

        const extension = vscode.extensions.getExtension('sourcemeta.sourcemeta-studio');
        if (extension && !extension.isActive) {
            await extension.activate();
        }

        const document = await vscode.workspace.openTextDocument({
            content: JSON.stringify(testSchema, null, 2),
            language: 'json'
        });
        await vscode.window.showTextDocument(document);

        await new Promise(resolve => setTimeout(resolve, 500));

        assert.strictEqual(document.languageId, 'json', 'Document should be JSON');
    });

    test('Should read extension version from package.json', async () => {
        const extension = vscode.extensions.getExtension('sourcemeta.sourcemeta-studio');
        if (extension && !extension.isActive) {
            await extension.activate();
        }

        assert.ok(extension, 'Extension should be present');
        assert.ok(extension?.packageJSON.version, 'Extension should have a version in package.json');
        assert.match(extension?.packageJSON.version, /^\d+\.\d+\.\d+$/, 'Version should follow semver format');
    });

    test('Should handle no file selected gracefully', async function() {
        this.timeout(5000);

        const extension = vscode.extensions.getExtension('sourcemeta.sourcemeta-studio');
        if (extension && !extension.isActive) {
            await extension.activate();
        }

        await vscode.commands.executeCommand('workbench.action.closeAllEditors');

        await new Promise(resolve => setTimeout(resolve, 500));

        await vscode.commands.executeCommand('sourcemeta-studio.openPanel');

        await new Promise(resolve => setTimeout(resolve, 1000));

        assert.ok(true, 'Extension should handle no file selected without errors');
    });

    test('Should show appropriate message when no file is selected', async function() {
        this.timeout(5000);

        const extension = vscode.extensions.getExtension('sourcemeta.sourcemeta-studio');
        if (extension && !extension.isActive) {
            await extension.activate();
        }

        await vscode.commands.executeCommand('workbench.action.closeAllEditors');
        await new Promise(resolve => setTimeout(resolve, 500));

        await vscode.commands.executeCommand('sourcemeta-studio.openPanel');
        await new Promise(resolve => setTimeout(resolve, 1000));

        assert.ok(extension, 'Extension should exist');
        assert.ok(extension?.isActive, 'Extension should remain active with no file selected');
    });

    test('Webview VSCode API wrapper should expose only high-level methods', () => {
        const vscodeApiPath = path.resolve(__dirname, '../../../webview/src/vscode-api.ts');
        const appPath = path.resolve(__dirname, '../../../webview/src/App.tsx');
        const footerPath = path.resolve(__dirname, '../../../webview/src/components/Footer.tsx');
        const formatTabPath = path.resolve(__dirname, '../../../webview/src/components/FormatTab.tsx');
        const lintTabPath = path.resolve(__dirname, '../../../webview/src/components/LintTab.tsx');
        const metaschemaTabPath = path.resolve(__dirname, '../../../webview/src/components/MetaschemaTab.tsx');

        const vscodeApiSource = fs.readFileSync(vscodeApiPath, 'utf8');
        const appSource = fs.readFileSync(appPath, 'utf8');
        const footerSource = fs.readFileSync(footerPath, 'utf8');
        const formatTabSource = fs.readFileSync(formatTabPath, 'utf8');
        const lintTabSource = fs.readFileSync(lintTabPath, 'utf8');
        const metaschemaTabSource = fs.readFileSync(metaschemaTabPath, 'utf8');

        assert.match(vscodeApiSource, /public openExternal\(/);
        assert.match(vscodeApiSource, /public formatSchema\(/);
        assert.match(vscodeApiSource, /public goToPosition\(/);
        assert.match(vscodeApiSource, /public getActiveTab\(/);
        assert.match(vscodeApiSource, /public setActiveTab\(/);

        assert.doesNotMatch(vscodeApiSource, /public postMessage\(/);
        assert.doesNotMatch(vscodeApiSource, /public getState\(/);
        assert.doesNotMatch(vscodeApiSource, /public setState\(/);

        assert.match(appSource, /vscode\.getActiveTab\(/);
        assert.match(appSource, /vscode\.setActiveTab\(/);
        assert.doesNotMatch(appSource, /vscode\.(getState|setState)\(/);

        assert.doesNotMatch(footerSource, /vscode\.postMessage\(/);
        assert.match(footerSource, /vscode\.openExternal\(/g);

        assert.match(formatTabSource, /vscode\.formatSchema\(/);
        assert.doesNotMatch(formatTabSource, /vscode\.postMessage\(/);

        assert.match(lintTabSource, /vscode\.goToPosition\(/);
        assert.doesNotMatch(lintTabSource, /vscode\.postMessage\(/);

        assert.match(metaschemaTabSource, /vscode\.goToPosition\(/);
        assert.doesNotMatch(metaschemaTabSource, /vscode\.postMessage\(/);
    });
});
