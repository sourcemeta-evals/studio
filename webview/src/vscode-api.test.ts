import { describe, it, expect, beforeEach } from 'vitest';
import { mockPostMessage, mockGetState, mockSetState } from './test-setup';
import { vscode, type TabType } from './vscode-api';

describe('VSCodeAPIWrapper', () => {
  beforeEach(() => {
    mockPostMessage.mockClear();
    mockGetState.mockClear();
    mockSetState.mockClear();
  });

  describe('openExternal', () => {
    it('should post message with openExternal command and url', () => {
      const url = 'https://example.com';
      vscode.openExternal(url);
      expect(mockPostMessage).toHaveBeenCalledWith({
        command: 'openExternal',
        url,
      });
    });

    it('should handle different URLs', () => {
      const url = 'https://github.com/sourcemeta/studio';
      vscode.openExternal(url);
      expect(mockPostMessage).toHaveBeenCalledWith({
        command: 'openExternal',
        url,
      });
    });
  });

  describe('formatSchema', () => {
    it('should post message with formatSchema command', () => {
      vscode.formatSchema();
      expect(mockPostMessage).toHaveBeenCalledWith({
        command: 'formatSchema',
      });
    });
  });

  describe('goToPosition', () => {
    it('should post message with goToPosition command and position', () => {
      const position: [number, number, number, number] = [1, 2, 3, 4];
      vscode.goToPosition(position);
      expect(mockPostMessage).toHaveBeenCalledWith({
        command: 'goToPosition',
        position,
      });
    });

    it('should handle different positions', () => {
      const position: [number, number, number, number] = [10, 5, 15, 20];
      vscode.goToPosition(position);
      expect(mockPostMessage).toHaveBeenCalledWith({
        command: 'goToPosition',
        position,
      });
    });
  });

  describe('getActiveTab', () => {
    it('should return undefined when no state is saved', () => {
      mockGetState.mockReturnValue(undefined);
      const result = vscode.getActiveTab();
      expect(result).toBeUndefined();
    });

    it('should return the active tab from state', () => {
      mockGetState.mockReturnValue({ activeTab: 'lint' });
      const result = vscode.getActiveTab();
      expect(result).toBe('lint');
    });

    it('should return format tab when saved', () => {
      mockGetState.mockReturnValue({ activeTab: 'format' });
      const result = vscode.getActiveTab();
      expect(result).toBe('format');
    });

    it('should return metaschema tab when saved', () => {
      mockGetState.mockReturnValue({ activeTab: 'metaschema' });
      const result = vscode.getActiveTab();
      expect(result).toBe('metaschema');
    });
  });

  describe('setActiveTab', () => {
    it('should set state with lint tab', () => {
      const tab: TabType = 'lint';
      vscode.setActiveTab(tab);
      expect(mockSetState).toHaveBeenCalledWith({ activeTab: 'lint' });
    });

    it('should set state with format tab', () => {
      const tab: TabType = 'format';
      vscode.setActiveTab(tab);
      expect(mockSetState).toHaveBeenCalledWith({ activeTab: 'format' });
    });

    it('should set state with metaschema tab', () => {
      const tab: TabType = 'metaschema';
      vscode.setActiveTab(tab);
      expect(mockSetState).toHaveBeenCalledWith({ activeTab: 'metaschema' });
    });
  });
});
