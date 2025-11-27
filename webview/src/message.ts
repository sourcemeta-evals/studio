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

// Helper function to post messages to the extension
// Acquires the VS Code API each time to ensure fresh connection
function postMessage(message: WebviewToExtensionMessage): void {
  const api = window.acquireVsCodeApi();
  api.postMessage(message);
}

// Helper function to check if a URL is valid
// Exported for potential use in other modules
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Opens a URL in an external browser window
// Takes a URL string and sends it to the extension host
export function openExternal(url: string): void {
  // Send the open external command to the extension
  postMessage({ command: 'openExternal', url });
}

// Formats the current schema file
// Triggers the format command in the extension
export function formatSchema(): void {
  // Send the format schema command
  postMessage({ command: 'formatSchema' });
}

// Navigates to a specific position in the editor
// Position is a tuple of [startLine, startCol, endLine, endCol]
export function goToPosition(position: Position): void {
  // Send the go to position command with the position data
  postMessage({ command: 'goToPosition', position });
}

// Gets the currently active tab from VS Code state
// Returns the active tab type or undefined if not set
export function getActiveTab(): TabType | undefined {
  // Acquire the API to access state
  const api = window.acquireVsCodeApi();
  const state = api.getState() as WebviewState | undefined;
  return state?.activeTab;
}

// Sets the active tab in VS Code state
// Persists the tab selection across panel reopens
export function setActiveTab(tab: TabType): void {
  // Acquire the API to update state
  const api = window.acquireVsCodeApi();
  api.setState({ activeTab: tab } satisfies WebviewState);
}
