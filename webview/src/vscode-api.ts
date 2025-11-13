declare global {
  interface Window {
    acquireVsCodeApi: () => {
      postMessage(message: unknown): void;
      getState(): unknown;
      setState(state: unknown): void;
    };
  }
}

interface ActiveTabState {
  activeTab?: 'lint' | 'format' | 'metaschema';
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


  public openExternal(url: string): void {
    this.postMessage({ command: 'openExternal', url });
  }

  public formatSchema(): void {
    this.postMessage({ command: 'formatSchema' });
  }

  public goToPosition(position: [number, number, number, number]): void {
    this.postMessage({ command: 'goToPosition', position });
  }

  public getActiveTab(): 'lint' | 'format' | 'metaschema' | undefined {
    const state = this.getState() as ActiveTabState | undefined;
    return state?.activeTab;
  }

  public setActiveTab(tab: 'lint' | 'format' | 'metaschema'): void {
    this.setState({ activeTab: tab });
  }
}

export const vscode = new VSCodeAPIWrapper();
