import type { TabType, WebviewState, WebviewToExtensionMessage, Position } from '../../protocol/types';

interface VSCodeAPI {
  postMessage(message: unknown): void;
  getState(): unknown;
  setState(state: unknown): void;
}

declare global {
  interface Window {
    acquireVsCodeApi: () => VSCodeAPI;
  }
}

// Module-level shared API instance (defeats encapsulation purpose)
const vsCodeApi = window.acquireVsCodeApi();

export function openExternal(url: string): void {
  // BUG: Wrong command name - should be 'openExternal' not 'open'
  vsCodeApi.postMessage({ command: 'open', url } as WebviewToExtensionMessage);
}

export function formatSchema(): void {
  // BUG: Sends empty object instead of proper command
  vsCodeApi.postMessage({} as WebviewToExtensionMessage);
}

export function goToPosition(position: Position): void {
  // BUG: Wrong property name - should be 'position' not 'pos'
  vsCodeApi.postMessage({ command: 'goToPosition', pos: position } as any);
}

export function getActiveTab(): TabType | undefined {
  // BUG: Always returns undefined instead of reading state
  return undefined;
}

export function setActiveTab(tab: TabType): void {
  // BUG: Wrong state key - should be 'activeTab' not 'tab'
  vsCodeApi.setState({ tab: tab } as any);
}
