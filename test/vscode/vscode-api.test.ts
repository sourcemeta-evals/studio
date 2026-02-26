/**
 * Tests for the VS Code API abstraction layer in the webview.
 * 
 * These tests verify that the vscode-api module correctly encapsulates
 * the low-level VS Code webview API and only exposes high-level functions.
 */

import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';

suite('VS Code API Encapsulation Tests', () => {
  const vscodeApiPath = path.resolve(__dirname, '../../../../webview/src/vscode-api.ts');
  let vscodeApiContent: string;

  suiteSetup(() => {
    // Read the vscode-api.ts file to verify its structure
    vscodeApiContent = fs.readFileSync(vscodeApiPath, 'utf-8');
  });

  suite('API Exports', () => {
    test('should export openExternal function', () => {
      assert.ok(
        vscodeApiContent.includes('export function openExternal'),
        'openExternal should be exported'
      );
    });

    test('should export formatSchema function', () => {
      assert.ok(
        vscodeApiContent.includes('export function formatSchema'),
        'formatSchema should be exported'
      );
    });

    test('should export goToPosition function', () => {
      assert.ok(
        vscodeApiContent.includes('export function goToPosition'),
        'goToPosition should be exported'
      );
    });

    test('should export getActiveTab function', () => {
      assert.ok(
        vscodeApiContent.includes('export function getActiveTab'),
        'getActiveTab should be exported'
      );
    });

    test('should export setActiveTab function', () => {
      assert.ok(
        vscodeApiContent.includes('export function setActiveTab'),
        'setActiveTab should be exported'
      );
    });
  });

  suite('API Encapsulation', () => {
    test('should not export postMessage function', () => {
      // postMessage should be a private function (not exported)
      assert.ok(
        !vscodeApiContent.includes('export function postMessage') &&
        !vscodeApiContent.includes('export { postMessage'),
        'postMessage should NOT be exported'
      );
    });

    test('should have postMessage as a private function', () => {
      // postMessage should exist as an internal function
      assert.ok(
        vscodeApiContent.includes('function postMessage'),
        'postMessage should exist as a private function'
      );
    });

    test('should not export getState or setState directly', () => {
      // getState and setState from VSCodeAPI should not be exposed
      assert.ok(
        !vscodeApiContent.includes('export function getState') &&
        !vscodeApiContent.includes('export function setState') &&
        !vscodeApiContent.includes('export { getState') &&
        !vscodeApiContent.includes('export { setState'),
        'getState and setState should NOT be exported'
      );
    });

    test('should not export vsCodeApi object', () => {
      assert.ok(
        !vscodeApiContent.includes('export const vsCodeApi') &&
        !vscodeApiContent.includes('export { vsCodeApi'),
        'vsCodeApi should NOT be exported'
      );
    });
  });

  suite('Message Commands', () => {
    test('openExternal should use openExternal command', () => {
      assert.ok(
        vscodeApiContent.includes("command: 'openExternal'"),
        'openExternal should send openExternal command'
      );
    });

    test('formatSchema should use formatSchema command', () => {
      assert.ok(
        vscodeApiContent.includes("command: 'formatSchema'"),
        'formatSchema should send formatSchema command'
      );
    });

    test('goToPosition should use goToPosition command', () => {
      assert.ok(
        vscodeApiContent.includes("command: 'goToPosition'"),
        'goToPosition should send goToPosition command'
      );
    });
  });

  suite('State Management', () => {
    test('getActiveTab should read from vsCodeApi.getState', () => {
      assert.ok(
        vscodeApiContent.includes('vsCodeApi.getState()'),
        'getActiveTab should use vsCodeApi.getState()'
      );
    });

    test('setActiveTab should write to vsCodeApi.setState', () => {
      assert.ok(
        vscodeApiContent.includes('vsCodeApi.setState'),
        'setActiveTab should use vsCodeApi.setState'
      );
    });

    test('state should follow WebviewState structure', () => {
      assert.ok(
        vscodeApiContent.includes('WebviewState'),
        'should use WebviewState type for state management'
      );
    });
  });

  suite('Type Safety', () => {
    test('should use typed Position parameter', () => {
      assert.ok(
        vscodeApiContent.includes('position: Position'),
        'goToPosition should have typed Position parameter'
      );
    });

    test('should use typed TabType parameter', () => {
      assert.ok(
        vscodeApiContent.includes('tab: TabType'),
        'setActiveTab should have typed TabType parameter'
      );
    });

    test('should return TabType from getActiveTab', () => {
      assert.ok(
        vscodeApiContent.includes('TabType | undefined'),
        'getActiveTab should return TabType | undefined'
      );
    });

    test('should use WebviewToExtensionMessage for postMessage', () => {
      assert.ok(
        vscodeApiContent.includes('message: WebviewToExtensionMessage'),
        'postMessage should use WebviewToExtensionMessage type'
      );
    });
  });
});
