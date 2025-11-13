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

  private postMessage(message: unknown): void {
    this.vsCodeApi.postMessage(message);
  }

  private getState(): unknown {
    return this.vsCodeApi.getState();
  }

  private setState(state: unknown): void {
    this.vsCodeApi.setState(state);
  }

  /**
   * Open an external URL in the default browser
   */
  public openExternal(url: string): void {
    this.postMessage({ command: 'openExternal', url });
  }

  /**
   * Request the extension to format the current schema file
   */
  public formatSchema(): void {
    this.postMessage({ command: 'formatSchema' });
  }

  /**
   * Navigate to a specific position in the editor
   * @param position [lineStart, colStart, lineEnd, colEnd]
   */
  public goToPosition(position: [number, number, number, number]): void {
    this.postMessage({ command: 'goToPosition', position });
  }

  /**
   * Get the currently active tab from persisted state
   */
  public getActiveTab(): ActiveTab | undefined {
    const savedState = this.getState() as TabState | undefined;
    return savedState?.activeTab;
  }

  /**
   * Set the active tab and persist it to state
   */
  public setActiveTab(tab: ActiveTab): void {
    this.setState({ activeTab: tab });
  }
}

export const vscode = new VSCodeAPIWrapper();
