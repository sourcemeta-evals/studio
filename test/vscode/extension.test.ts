import * as assert from 'assert';
import * as vscode from 'vscode';
import testSchema from './fixtures/test-schema.json';
import type { Position, LintError, MetaschemaError } from '../../protocol/cli';

suite('Position Type Suite', () => {
    test('Position type should be usable in LintError', () => {
        const pos: Position = [1, 2, 3, 4];
        const error: LintError = {
            id: 'test',
            message: 'test error',
            path: '/',
            schemaLocation: '/',
            position: pos
        };
        assert.deepStrictEqual(error.position, [1, 2, 3, 4]);
    });

    test('LintError position can be null', () => {
        const error: LintError = {
            id: 'test',
            message: 'test error',
            path: '/',
            schemaLocation: '/',
            position: null
        };
        assert.strictEqual(error.position, null);
    });

    test('Position type should be usable in MetaschemaError', () => {
        const pos: Position = [10, 5, 10, 20];
        const error: MetaschemaError = {
            error: 'validation error',
            instanceLocation: '/foo',
            keywordLocation: '/bar',
            instancePosition: pos
        };
        assert.deepStrictEqual(error.instancePosition, [10, 5, 10, 20]);
    });

    test('MetaschemaError instancePosition is optional', () => {
        const error: MetaschemaError = {
            error: 'validation error',
            instanceLocation: '/foo',
            keywordLocation: '/bar'
        };
        assert.strictEqual(error.instancePosition, undefined);
    });
});

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
});
