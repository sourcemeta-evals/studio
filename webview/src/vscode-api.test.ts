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
      const tab: TabType = 'format';
      vscode.setActiveTab(tab);
      expect(mockSetState).toHaveBeenCalledWith({ activeTab: tab });
    });

    it('should work with all tab types', () => {
      const tabs: TabType[] = ['lint', 'format', 'metaschema'];
      tabs.forEach((tab) => {
        vscode.setActiveTab(tab);
        expect(mockSetState).toHaveBeenCalledWith({ activeTab: tab });
      });
    });
  });
});
