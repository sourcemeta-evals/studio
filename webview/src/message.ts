import type { TabType, WebviewState, WebviewToExtensionMessage, Position } from '../../protocol/types';

export type { TabType };

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

// Original class-based implementation
class VSCodeAPIWrapper {
  private readonly vsCodeApi = window.acquireVsCodeApi();

  private postMessage(message: WebviewToExtensionMessage): void {
    this.vsCodeApi.postMessage(message);
  }

  public openExternal(url: string): void {
    this.postMessage({ command: 'openExternal', url });
  }

  public formatSchema(): void {
    this.postMessage({ command: 'formatSchema' });
  }

  public goToPosition(position: Position): void {
    this.postMessage({ command: 'goToPosition', position });
  }

  public getActiveTab(): TabType | undefined {
    const state = this.vsCodeApi.getState() as WebviewState | undefined;
    return state?.activeTab;
  }

  public setActiveTab(tab: TabType): void {
    this.vsCodeApi.setState({ activeTab: tab } satisfies WebviewState);
  }
}

export const vscode = new VSCodeAPIWrapper();

// New direct export functions - stub implementations
// TODO: Implement these properly
export function openExternal(url: string): void {
  console.log('openExternal called with:', url);
  // Implementation pending
}

export function formatSchema(): void {
  console.log('formatSchema called');
  // Implementation pending
}

export function goToPosition(position: Position): void {
  console.log('goToPosition called with:', position);
  // Implementation pending
}

export function getActiveTab(): TabType | undefined {
  console.log('getActiveTab called');
  // TODO: Implement state retrieval
  return undefined;
}

export function setActiveTab(tab: TabType): void {
  console.log('setActiveTab called with:', tab);
  // TODO: Implement state persistence
}
