// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPostMessage = vi.fn();
const mockGetState = vi.fn();
const mockSetState = vi.fn();

window.acquireVsCodeApi = () => ({
  postMessage: mockPostMessage,
  getState: mockGetState,
  setState: mockSetState,
});

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

    it('should post an openExternal message for a different URL', () => {
      vscode.openExternal('https://github.com/sourcemeta/studio');
      expect(mockPostMessage).toHaveBeenCalledWith({
        command: 'openExternal',
        url: 'https://github.com/sourcemeta/studio',
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
      vscode.goToPosition([1, 2, 3, 4]);
      expect(mockPostMessage).toHaveBeenCalledWith({
        command: 'goToPosition',
        position: [1, 2, 3, 4],
      });
    });

    it('should handle different position values', () => {
      vscode.goToPosition([10, 20, 30, 40]);
      expect(mockPostMessage).toHaveBeenCalledWith({
        command: 'goToPosition',
        position: [10, 20, 30, 40],
      });
    });
  });

  describe('getActiveTab', () => {
    it('should return the active tab from state', () => {
      mockGetState.mockReturnValue({ activeTab: 'lint' });
      expect(vscode.getActiveTab()).toBe('lint');
    });

    it('should return undefined when state is undefined', () => {
      mockGetState.mockReturnValue(undefined);
      expect(vscode.getActiveTab()).toBeUndefined();
    });

    it('should return undefined when activeTab is not set', () => {
      mockGetState.mockReturnValue({});
      expect(vscode.getActiveTab()).toBeUndefined();
    });

    it('should return format tab', () => {
      mockGetState.mockReturnValue({ activeTab: 'format' });
      expect(vscode.getActiveTab()).toBe('format');
    });

    it('should return metaschema tab', () => {
      mockGetState.mockReturnValue({ activeTab: 'metaschema' });
      expect(vscode.getActiveTab()).toBe('metaschema');
    });
  });

  describe('setActiveTab', () => {
    it('should set the active tab to lint', () => {
      vscode.setActiveTab('lint');
      expect(mockSetState).toHaveBeenCalledWith({ activeTab: 'lint' });
    });

    it('should set the active tab to format', () => {
      vscode.setActiveTab('format');
      expect(mockSetState).toHaveBeenCalledWith({ activeTab: 'format' });
    });

    it('should set the active tab to metaschema', () => {
      vscode.setActiveTab('metaschema');
      expect(mockSetState).toHaveBeenCalledWith({ activeTab: 'metaschema' });
    });
  });
});
