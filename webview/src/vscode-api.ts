/**
 * VS Code API Abstraction Layer
 *
 * This module encapsulates the VS Code webview message passing and state
 * management APIs. Instead of exposing low-level primitives like `postMessage`,
 * `getState`, and `setState`, it only exposes high-level, domain-specific
 * methods:
 *
 * - `openExternal(url)` - Opens a URL in the user's default browser
 * - `formatSchema()` - Requests the extension to format the current schema
 * - `goToPosition(position)` - Navigates to a specific line/column in the editor
 * - `getActiveTab()` - Retrieves the currently active tab from persisted state
 * - `setActiveTab(tab)` - Persists the active tab selection
 *
 * This abstraction allows the webview to be more easily ported to other editors
 * (e.g., JetBrains IDEs, Sublime Text) in the future, as only this module needs
 * to be adapted to the target editor's message and state passing mechanisms.
 */

import type { TabType, WebviewState, WebviewToExtensionMessage, Position } from '../../protocol/types';

/**
 * Internal VS Code API interface
 * @internal - Not exposed to consumers
 */
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

// Internal VS Code API instance - not exported
const vsCodeApi = window.acquireVsCodeApi();

/**
 * Internal helper to send typed messages to the extension
 * @internal - Not exposed to consumers
 */
function postMessage(message: WebviewToExtensionMessage): void {
  vsCodeApi.postMessage(message);
}

/**
 * Opens a URL in the user's default browser.
 * @param url - The URL to open
 */
export function openExternal(url: string): void {
  postMessage({ command: 'openExternal', url });
}

/**
 * Requests the extension to format the current schema file.
 */
export function formatSchema(): void {
  postMessage({ command: 'formatSchema' });
}

/**
 * Navigates the editor cursor to a specific position in the document.
 * @param position - The line and column to navigate to [line, column]
 */
export function goToPosition(position: Position): void {
  postMessage({ command: 'goToPosition', position });
}

/**
 * Retrieves the currently active tab from persisted webview state.
 * @returns The active tab type, or undefined if no state is saved
 */
export function getActiveTab(): TabType | undefined {
  const state = vsCodeApi.getState() as WebviewState | undefined;
  return state?.activeTab;
}

/**
 * Persists the active tab selection to webview state.
 * This state survives webview panel hide/show cycles.
 * @param tab - The tab type to set as active
 */
export function setActiveTab(tab: TabType): void {
  vsCodeApi.setState({ activeTab: tab } satisfies WebviewState);
}
