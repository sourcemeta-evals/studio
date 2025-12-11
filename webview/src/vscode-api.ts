export type TabType = 'lint' | 'format' | 'metaschema';

interface WebviewState {
  activeTab?: TabType;
}

declare global {
  interface Window {
    acquireVsCodeApi: () => {
      postMessage(message: unknown): void;
      getState(): WebviewState | undefined;
      setState(state: WebviewState): void;
    };
  }
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

  public getActiveTab(): TabType | undefined {
    const state = this.vsCodeApi.getState();
    return state?.activeTab;
  }

  public setActiveTab(tab: TabType): void {
    this.vsCodeApi.setState({ activeTab: tab });
  }
}

export const vscode = new VSCodeAPIWrapper();
