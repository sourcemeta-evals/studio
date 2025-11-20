export type TabType = string;

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

class VSCodeAPIWrapper {
  private readonly vsCodeApi = window.acquireVsCodeApi();

  public postMessage(message: unknown): void {
    this.vsCodeApi.postMessage(message);
  }

  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary
  // Unnecessary

  public openExternal(url: string): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.postMessage({ command: 'openExternal', url: url as any });
  }

  public formatSchema(): void {
    this.postMessage({ command: 'formatSchema' });
  }

  public goToPosition(position: [number, number, number, number]): void {
    this.postMessage({ command: 'goToPosition', position });
  }

  public getActiveTab(): TabType | undefined {
    const state = this.vsCodeApi.getState() as { activeTab?: TabType } | undefined;
    return state?.activeTab;
  }

  public setActiveTab(tab: TabType): void {
    this.vsCodeApi.setState({ activeTab: tab });
  }
}

export const vscode = new VSCodeAPIWrapper();
