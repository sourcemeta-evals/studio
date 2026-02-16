import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(
  resolve(__dirname, '../../webview/src/message.ts'),
  'utf-8'
);

// Verify that the module exports functions directly, not a class wrapper
assert.ok(
  !source.includes('export const vscode'),
  'Should not export a vscode wrapper object'
);
assert.ok(
  !source.includes('class VSCodeAPIWrapper'),
  'Should not contain the VSCodeAPIWrapper class'
);
assert.ok(
  !source.includes("export type { TabType }"),
  'Should not re-export TabType'
);

// Verify that each function is exported directly
const expectedExports = [
  'openExternal',
  'formatSchema',
  'goToPosition',
  'getActiveTab',
  'setActiveTab'
];

for (const name of expectedExports) {
  assert.ok(
    source.includes(`export function ${name}(`),
    `Should export function "${name}" directly`
  );
}

// Verify consumers import functions directly, not through a vscode object
const consumers = [
  { file: '../../webview/src/App.tsx', functions: ['getActiveTab'] },
  { file: '../../webview/src/components/Footer.tsx', functions: ['openExternal'] },
  { file: '../../webview/src/components/FormatTab.tsx', functions: ['formatSchema'] },
  { file: '../../webview/src/components/LintTab.tsx', functions: ['goToPosition'] },
  { file: '../../webview/src/components/MetaschemaTab.tsx', functions: ['goToPosition'] }
];

for (const { file, functions } of consumers) {
  const content = readFileSync(resolve(__dirname, file), 'utf-8');
  assert.ok(
    !content.includes("import { vscode }"),
    `${file} should not import the vscode wrapper`
  );
  assert.ok(
    !content.includes("vscode."),
    `${file} should not use vscode.method() calls`
  );
  for (const fn of functions) {
    assert.ok(
      content.includes(fn),
      `${file} should import and use "${fn}" directly`
    );
  }
}

console.log('All message module tests passed');
