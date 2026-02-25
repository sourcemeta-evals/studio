declare global {
  interface Window {
    acquireVsCodeApi: () => {
      postMessage(message: unknown): void;
      getState(): unknown;
      setState(state: unknown): void;
    };
  }
}

export type ActiveTab = 'lint' | 'format' | 'metaschema';
export type EditorPosition = [number, number, number, number];

interface WebviewState {
  activeTab?: ActiveTab;
}

class VSCodeAPIWrapper {
  private readonly vsCodeApi = window.acquireVsCodeApi();

  private postMessage(message: unknown): void {
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

  public goToPosition(position: EditorPosition): void {
    this.postMessage({ command: 'goToPosition', position });
  }

  public getActiveTab(): ActiveTab | undefined {
    return this.getState()?.activeTab;
  }

  public setActiveTab(activeTab: ActiveTab): void {
    this.setState({ activeTab });
  }
}

export const vscode = new VSCodeAPIWrapper();
