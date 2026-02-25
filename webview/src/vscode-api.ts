import type { WebviewMessage } from '../../shared/types.ts';

export type ActiveTab = 'lint' | 'format' | 'metaschema';

type VSCodeWebviewState = {
  activeTab?: ActiveTab;
};

declare global {
  interface Window {
    acquireVsCodeApi: () => {
      postMessage(message: unknown): void;
      getState(): unknown;
      setState(state: unknown): void;
    };
  }
}

class VSCodeAPIWrapper {
  private readonly vsCodeApi = window.acquireVsCodeApi();

  private postMessage(message: WebviewMessage): void {
    this.vsCodeApi.postMessage(message);
  }

  public openExternal(url: string): void {
    this.postMessage({ command: 'openExternal', url });
  }

  public formatSchema(): void {
    this.postMessage({ command: 'formatSchema' });
  }

  public goToPosition(position: [number, number, number, number]): void {
    this.postMessage({ command: 'goToPosition', position });
  }

  public getActiveTab(): ActiveTab | undefined {
    const state = this.vsCodeApi.getState() as VSCodeWebviewState | undefined;
    if (!state?.activeTab) {
      return undefined;
    }

    if (state.activeTab === 'lint' || state.activeTab === 'format' || state.activeTab === 'metaschema') {
      return state.activeTab;
    }

    return undefined;
  }

  public setActiveTab(activeTab: ActiveTab): void {
    this.vsCodeApi.setState({ activeTab });
  }
}

export const vscode = new VSCodeAPIWrapper();
