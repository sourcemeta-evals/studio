import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPostMessage = vi.fn();
const mockGetState = vi.fn();
const mockSetState = vi.fn();

const mockVsCodeApi = {
  postMessage: mockPostMessage,
  getState: mockGetState,
  setState: mockSetState,
};

vi.stubGlobal('acquireVsCodeApi', () => mockVsCodeApi);

Object.defineProperty(window, 'acquireVsCodeApi', {
  value: () => mockVsCodeApi,
  writable: true,
});

const { vscode } = await import('./vscode-api');

describe('vscode-api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('openExternal', () => {
    it('should post a message with command openExternal and the provided URL', () => {
      const testUrl = 'https://example.com';
      vscode.openExternal(testUrl);

      expect(mockPostMessage).toHaveBeenCalledTimes(1);
      expect(mockPostMessage).toHaveBeenCalledWith({
        command: 'openExternal',
        url: testUrl,
      });
    });
  });

  describe('formatSchema', () => {
    it('should post a message with command formatSchema', () => {
      vscode.formatSchema();

      expect(mockPostMessage).toHaveBeenCalledTimes(1);
      expect(mockPostMessage).toHaveBeenCalledWith({
        command: 'formatSchema',
      });
    });
  });

  describe('goToPosition', () => {
    it('should post a message with command goToPosition and the provided position', () => {
      const testPosition: [number, number, number, number] = [1, 2, 3, 4];
      vscode.goToPosition(testPosition);

      expect(mockPostMessage).toHaveBeenCalledTimes(1);
      expect(mockPostMessage).toHaveBeenCalledWith({
        command: 'goToPosition',
        position: testPosition,
      });
    });
  });

  describe('getActiveTab', () => {
    it('should return the active tab from state', () => {
      mockGetState.mockReturnValue({ activeTab: 'lint' });

      const result = vscode.getActiveTab();

      expect(mockGetState).toHaveBeenCalledTimes(1);
      expect(result).toBe('lint');
    });

    it('should return undefined when state is undefined', () => {
      mockGetState.mockReturnValue(undefined);

      const result = vscode.getActiveTab();

      expect(mockGetState).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });

    it('should return undefined when activeTab is not set', () => {
      mockGetState.mockReturnValue({});

      const result = vscode.getActiveTab();

      expect(mockGetState).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });
  });

  describe('setActiveTab', () => {
    it('should set the active tab in state', () => {
      vscode.setActiveTab('format');

      expect(mockSetState).toHaveBeenCalledTimes(1);
      expect(mockSetState).toHaveBeenCalledWith({ activeTab: 'format' });
    });

    it('should set metaschema tab', () => {
      vscode.setActiveTab('metaschema');

      expect(mockSetState).toHaveBeenCalledTimes(1);
      expect(mockSetState).toHaveBeenCalledWith({ activeTab: 'metaschema' });
    });
  });
});
