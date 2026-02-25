type EditorTab = 'lint' | 'format' | 'metaschema';
type Position = [number, number, number, number];

type VSCodeMessage =
  | { command: 'openExternal'; url: string }
  | { command: 'formatSchema' }
  | { command: 'goToPosition'; position: Position };

interface VSCodeState {
  activeTab?: EditorTab;
}

declare global {
  interface Window {
    acquireVsCodeApi: () => {
      postMessage(message: VSCodeMessage): void;
      getState(): unknown;
      setState(state: VSCodeState): void;
    };
  }
}

class VSCodeAPIWrapper {
  private readonly vsCodeApi = window.acquireVsCodeApi();

  private postMessage(message: VSCodeMessage): void {
    this.vsCodeApi.postMessage(message);
  }

  public openExternal(url: string): void {
    this.postMessage({ command: 'openExternal', url });
  }

  public formatSchema(): void {
    this.postMessage({ command: 'formatSchema' });
  }

  public goToPosition(position: Position): void {
    this.postMessage({ command: 'goToPosition', position });
  }

  public getActiveTab(): EditorTab | undefined {
    const state = this.vsCodeApi.getState() as VSCodeState | undefined;
    return state?.activeTab;
  }

  public setActiveTab(activeTab: EditorTab): void {
    this.vsCodeApi.setState({ activeTab });
  }
}

export const vscode = new VSCodeAPIWrapper();
