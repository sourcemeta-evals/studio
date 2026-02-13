// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';

function createMockVsCodeApi() {
  return {
    postMessage: vi.fn(),
    getState: vi.fn(),
    setState: vi.fn()
  };
}

let mockApi: ReturnType<typeof createMockVsCodeApi>;

beforeEach(async () => {
  vi.resetModules();
  mockApi = createMockVsCodeApi();
  (globalThis as Record<string, unknown>).acquireVsCodeApi = () => mockApi;
  window.acquireVsCodeApi = () => mockApi;
});

async function loadVscode() {
  const mod = await import('../../webview/src/vscode-api.ts');
  return mod.vscode;
}

describe('VSCodeAPIWrapper', () => {
  describe('openExternal', () => {
    it('should post an openExternal message with the given URL', async () => {
      const vscode = await loadVscode();
      vscode.openExternal('https://example.com');
      expect(mockApi.postMessage).toHaveBeenCalledWith({
        command: 'openExternal',
        url: 'https://example.com'
      });
    });

    it('should handle different URLs', async () => {
      const vscode = await loadVscode();
      vscode.openExternal('https://github.com/sourcemeta/studio');
      expect(mockApi.postMessage).toHaveBeenCalledWith({
        command: 'openExternal',
        url: 'https://github.com/sourcemeta/studio'
      });
    });
  });

  describe('formatSchema', () => {
    it('should post a formatSchema message', async () => {
      const vscode = await loadVscode();
      vscode.formatSchema();
      expect(mockApi.postMessage).toHaveBeenCalledWith({
        command: 'formatSchema'
      });
    });

    it('should not pass any extra arguments', async () => {
      const vscode = await loadVscode();
      vscode.formatSchema();
      expect(mockApi.postMessage).toHaveBeenCalledTimes(1);
      expect(mockApi.postMessage).toHaveBeenCalledWith({
        command: 'formatSchema'
      });
    });
  });

  describe('goToPosition', () => {
    it('should post a goToPosition message with the given position', async () => {
      const vscode = await loadVscode();
      const position: [number, number, number, number] = [1, 2, 3, 4];
      vscode.goToPosition(position);
      expect(mockApi.postMessage).toHaveBeenCalledWith({
        command: 'goToPosition',
        position: [1, 2, 3, 4]
      });
    });

    it('should handle zero-based positions', async () => {
      const vscode = await loadVscode();
      const position: [number, number, number, number] = [0, 0, 0, 0];
      vscode.goToPosition(position);
      expect(mockApi.postMessage).toHaveBeenCalledWith({
        command: 'goToPosition',
        position: [0, 0, 0, 0]
      });
    });
  });

  describe('getActiveTab', () => {
    it('should return the saved active tab', async () => {
      mockApi.getState.mockReturnValue({ activeTab: 'lint' });
      const vscode = await loadVscode();
      expect(vscode.getActiveTab()).toBe('lint');
    });

    it('should return undefined when no state is saved', async () => {
      mockApi.getState.mockReturnValue(undefined);
      const vscode = await loadVscode();
      expect(vscode.getActiveTab()).toBeUndefined();
    });

    it('should return undefined when state has no activeTab', async () => {
      mockApi.getState.mockReturnValue({});
      const vscode = await loadVscode();
      expect(vscode.getActiveTab()).toBeUndefined();
    });

    it('should return format tab', async () => {
      mockApi.getState.mockReturnValue({ activeTab: 'format' });
      const vscode = await loadVscode();
      expect(vscode.getActiveTab()).toBe('format');
    });

    it('should return metaschema tab', async () => {
      mockApi.getState.mockReturnValue({ activeTab: 'metaschema' });
      const vscode = await loadVscode();
      expect(vscode.getActiveTab()).toBe('metaschema');
    });
  });

  describe('setActiveTab', () => {
    it('should save the active tab to state', async () => {
      const vscode = await loadVscode();
      vscode.setActiveTab('lint');
      expect(mockApi.setState).toHaveBeenCalledWith({ activeTab: 'lint' });
    });

    it('should save format tab', async () => {
      const vscode = await loadVscode();
      vscode.setActiveTab('format');
      expect(mockApi.setState).toHaveBeenCalledWith({ activeTab: 'format' });
    });

    it('should save metaschema tab', async () => {
      const vscode = await loadVscode();
      vscode.setActiveTab('metaschema');
      expect(mockApi.setState).toHaveBeenCalledWith({ activeTab: 'metaschema' });
    });
  });

  describe('encapsulation', () => {
    it('should not expose postMessage directly', async () => {
      const vscode = await loadVscode();
      expect('postMessage' in vscode).toBe(false);
    });

    it('should not expose getState directly', async () => {
      const vscode = await loadVscode();
      expect('getState' in vscode).toBe(false);
    });

    it('should not expose setState directly', async () => {
      const vscode = await loadVscode();
      expect('setState' in vscode).toBe(false);
    });
  });
});
