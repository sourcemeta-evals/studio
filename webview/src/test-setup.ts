import { vi } from 'vitest';

const mockPostMessage = vi.fn();
const mockGetState = vi.fn();
const mockSetState = vi.fn();

const mockVsCodeApi = {
  postMessage: mockPostMessage,
  getState: mockGetState,
  setState: mockSetState,
};

Object.defineProperty(window, 'acquireVsCodeApi', {
  value: () => mockVsCodeApi,
  writable: true,
  configurable: true,
});

export { mockPostMessage, mockGetState, mockSetState, mockVsCodeApi };
