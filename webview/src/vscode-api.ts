import type { WebviewMessage } from '../../shared/types';

declare global {
  interface Window {
    acquireVsCodeApi: () => {
      postMessage(message: unknown): void;
      getState(): unknown;
      setState(state: unknown): void;
    };
  }
}

type TabType = 'lint' | 'format' | 'metaschema';

interface WebviewState {
  activeTab?: TabType;
}

class VSCodeAPIWrapper {
  private readonly vsCodeApi = window.acquireVsCodeApi();

  private postMessage(message: WebviewMessage): void {
    this.vsCodeApi.postMessage(message);
  }

  private getState(): WebviewState | undefined {
    return this.vsCodeApi.getState() as WebviewState | undefined;
  }

  private setState(state: WebviewState): void {
    this.vsCodeApi.setState(state);
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

  public getActiveTab(): TabType | undefined {
    const state = this.getState();
    return state?.activeTab;
  }

  public setActiveTab(tab: TabType): void {
    this.setState({ activeTab: tab });
  }
}

export const vscode = new VSCodeAPIWrapper();
