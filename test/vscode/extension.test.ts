import * as assert from 'assert';
import * as vscode from 'vscode';
import testSchema from './fixtures/test-schema.json';

function findPanelTab(): vscode.Tab | undefined {
    return vscode.window.tabGroups.all
        .flatMap(group => group.tabs)
        .find(tab => tab.input instanceof vscode.TabInputWebview
            && tab.input.viewType.includes('sourcemetaStudio'));
}

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

        const panelTab = findPanelTab();
        assert.ok(panelTab, 'Panel tab should be open after running the command');
        assert.strictEqual(panelTab?.label, 'Sourcemeta Studio', 'Panel tab should carry the extension title');
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

        assert.strictEqual(findPanelTab(), undefined, 'Closing all editors should dispose the panel');

        await vscode.commands.executeCommand('sourcemeta-studio.openPanel');

        await new Promise(resolve => setTimeout(resolve, 1000));

        const panelTab = findPanelTab();
        assert.ok(panelTab, 'Panel tab should reopen with no file selected');
        assert.ok(panelTab?.isActive, 'Reopened panel tab should be the active tab in its group');
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

        const panelTab = findPanelTab();
        assert.ok(panelTab, 'Panel tab should be open with no file selected');
        assert.strictEqual(vscode.window.activeTextEditor, undefined, 'No editor should be active');
        assert.strictEqual(panelTab?.group.viewColumn, vscode.ViewColumn.One, 'Panel should take the first column when no editor is active');
    });
});
