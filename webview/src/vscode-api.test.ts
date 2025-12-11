import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import type { TabType } from './vscode-api';

const mockPostMessage = vi.fn();
const mockGetState = vi.fn();
const mockSetState = vi.fn();

beforeAll(() => {
  (globalThis as unknown as { window: { acquireVsCodeApi: () => unknown } }).window = {
    acquireVsCodeApi: () => ({
      postMessage: mockPostMessage,
      getState: mockGetState,
      setState: mockSetState,
    }),
  };
});

describe('VSCodeAPIWrapper', () => {
  let vscode: { openExternal: (url: string) => void; formatSchema: () => void; goToPosition: (position: [number, number, number, number]) => void; getActiveTab: () => TabType | undefined; setActiveTab: (tab: TabType) => void };

  beforeAll(async () => {
    const module = await import('./vscode-api');
    vscode = module.vscode;
  });

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

    it('should handle different positions', () => {
      const position: [number, number, number, number] = [10, 20, 30, 40];
      vscode.goToPosition(position);
      
      expect(mockPostMessage).toHaveBeenCalledWith({
        command: 'goToPosition',
        position: [10, 20, 30, 40],
      });
    });
  });

  describe('getActiveTab', () => {
    it('should return undefined when no state is saved', () => {
      mockGetState.mockReturnValue(undefined);
      
      const result = vscode.getActiveTab();
      
      expect(result).toBeUndefined();
    });

    it('should return undefined when state has no activeTab', () => {
      mockGetState.mockReturnValue({});
      
      const result = vscode.getActiveTab();
      
      expect(result).toBeUndefined();
    });

    it('should return the saved active tab', () => {
      mockGetState.mockReturnValue({ activeTab: 'lint' });
      
      const result = vscode.getActiveTab();
      
      expect(result).toBe('lint');
    });

    it('should return different tab types', () => {
      const tabs: TabType[] = ['lint', 'format', 'metaschema'];
      
      for (const tab of tabs) {
        mockGetState.mockReturnValue({ activeTab: tab });
        expect(vscode.getActiveTab()).toBe(tab);
      }
    });
  });

  describe('setActiveTab', () => {
    it('should set state with activeTab', () => {
      vscode.setActiveTab('lint');
      
      expect(mockSetState).toHaveBeenCalledWith({ activeTab: 'lint' });
    });

    it('should handle different tab types', () => {
      const tabs: TabType[] = ['lint', 'format', 'metaschema'];
      
      for (const tab of tabs) {
        vscode.setActiveTab(tab);
        expect(mockSetState).toHaveBeenCalledWith({ activeTab: tab });
      }
    });
  });
});
