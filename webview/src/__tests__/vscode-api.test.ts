import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock acquireVsCodeApi before importing the module
const mockPostMessage = vi.fn();
const mockGetState = vi.fn();
const mockSetState = vi.fn();

Object.defineProperty(window, 'acquireVsCodeApi', {
  value: () => ({
    postMessage: mockPostMessage,
    getState: mockGetState,
    setState: mockSetState,
  }),
  writable: true,
});

// Dynamic import so the mock is in place first
const { vscode } = await import('../vscode-api.ts');

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

    it('should not include extra properties in the message', () => {
      vscode.formatSchema();
      const message = mockPostMessage.mock.calls[0][0];
      expect(Object.keys(message)).toEqual(['command']);
    });
  });

  describe('goToPosition', () => {
    it('should post a goToPosition message with the given position', () => {
      const position: [number, number, number, number] = [10, 5, 10, 20];
      vscode.goToPosition(position);
      expect(mockPostMessage).toHaveBeenCalledWith({
        command: 'goToPosition',
        position: [10, 5, 10, 20],
      });
    });

    it('should handle zero-based positions', () => {
      const position: [number, number, number, number] = [0, 0, 0, 0];
      vscode.goToPosition(position);
      expect(mockPostMessage).toHaveBeenCalledWith({
        command: 'goToPosition',
        position: [0, 0, 0, 0],
      });
    });
  });

  describe('getActiveTab', () => {
    it('should return the saved active tab', () => {
      mockGetState.mockReturnValue({ activeTab: 'format' });
      expect(vscode.getActiveTab()).toBe('format');
    });

    it('should return null when no state is saved', () => {
      mockGetState.mockReturnValue(undefined);
      expect(vscode.getActiveTab()).toBeNull();
    });

    it('should return null when state has no activeTab', () => {
      mockGetState.mockReturnValue({});
      expect(vscode.getActiveTab()).toBeNull();
    });

    it('should return each tab name correctly', () => {
      for (const tab of ['lint', 'format', 'metaschema'] as const) {
        mockGetState.mockReturnValue({ activeTab: tab });
        expect(vscode.getActiveTab()).toBe(tab);
      }
    });
  });

  describe('setActiveTab', () => {
    it('should save the active tab in state', () => {
      vscode.setActiveTab('lint');
      expect(mockSetState).toHaveBeenCalledWith({ activeTab: 'lint' });
    });

    it('should save format tab', () => {
      vscode.setActiveTab('format');
      expect(mockSetState).toHaveBeenCalledWith({ activeTab: 'format' });
    });

    it('should save metaschema tab', () => {
      vscode.setActiveTab('metaschema');
      expect(mockSetState).toHaveBeenCalledWith({ activeTab: 'metaschema' });
    });
  });
});
