import type { ActiveTab, WebviewMessage } from '../../shared/types';

interface VSCodeApi {
  postMessage(message: WebviewMessage): void;
  getState(): unknown;
  setState(state: unknown): void;
}

type VSCodeGlobal = typeof globalThis & {
  acquireVsCodeApi?: () => VSCodeApi;
};

const FALLBACK_ACTIVE_TAB: ActiveTab = 'lint';

function isActiveTab(value: unknown): value is ActiveTab {
  return value === 'lint' || value === 'format' || value === 'metaschema';
}

function acquireVsCodeApi(): VSCodeApi | undefined {
  const vscodeGlobal = globalThis as VSCodeGlobal;

  if (typeof vscodeGlobal.acquireVsCodeApi !== 'function') {
    return undefined;
  }

  return vscodeGlobal.acquireVsCodeApi();
}

export class VSCodeAPIWrapper {
  private readonly vsCodeApi: VSCodeApi | undefined;

  constructor(vsCodeApi: VSCodeApi | undefined = acquireVsCodeApi()) {
    this.vsCodeApi = vsCodeApi;
  }

  private postMessage(message: WebviewMessage): void {
    this.vsCodeApi?.postMessage(message);
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

  public getActiveTab(): ActiveTab {
    const state = this.vsCodeApi?.getState() as { activeTab?: unknown } | undefined;
    return isActiveTab(state?.activeTab) ? state.activeTab : FALLBACK_ACTIVE_TAB;
  }

  public setActiveTab(activeTab: ActiveTab): void {
    this.vsCodeApi?.setState({ activeTab });
  }
}

export const vscode = new VSCodeAPIWrapper();
