// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockPostMessage = vi.fn();
const mockGetState = vi.fn();
const mockSetState = vi.fn();

vi.stubGlobal('acquireVsCodeApi', () => ({
  postMessage: mockPostMessage,
  getState: mockGetState,
  setState: mockSetState,
}));

// Import after the global mock is set up
const { vscode } = await import('../../webview/src/vscode-api.ts');

describe('VSCodeAPIWrapper', () => {
  beforeEach(() => {
    mockPostMessage.mockClear();
    mockGetState.mockClear();
    mockSetState.mockClear();
  });

  describe('openExternal', () => {
    it('should post an openExternal message with the given URL', () => {
      vscode.openExternal('https://example.com');
      expect(mockPostMessage).toHaveBeenCalledWith({
        command: 'openExternal',
        url: 'https://example.com',
      });
    });

    it('should post separate messages for different URLs', () => {
      vscode.openExternal('https://first.com');
      vscode.openExternal('https://second.com');
      expect(mockPostMessage).toHaveBeenCalledTimes(2);
      expect(mockPostMessage).toHaveBeenNthCalledWith(1, {
        command: 'openExternal',
        url: 'https://first.com',
      });
      expect(mockPostMessage).toHaveBeenNthCalledWith(2, {
        command: 'openExternal',
        url: 'https://second.com',
      });
    });
  });

  describe('formatSchema', () => {
    it('should post a formatSchema message', () => {
      vscode.formatSchema();
      expect(mockPostMessage).toHaveBeenCalledWith({
        command: 'formatSchema',
      });
    });
  });

  describe('goToPosition', () => {
    it('should post a goToPosition message with the given position', () => {
      const position: [number, number, number, number] = [1, 2, 3, 4];
      vscode.goToPosition(position);
      expect(mockPostMessage).toHaveBeenCalledWith({
        command: 'goToPosition',
        position: [1, 2, 3, 4],
      });
    });
  });

  describe('getActiveTab', () => {
    it('should return the active tab from stored state', () => {
      mockGetState.mockReturnValue({ activeTab: 'lint' });
      expect(vscode.getActiveTab()).toBe('lint');
    });

    it('should return undefined when no state exists', () => {
      mockGetState.mockReturnValue(undefined);
      expect(vscode.getActiveTab()).toBeUndefined();
    });

    it('should return undefined when state has no activeTab', () => {
      mockGetState.mockReturnValue({});
      expect(vscode.getActiveTab()).toBeUndefined();
    });
  });

  describe('setActiveTab', () => {
    it('should persist the active tab to state', () => {
      vscode.setActiveTab('format');
      expect(mockSetState).toHaveBeenCalledWith({ activeTab: 'format' });
    });

    it('should persist different tab values', () => {
      vscode.setActiveTab('metaschema');
      expect(mockSetState).toHaveBeenCalledWith({
        activeTab: 'metaschema',
      });
    });
  });

  describe('API surface', () => {
    it('should only expose the five high-level methods', () => {
      const methods = Object.getOwnPropertyNames(
        Object.getPrototypeOf(vscode)
      ).filter((name) => name !== 'constructor');
      expect(methods.sort()).toEqual(
        [
          'openExternal',
          'formatSchema',
          'goToPosition',
          'getActiveTab',
          'setActiveTab',
        ].sort()
      );
    });

    it('should not expose postMessage', () => {
      expect('postMessage' in vscode).toBe(false);
    });

    it('should not expose getState', () => {
      expect('getState' in vscode).toBe(false);
    });

    it('should not expose setState', () => {
      expect('setState' in vscode).toBe(false);
    });
  });
});
