import { describe, it, expect, beforeEach, vi } from 'vitest';

function createMockVSCodeApi() {
  let storedState: unknown = undefined;
  return {
    postMessage: vi.fn(),
    getState: vi.fn(() => storedState),
    setState: vi.fn((state: unknown) => { storedState = state; }),
  };
}

function loadVSCodeAPI(mock: ReturnType<typeof createMockVSCodeApi>) {
  (globalThis as Record<string, unknown>).acquireVsCodeApi = () => mock;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return import('../../webview/src/vscode-api.ts');
}

describe('VSCodeAPIWrapper', () => {
  let mock: ReturnType<typeof createMockVSCodeApi>;

  beforeEach(() => {
    vi.resetModules();
    mock = createMockVSCodeApi();
  });

  describe('openExternal', () => {
    it('should post an openExternal message with the given URL', async () => {
      const { vscode } = await loadVSCodeAPI(mock);
      vscode.openExternal('https://example.com');
      expect(mock.postMessage).toHaveBeenCalledWith({
        command: 'openExternal',
        url: 'https://example.com',
      });
    });

    it('should post the correct URL for different values', async () => {
      const { vscode } = await loadVSCodeAPI(mock);
      vscode.openExternal('https://github.com/sourcemeta/studio');
      expect(mock.postMessage).toHaveBeenCalledWith({
        command: 'openExternal',
        url: 'https://github.com/sourcemeta/studio',
      });
    });
  });

  describe('formatSchema', () => {
    it('should post a formatSchema message', async () => {
      const { vscode } = await loadVSCodeAPI(mock);
      vscode.formatSchema();
      expect(mock.postMessage).toHaveBeenCalledWith({
        command: 'formatSchema',
      });
    });

    it('should not include extra properties in the message', async () => {
      const { vscode } = await loadVSCodeAPI(mock);
      vscode.formatSchema();
      expect(mock.postMessage).toHaveBeenCalledTimes(1);
      expect(Object.keys(mock.postMessage.mock.calls[0][0] as object)).toEqual(['command']);
    });
  });

  describe('goToPosition', () => {
    it('should post a goToPosition message with the given position', async () => {
      const { vscode } = await loadVSCodeAPI(mock);
      const position: [number, number, number, number] = [1, 2, 3, 4];
      vscode.goToPosition(position);
      expect(mock.postMessage).toHaveBeenCalledWith({
        command: 'goToPosition',
        position: [1, 2, 3, 4],
      });
    });

    it('should handle zero-based positions', async () => {
      const { vscode } = await loadVSCodeAPI(mock);
      const position: [number, number, number, number] = [0, 0, 0, 0];
      vscode.goToPosition(position);
      expect(mock.postMessage).toHaveBeenCalledWith({
        command: 'goToPosition',
        position: [0, 0, 0, 0],
      });
    });
  });

  describe('getActiveTab', () => {
    it('should return undefined when no state is saved', async () => {
      const { vscode } = await loadVSCodeAPI(mock);
      expect(vscode.getActiveTab()).toBeUndefined();
    });

    it('should return the active tab from saved state', async () => {
      mock.getState.mockReturnValue({ activeTab: 'format' });
      const { vscode } = await loadVSCodeAPI(mock);
      expect(vscode.getActiveTab()).toBe('format');
    });

    it('should return undefined when state exists but has no activeTab', async () => {
      mock.getState.mockReturnValue({});
      const { vscode } = await loadVSCodeAPI(mock);
      expect(vscode.getActiveTab()).toBeUndefined();
    });
  });

  describe('setActiveTab', () => {
    it('should save the active tab to state', async () => {
      const { vscode } = await loadVSCodeAPI(mock);
      vscode.setActiveTab('lint');
      expect(mock.setState).toHaveBeenCalledWith({ activeTab: 'lint' });
    });

    it('should save different tab values', async () => {
      const { vscode } = await loadVSCodeAPI(mock);
      vscode.setActiveTab('metaschema');
      expect(mock.setState).toHaveBeenCalledWith({ activeTab: 'metaschema' });
    });
  });

  describe('round-trip', () => {
    it('should persist and retrieve the active tab', async () => {
      const { vscode } = await loadVSCodeAPI(mock);
      vscode.setActiveTab('format');
      expect(vscode.getActiveTab()).toBe('format');
    });
  });
});
