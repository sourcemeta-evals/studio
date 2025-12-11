import { vi } from 'vitest';

export const mockPostMessage = vi.fn();
export const mockGetState = vi.fn();
export const mockSetState = vi.fn();

Object.defineProperty(window, 'acquireVsCodeApi', {
  value: () => ({
    postMessage: mockPostMessage,
    getState: mockGetState,
    setState: mockSetState,
  }),
  writable: true,
});
