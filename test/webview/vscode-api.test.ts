import * as assert from 'assert';

interface MockVSCodeApi {
  postMessage: (message: unknown) => void;
  getState: () => unknown;
  setState: (state: unknown) => void;
}

interface PostedMessage {
  command: string;
  url?: string;
  position?: [number, number, number, number];
}

let mockApi: MockVSCodeApi;
let postedMessages: PostedMessage[] = [];
let currentState: unknown = undefined;

function createMockVSCodeApi(): MockVSCodeApi {
  return {
    postMessage: (message: unknown) => {
      postedMessages.push(message as PostedMessage);
    },
    getState: () => currentState,
    setState: (state: unknown) => {
      currentState = state;
    }
  };
}

declare global {
  interface Window {
    acquireVsCodeApi: () => MockVSCodeApi;
  }
}

(globalThis as unknown as { window: { acquireVsCodeApi: () => MockVSCodeApi } }).window = {
  acquireVsCodeApi: () => mockApi
};

class VSCodeAPIWrapper {
  private readonly vsCodeApi = (globalThis as unknown as { window: { acquireVsCodeApi: () => MockVSCodeApi } }).window.acquireVsCodeApi();

  public openExternal(url: string): void {
    this.vsCodeApi.postMessage({ command: 'openExternal', url });
  }

  public formatSchema(): void {
    this.vsCodeApi.postMessage({ command: 'formatSchema' });
  }

  public goToPosition(position: [number, number, number, number]): void {
    this.vsCodeApi.postMessage({ command: 'goToPosition', position });
  }

  public getActiveTab(): 'lint' | 'format' | 'metaschema' | undefined {
    const state = this.vsCodeApi.getState() as { activeTab?: 'lint' | 'format' | 'metaschema' } | undefined;
    return state?.activeTab;
  }

  public setActiveTab(tab: 'lint' | 'format' | 'metaschema'): void {
    this.vsCodeApi.setState({ activeTab: tab });
  }
}

suite('VSCode API Wrapper Test Suite', () => {
  let vscode: VSCodeAPIWrapper;

  setup(() => {
    postedMessages = [];
    currentState = undefined;
    mockApi = createMockVSCodeApi();
    vscode = new VSCodeAPIWrapper();
  });

  suite('openExternal', () => {
    test('should post openExternal message with URL', () => {
      const testUrl = 'https://example.com';
      vscode.openExternal(testUrl);

      assert.strictEqual(postedMessages.length, 1);
      assert.deepStrictEqual(postedMessages[0], {
        command: 'openExternal',
        url: testUrl
      });
    });

    test('should handle different URLs', () => {
      vscode.openExternal('https://github.com/sourcemeta/studio');
      vscode.openExternal('https://www.sourcemeta.com/');

      assert.strictEqual(postedMessages.length, 2);
      assert.strictEqual(postedMessages[0].url, 'https://github.com/sourcemeta/studio');
      assert.strictEqual(postedMessages[1].url, 'https://www.sourcemeta.com/');
    });
  });

  suite('formatSchema', () => {
    test('should post formatSchema message', () => {
      vscode.formatSchema();

      assert.strictEqual(postedMessages.length, 1);
      assert.deepStrictEqual(postedMessages[0], {
        command: 'formatSchema'
      });
    });
  });

  suite('goToPosition', () => {
    test('should post goToPosition message with position', () => {
      const position: [number, number, number, number] = [10, 5, 10, 15];
      vscode.goToPosition(position);

      assert.strictEqual(postedMessages.length, 1);
      assert.deepStrictEqual(postedMessages[0], {
        command: 'goToPosition',
        position: position
      });
    });

    test('should handle different positions', () => {
      vscode.goToPosition([1, 1, 1, 1]);
      vscode.goToPosition([100, 50, 105, 60]);

      assert.strictEqual(postedMessages.length, 2);
      assert.deepStrictEqual(postedMessages[0].position, [1, 1, 1, 1]);
      assert.deepStrictEqual(postedMessages[1].position, [100, 50, 105, 60]);
    });
  });

  suite('getActiveTab', () => {
    test('should return undefined when no state is set', () => {
      const result = vscode.getActiveTab();
      assert.strictEqual(result, undefined);
    });

    test('should return activeTab from state', () => {
      currentState = { activeTab: 'lint' };
      const result = vscode.getActiveTab();
      assert.strictEqual(result, 'lint');
    });

    test('should return different tab types', () => {
      currentState = { activeTab: 'format' };
      assert.strictEqual(vscode.getActiveTab(), 'format');

      currentState = { activeTab: 'metaschema' };
      assert.strictEqual(vscode.getActiveTab(), 'metaschema');
    });

    test('should return undefined when state has no activeTab', () => {
      currentState = {};
      const result = vscode.getActiveTab();
      assert.strictEqual(result, undefined);
    });
  });

  suite('setActiveTab', () => {
    test('should set activeTab in state', () => {
      vscode.setActiveTab('lint');
      assert.deepStrictEqual(currentState, { activeTab: 'lint' });
    });

    test('should set different tab types', () => {
      vscode.setActiveTab('format');
      assert.deepStrictEqual(currentState, { activeTab: 'format' });

      vscode.setActiveTab('metaschema');
      assert.deepStrictEqual(currentState, { activeTab: 'metaschema' });
    });
  });

  suite('encapsulation', () => {
    test('should not expose postMessage directly', () => {
      assert.strictEqual((vscode as unknown as { postMessage?: unknown }).postMessage, undefined);
    });

    test('should not expose getState directly', () => {
      assert.strictEqual((vscode as unknown as { getState?: unknown }).getState, undefined);
    });

    test('should not expose setState directly', () => {
      assert.strictEqual((vscode as unknown as { setState?: unknown }).setState, undefined);
    });
  });
});
