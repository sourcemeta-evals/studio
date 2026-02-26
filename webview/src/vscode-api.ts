import type { TabType, WebviewState, WebviewToExtensionMessage, Position, PanelState } from '../../protocol/types';

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

const vsCodeApi = window.acquireVsCodeApi();

// Internal function - not exported
function postMessage(message: WebviewToExtensionMessage): void {
  vsCodeApi.postMessage(message);
}

// Higher-level methods exposed to the webview

export function openExternal(url: string): void {
  postMessage({ command: 'openExternal', url });
}

export function formatSchema(): void {
  postMessage({ command: 'formatSchema' });
}

export function goToPosition(position: Position): void {
  postMessage({ command: 'goToPosition', position });
}

export function getActiveTab(): TabType | undefined {
  const state = vsCodeApi.getState() as WebviewState | undefined;
  return state?.activeTab;
}

export function setActiveTab(tab: TabType): void {
  vsCodeApi.setState({ activeTab: tab } satisfies WebviewState);
}

// State update subscription - encapsulates the message event listener
type StateUpdateCallback = (state: PanelState) => void;

export function subscribeToStateUpdates(callback: StateUpdateCallback): () => void {
  const handleMessage = (event: MessageEvent) => {
    const message = event.data;
    if (message.type === 'update') {
      callback(message.state);
    }
  };

  window.addEventListener('message', handleMessage);

  // Return cleanup function
  return () => {
    window.removeEventListener('message', handleMessage);
  };
}
