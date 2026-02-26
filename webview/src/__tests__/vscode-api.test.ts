// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock acquireVsCodeApi before importing the module
const mockPostMessage = vi.fn();
const mockGetState = vi.fn();
const mockSetState = vi.fn();

window.acquireVsCodeApi = () => ({
  postMessage: mockPostMessage,
  getState: mockGetState,
  setState: mockSetState,
});

// Dynamic import so the mock is in place first
const { openExternal, formatSchema, goToPosition, getActiveTab, setActiveTab } =
  await import('../vscode-api');

describe('vscode-api', () => {
  beforeEach(() => {
    mockPostMessage.mockClear();
    mockGetState.mockClear();
    mockSetState.mockClear();
  });

  describe('openExternal', () => {
    it('should post an openExternal message with the given URL', () => {
      openExternal('https://example.com');
      expect(mockPostMessage).toHaveBeenCalledWith({
        command: 'openExternal',
        url: 'https://example.com',
      });
    });
  });

  describe('formatSchema', () => {
    it('should post a formatSchema message', () => {
      formatSchema();
      expect(mockPostMessage).toHaveBeenCalledWith({
        command: 'formatSchema',
      });
    });
  });

  describe('goToPosition', () => {
    it('should post a goToPosition message with the given position', () => {
      const position: [number, number, number, number] = [1, 2, 3, 4];
      goToPosition(position);
      expect(mockPostMessage).toHaveBeenCalledWith({
        command: 'goToPosition',
        position: [1, 2, 3, 4],
      });
    });
  });

  describe('getActiveTab', () => {
    it('should return the active tab from state', () => {
      mockGetState.mockReturnValue({ activeTab: 'format' });
      expect(getActiveTab()).toBe('format');
    });

    it('should return undefined when state is undefined', () => {
      mockGetState.mockReturnValue(undefined);
      expect(getActiveTab()).toBeUndefined();
    });

    it('should return undefined when state has no activeTab', () => {
      mockGetState.mockReturnValue({});
      expect(getActiveTab()).toBeUndefined();
    });
  });

  describe('setActiveTab', () => {
    it('should set the active tab in state', () => {
      setActiveTab('lint');
      expect(mockSetState).toHaveBeenCalledWith({ activeTab: 'lint' });
    });

    it('should set metaschema as active tab', () => {
      setActiveTab('metaschema');
      expect(mockSetState).toHaveBeenCalledWith({ activeTab: 'metaschema' });
    });
  });
});
