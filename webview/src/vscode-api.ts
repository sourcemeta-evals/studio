declare global {
  interface Window {
    acquireVsCodeApi: () => {
      postMessage(message: unknown): void;
      getState(): unknown;
      setState(state: unknown): void;
    };
  }
}

type ActiveTab = 'lint' | 'format' | 'metaschema';

interface TabState {
  activeTab?: ActiveTab;
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
    const state = this.vsCodeApi.getState() as TabState | undefined;
    return state?.activeTab;
  }

  public setActiveTab(tab: ActiveTab): void {
    this.vsCodeApi.setState({ activeTab: tab });
  }
}

export const vscode = new VSCodeAPIWrapper();
