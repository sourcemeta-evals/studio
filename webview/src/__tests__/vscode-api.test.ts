import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import type { TabType } from '../vscode-api';

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
  let vscode: typeof import('../vscode-api').vscode;

  beforeAll(async () => {
    const module = await import('../vscode-api');
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
        url,
      });
    });

    it('should handle different URLs', () => {
      const url = 'https://github.com/sourcemeta/studio';
      vscode.openExternal(url);

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
        position,
      });
    });

    it('should handle different positions', () => {
      const position: [number, number, number, number] = [10, 5, 15, 20];
      vscode.goToPosition(position);

      expect(mockPostMessage).toHaveBeenCalledWith({
        command: 'goToPosition',
        position: [10, 5, 15, 20],
      });
    });
  });

  describe('getActiveTab', () => {
    it('should return activeTab from state when present', () => {
      mockGetState.mockReturnValue({ activeTab: 'lint' });

      const result = vscode.getActiveTab();

      expect(result).toBe('lint');
      expect(mockGetState).toHaveBeenCalled();
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

    it('should handle all tab types', () => {
      const tabTypes: TabType[] = ['lint', 'format', 'metaschema'];

      tabTypes.forEach((tab) => {
        mockGetState.mockReturnValue({ activeTab: tab });
        expect(vscode.getActiveTab()).toBe(tab);
      });
    });
  });

  describe('setActiveTab', () => {
    it('should set state with activeTab', () => {
      vscode.setActiveTab('lint');

      expect(mockSetState).toHaveBeenCalledWith({ activeTab: 'lint' });
    });

    it('should handle all tab types', () => {
      const tabTypes: TabType[] = ['lint', 'format', 'metaschema'];

      tabTypes.forEach((tab) => {
        vscode.setActiveTab(tab);
        expect(mockSetState).toHaveBeenCalledWith({ activeTab: tab });
      });
    });
  });
});
