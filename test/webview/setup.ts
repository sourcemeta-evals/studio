import { vi } from 'vitest';

export const mockPostMessage = vi.fn();
export const mockGetState = vi.fn();
export const mockSetState = vi.fn();

export const mockVsCodeApi = {
  postMessage: mockPostMessage,
  getState: mockGetState,
  setState: mockSetState,
};

vi.stubGlobal('window', {
  acquireVsCodeApi: () => mockVsCodeApi,
});
