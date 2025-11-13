export type TabType = 'lint' | 'format' | 'metaschema';

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

  private postMessage(message: unknown): void {
    this.vsCodeApi.postMessage(message);
  }

  public openExternal(url: string): void {
    // TODO: Implement this
    console.log('openExternal called with:', url);
  }

  public formatSchema(): void {
    // TODO: Implement this
    console.log('formatSchema called');
  }

  public goToPosition(position: [number, number, number, number]): void {
    // TODO: Implement this
    console.log('goToPosition called with:', position);
  }

  public getActiveTab(): TabType | undefined {
    // TODO: Implement this properly
    return 'lint';
  }

  public setActiveTab(tab: TabType): void {
    // TODO: Implement this
    console.log('setActiveTab called with:', tab);
  }
}

export const vscode = new VSCodeAPIWrapper();
