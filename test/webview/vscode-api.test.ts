// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPostMessage = vi.fn();
const mockGetState = vi.fn();
const mockSetState = vi.fn();

vi.stubGlobal('acquireVsCodeApi', () => ({
  postMessage: mockPostMessage,
  getState: mockGetState,
  setState: mockSetState,
}));

const { vscode } = await import('../../webview/src/vscode-api.ts');

describe('VSCodeAPIWrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('openExternal', () => {
    it('should post openExternal command with the given URL', () => {
      vscode.openExternal('https://example.com');
      expect(mockPostMessage).toHaveBeenCalledOnce();
      expect(mockPostMessage).toHaveBeenCalledWith({
        command: 'openExternal',
        url: 'https://example.com',
      });
    });
  });

  describe('formatSchema', () => {
    it('should post formatSchema command', () => {
      vscode.formatSchema();
      expect(mockPostMessage).toHaveBeenCalledOnce();
      expect(mockPostMessage).toHaveBeenCalledWith({
        command: 'formatSchema',
      });
    });
  });

  describe('goToPosition', () => {
    it('should post goToPosition command with the given position', () => {
      const position: [number, number, number, number] = [10, 5, 20, 15];
      vscode.goToPosition(position);
      expect(mockPostMessage).toHaveBeenCalledOnce();
      expect(mockPostMessage).toHaveBeenCalledWith({
        command: 'goToPosition',
        position: [10, 5, 20, 15],
      });
    });
  });

  describe('getActiveTab', () => {
    it('should return the active tab from persisted state', () => {
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
    it('should persist the active tab in state', () => {
      vscode.setActiveTab('format');
      expect(mockSetState).toHaveBeenCalledOnce();
      expect(mockSetState).toHaveBeenCalledWith({ activeTab: 'format' });
    });
  });
});
