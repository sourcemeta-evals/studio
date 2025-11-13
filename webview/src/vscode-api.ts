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

interface StoredState {
  activeTab?: ActiveTab;
}

class VSCodeAPIWrapper {
  private readonly vsCodeApi = window.acquireVsCodeApi();

  /**
   * Open an external URL in the default browser
   */
  public openExternal(url: string): void {
    this.vsCodeApi.postMessage({ command: 'openExternal', url });
  }

  /**
   * Format the current schema file
   */
  public formatSchema(): void {
    this.vsCodeApi.postMessage({ command: 'formatSchema' });
  }

  /**
   * Navigate to a specific position in the editor
   * @param position [lineStart, colStart, lineEnd, colEnd]
   */
  public goToPosition(position: [number, number, number, number]): void {
    this.vsCodeApi.postMessage({ command: 'goToPosition', position });
  }

  /**
   * Get the currently active tab from stored state
   */
  public getActiveTab(): ActiveTab | undefined {
    const state = this.vsCodeApi.getState() as StoredState | undefined;
    return state?.activeTab;
  }

  /**
   * Set the currently active tab in stored state
   */
  public setActiveTab(tab: ActiveTab): void {
    this.vsCodeApi.setState({ activeTab: tab });
  }
}

export const vscode = new VSCodeAPIWrapper();
