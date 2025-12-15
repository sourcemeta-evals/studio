import { describe, it, beforeEach, expect, vi } from 'vitest';
import { mockPostMessage, mockGetState, mockSetState } from './setup';
import { vscode } from '../../webview/src/vscode-api';

describe('VSCodeAPIWrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('openExternal', () => {
    it('should post message with openExternal command and url', () => {
      const url = 'https://example.com';
      vscode.openExternal(url);

      expect(mockPostMessage).toHaveBeenCalledWith({
        command: 'openExternal',
        url: 'https://example.com',
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
        position: [1, 2, 3, 4],
      });
    });
  });

  describe('getActiveTab', () => {
    it('should return activeTab from state', () => {
      mockGetState.mockReturnValue({ activeTab: 'lint' });

      const result = vscode.getActiveTab();

      expect(result).toBe('lint');
    });

    it('should return undefined when state is undefined', () => {
      mockGetState.mockReturnValue(undefined);

      const result = vscode.getActiveTab();

      expect(result).toBeUndefined();
    });

    it('should return undefined when activeTab is not set', () => {
      mockGetState.mockReturnValue({});

      const result = vscode.getActiveTab();

      expect(result).toBeUndefined();
    });
  });

  describe('setActiveTab', () => {
    it('should set state with activeTab', () => {
      vscode.setActiveTab('format');

      expect(mockSetState).toHaveBeenCalledWith({ activeTab: 'format' });
    });

    it('should set state with metaschema tab', () => {
      vscode.setActiveTab('metaschema');

      expect(mockSetState).toHaveBeenCalledWith({ activeTab: 'metaschema' });
    });
  });
});
