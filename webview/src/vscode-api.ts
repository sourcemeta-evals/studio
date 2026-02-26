import type { WebviewMessage } from '../../shared/types.ts';

type TabName = 'lint' | 'format' | 'metaschema';

declare global {
  interface Window {
    acquireVsCodeApi: () => {
      postMessage(message: unknown): void;
      getState(): unknown;
      setState(state: unknown): void;
    };
  }
}

class VSCodeAPIWrapper {
  private readonly vsCodeApi = window.acquireVsCodeApi();

  public openExternal(url: string): void {
    const message: WebviewMessage = { command: 'openExternal', url };
    this.vsCodeApi.postMessage(message);
  }

  public formatSchema(): void {
    const message: WebviewMessage = { command: 'formatSchema' };
    this.vsCodeApi.postMessage(message);
  }

  public goToPosition(position: [number, number, number, number]): void {
    const message: WebviewMessage = { command: 'goToPosition', position };
    this.vsCodeApi.postMessage(message);
  }

  public getActiveTab(): TabName | null {
    const state = this.vsCodeApi.getState() as { activeTab?: TabName } | undefined;
    return state?.activeTab ?? null;
  }

  public setActiveTab(tab: TabName): void {
    this.vsCodeApi.setState({ activeTab: tab });
  }
}

export const vscode = new VSCodeAPIWrapper();
