import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockPostMessage, mockGetState, mockSetState } from './test-setup';
import { vscode, type TabType } from './vscode-api';

describe('VSCodeAPIWrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('openExternal', () => {
    it('should post message with openExternal command and url', () => {
      const url = 'https://example.com';
      vscode.openExternal(url);

      expect(mockPostMessage).toHaveBeenCalledTimes(1);
      expect(mockPostMessage).toHaveBeenCalledWith({
        command: 'openExternal',
        url: 'https://example.com',
      });
    });

    it('should handle different URLs', () => {
      vscode.openExternal('https://github.com/sourcemeta/studio');

      expect(mockPostMessage).toHaveBeenCalledWith({
        command: 'openExternal',
        url: 'https://github.com/sourcemeta/studio',
      });
    });
  });

  describe('formatSchema', () => {
    it('should post message with formatSchema command', () => {
      vscode.formatSchema();

      expect(mockPostMessage).toHaveBeenCalledTimes(1);
      expect(mockPostMessage).toHaveBeenCalledWith({
        command: 'formatSchema',
      });
    });
  });

  describe('goToPosition', () => {
    it('should post message with goToPosition command and position', () => {
      const position: [number, number, number, number] = [10, 5, 10, 15];
      vscode.goToPosition(position);

      expect(mockPostMessage).toHaveBeenCalledTimes(1);
      expect(mockPostMessage).toHaveBeenCalledWith({
        command: 'goToPosition',
        position: [10, 5, 10, 15],
      });
    });

    it('should handle different positions', () => {
      const position: [number, number, number, number] = [1, 1, 5, 20];
      vscode.goToPosition(position);

      expect(mockPostMessage).toHaveBeenCalledWith({
        command: 'goToPosition',
        position: [1, 1, 5, 20],
      });
    });
  });

  describe('getActiveTab', () => {
    it('should return activeTab from state when present', () => {
      mockGetState.mockReturnValue({ activeTab: 'lint' });

      const result = vscode.getActiveTab();

      expect(mockGetState).toHaveBeenCalledTimes(1);
      expect(result).toBe('lint');
    });

    it('should return undefined when state is undefined', () => {
      mockGetState.mockReturnValue(undefined);

      const result = vscode.getActiveTab();

      expect(result).toBeUndefined();
    });

    it('should return undefined when activeTab is not in state', () => {
      mockGetState.mockReturnValue({});

      const result = vscode.getActiveTab();

      expect(result).toBeUndefined();
    });

    it('should return different tab types', () => {
      const tabTypes: TabType[] = ['lint', 'format', 'metaschema'];

      for (const tab of tabTypes) {
        mockGetState.mockReturnValue({ activeTab: tab });
        expect(vscode.getActiveTab()).toBe(tab);
      }
    });
  });

  describe('setActiveTab', () => {
    it('should set state with activeTab', () => {
      vscode.setActiveTab('lint');

      expect(mockSetState).toHaveBeenCalledTimes(1);
      expect(mockSetState).toHaveBeenCalledWith({ activeTab: 'lint' });
    });

    it('should handle different tab types', () => {
      const tabTypes: TabType[] = ['lint', 'format', 'metaschema'];

      for (const tab of tabTypes) {
        mockSetState.mockClear();
        vscode.setActiveTab(tab);
        expect(mockSetState).toHaveBeenCalledWith({ activeTab: tab });
      }
    });
  });
});
