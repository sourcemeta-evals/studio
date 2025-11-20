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

interface TabState {
  activeTab?: TabType;
}

class VSCodeAPIWrapper {
  private readonly vsCodeApi = window.acquireVsCodeApi();

  public openExternal(url: string): void {
    const message: WebviewMessage = {
      command: 'openExternal',
      url
    };
    this.vsCodeApi.postMessage(message);
  }

  public formatSchema(): void {
    const message: WebviewMessage = {
      command: 'formatSchema'
    };
    this.vsCodeApi.postMessage(message);
  }

  public goToPosition(position: [number, number, number, number]): void {
    const message: WebviewMessage = {
      command: 'goToPosition',
      position
    };
    this.vsCodeApi.postMessage(message);
  }

  public getActiveTab(): TabType | undefined {
    const state = this.vsCodeApi.getState() as TabState | undefined;
    return state?.activeTab;
  }

  public setActiveTab(tab: TabType): void {
    this.vsCodeApi.setState({ activeTab: tab });
  }
}

export const vscode = new VSCodeAPIWrapper();
