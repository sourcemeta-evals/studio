import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';

suite('Webview Message Exports', () => {
    test('Should export direct message methods without vscode wrapper', () => {
        const messagePath = path.resolve(__dirname, '../../../webview/src/message.ts');
        const source = fs.readFileSync(messagePath, 'utf8');

        assert.match(source, /export function openExternal\s*\(/, 'openExternal should be exported directly');
        assert.match(source, /export function formatSchema\s*\(/, 'formatSchema should be exported directly');
        assert.match(source, /export function goToPosition\s*\(/, 'goToPosition should be exported directly');
        assert.match(source, /export function getActiveTab\s*\(/, 'getActiveTab should be exported directly');
        assert.match(source, /export function setActiveTab\s*\(/, 'setActiveTab should be exported directly');

        assert.doesNotMatch(source, /export const vscode\s*=/, 'vscode wrapper should not be exported');
        assert.doesNotMatch(source, /export type\s*\{\s*TabType\s*\}/, 'TabType should not be re-exported from message.ts');
    });
});
