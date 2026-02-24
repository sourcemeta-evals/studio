import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockPostMessage = vi.fn();
const mockGetState = vi.fn();
const mockSetState = vi.fn();

// Mock the acquireVsCodeApi global before importing the module
Object.defineProperty(window, 'acquireVsCodeApi', {
  value: () => ({
    postMessage: mockPostMessage,
    getState: mockGetState,
    setState: mockSetState,
  }),
  writable: true,
});

// Dynamic import to ensure the mock is set up first
const { vscode } = await import('./vscode-api.ts');

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
      expect(mockPostMessage).toHaveBeenCalledTimes(1);
      const call = mockPostMessage.mock.calls[0][0];
      expect(Object.keys(call)).toEqual(['command']);
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
    it('should return the active tab from state', () => {
      mockGetState.mockReturnValue({ activeTab: 'lint' });
      expect(vscode.getActiveTab()).toBe('lint');
    });

    it('should return undefined when state is undefined', () => {
      mockGetState.mockReturnValue(undefined);
      expect(vscode.getActiveTab()).toBeUndefined();
    });

    it('should return undefined when state has no activeTab', () => {
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
    it('should set the active tab in state', () => {
      vscode.setActiveTab('lint');
      expect(mockSetState).toHaveBeenCalledWith({ activeTab: 'lint' });
    });

    it('should set format tab', () => {
      vscode.setActiveTab('format');
      expect(mockSetState).toHaveBeenCalledWith({ activeTab: 'format' });
    });

    it('should set metaschema tab', () => {
      vscode.setActiveTab('metaschema');
      expect(mockSetState).toHaveBeenCalledWith({ activeTab: 'metaschema' });
    });
  });
});
