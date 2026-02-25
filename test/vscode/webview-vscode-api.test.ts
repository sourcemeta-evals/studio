import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';

suite('Webview VSCode API Wrapper', () => {
  const sourcePath = path.resolve(__dirname, '../../..', 'webview/src/vscode-api.ts');
  const source = fs.readFileSync(sourcePath, 'utf8');

  test('exposes only higher-level public methods', () => {
    assert.match(source, /public openExternal\(/);
    assert.match(source, /public formatSchema\(/);
    assert.match(source, /public goToPosition\(/);
    assert.match(source, /public getActiveTab\(/);
    assert.match(source, /public setActiveTab\(/);

    assert.doesNotMatch(source, /public postMessage\(/);
    assert.doesNotMatch(source, /public getState\(/);
    assert.doesNotMatch(source, /public setState\(/);
  });

  test('keeps low-level messaging and state access internal', () => {
    assert.match(source, /private postMessage\(/);
    assert.match(source, /this\.vsCodeApi\.getState\(/);
    assert.match(source, /this\.vsCodeApi\.setState\(/);
  });
});
