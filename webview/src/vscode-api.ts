import type { WebviewMessage } from '../../shared/types.ts';

export type ActiveTab = 'lint' | 'format' | 'metaschema';

interface VSCodeWebviewState {
  activeTab?: ActiveTab;
}

interface VSCodeApi {
  postMessage(message: WebviewMessage): void;
  getState(): unknown;
  setState(state: unknown): void;
}

declare global {
  interface Window {
    acquireVsCodeApi: () => VSCodeApi;
  }
}

function isActiveTab(tab: unknown): tab is ActiveTab {
  return tab === 'lint' || tab === 'format' || tab === 'metaschema';
}

class VSCodeAPIWrapper {
  private readonly vsCodeApi = window.acquireVsCodeApi();

  public openExternal(url: string): void {
    this.vsCodeApi.postMessage({ command: 'openExternal', url });
  }

  public formatSchema(): void {
    this.vsCodeApi.postMessage({ command: 'formatSchema' });
  }

  public goToPosition(position: [number, number, number, number]): void {
    this.vsCodeApi.postMessage({ command: 'goToPosition', position });
  }

  public getActiveTab(): ActiveTab | undefined {
    const state = this.vsCodeApi.getState() as VSCodeWebviewState | undefined;
    return isActiveTab(state?.activeTab) ? state.activeTab : undefined;
  }

  public setActiveTab(activeTab: ActiveTab): void {
    const state = this.vsCodeApi.getState();
    const existingState = typeof state === 'object' && state !== null ? state : {};

    this.vsCodeApi.setState({
      ...existingState,
      activeTab
    });
  }
}

export const vscode = new VSCodeAPIWrapper();
