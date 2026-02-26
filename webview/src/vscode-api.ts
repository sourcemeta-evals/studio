import type { WebviewMessage } from '../../shared/types.ts';

export type ActiveTab = 'lint' | 'format' | 'metaschema';
type CursorPosition = [number, number, number, number];

type VSCodeState = {
  activeTab?: ActiveTab;
};

declare global {
  interface Window {
    acquireVsCodeApi: () => {
      postMessage(message: unknown): void;
      getState(): unknown;
      setState(state: unknown): void;
    };
  }
}

function isActiveTab(value: unknown): value is ActiveTab {
  return value === 'lint' || value === 'format' || value === 'metaschema';
}

class VSCodeAPIWrapper {
  private readonly vsCodeApi = window.acquireVsCodeApi();

  private postMessage(message: WebviewMessage): void {
    this.vsCodeApi.postMessage(message);
  }

  private getState(): VSCodeState {
    const state = this.vsCodeApi.getState();
    return typeof state === 'object' && state !== null ? state as VSCodeState : {};
  }

  private setState(state: VSCodeState): void {
    this.vsCodeApi.setState(state);
  }

  public openExternal(url: string): void {
    this.postMessage({ command: 'openExternal', url });
  }

  public formatSchema(): void {
    this.postMessage({ command: 'formatSchema' });
  }

  public goToPosition(position: CursorPosition): void {
    this.postMessage({ command: 'goToPosition', position });
  }

  public getActiveTab(): ActiveTab | undefined {
    const { activeTab } = this.getState();
    return isActiveTab(activeTab) ? activeTab : undefined;
  }

  public setActiveTab(activeTab: ActiveTab): void {
    this.setState({ ...this.getState(), activeTab });
  }
}

export const vscode = new VSCodeAPIWrapper();
