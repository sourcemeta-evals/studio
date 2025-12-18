import * as assert from 'assert';

interface MockVSCodeApi {
    postMessage: (message: unknown) => void;
    getState: () => unknown;
    setState: (state: unknown) => void;
}

interface PostedMessage {
    command: string;
    position?: [number, number, number, number];
    url?: string;
}

type TabType = 'lint' | 'format' | 'metaschema';

interface WebviewState {
    activeTab?: TabType;
}

class VSCodeAPIWrapper {
    private readonly vsCodeApi: MockVSCodeApi;

    constructor(vsCodeApi: MockVSCodeApi) {
        this.vsCodeApi = vsCodeApi;
    }

    public openExternal(url: string): void {
        this.vsCodeApi.postMessage({ command: 'openExternal', url });
    }

    public formatSchema(): void {
        this.vsCodeApi.postMessage({ command: 'formatSchema' });
    }

    public goToPosition(position: [number, number, number, number]): void {
        this.vsCodeApi.postMessage({ command: 'goToPosition', position });
    }

    public getActiveTab(): TabType | undefined {
        const state = this.vsCodeApi.getState() as WebviewState | undefined;
        return state?.activeTab;
    }

    public setActiveTab(tab: TabType): void {
        this.vsCodeApi.setState({ activeTab: tab });
    }
}

suite('VSCode API Wrapper Test Suite', () => {
    let mockApi: MockVSCodeApi;
    let postedMessages: PostedMessage[];
    let currentState: unknown;
    let wrapper: VSCodeAPIWrapper;

    setup(() => {
        postedMessages = [];
        currentState = undefined;

        mockApi = {
            postMessage: (message: unknown) => {
                postedMessages.push(message as PostedMessage);
            },
            getState: () => currentState,
            setState: (state: unknown) => {
                currentState = state;
            }
        };

        wrapper = new VSCodeAPIWrapper(mockApi);
    });

    test('openExternal should post message with openExternal command and url', () => {
        wrapper.openExternal('https://example.com');
        
        assert.strictEqual(postedMessages.length, 1);
        assert.strictEqual(postedMessages[0].command, 'openExternal');
        assert.strictEqual(postedMessages[0].url, 'https://example.com');
    });

    test('formatSchema should post message with formatSchema command', () => {
        wrapper.formatSchema();
        
        assert.strictEqual(postedMessages.length, 1);
        assert.strictEqual(postedMessages[0].command, 'formatSchema');
    });

    test('goToPosition should post message with goToPosition command and position', () => {
        const position: [number, number, number, number] = [1, 2, 3, 4];
        
        wrapper.goToPosition(position);
        
        assert.strictEqual(postedMessages.length, 1);
        assert.strictEqual(postedMessages[0].command, 'goToPosition');
        assert.deepStrictEqual(postedMessages[0].position, [1, 2, 3, 4]);
    });

    test('getActiveTab should return undefined when no state is set', () => {
        const tab = wrapper.getActiveTab();
        
        assert.strictEqual(tab, undefined);
    });

    test('setActiveTab should save tab to state', () => {
        wrapper.setActiveTab('format');
        
        assert.deepStrictEqual(currentState, { activeTab: 'format' });
    });

    test('getActiveTab should return saved tab after setActiveTab', () => {
        wrapper.setActiveTab('metaschema');
        const tab = wrapper.getActiveTab();
        
        assert.strictEqual(tab, 'metaschema');
    });

    test('setActiveTab should work with lint tab', () => {
        wrapper.setActiveTab('lint');
        const tab = wrapper.getActiveTab();
        
        assert.strictEqual(tab, 'lint');
    });

    test('openExternal should handle different URLs', () => {
        wrapper.openExternal('https://github.com/sourcemeta/studio');
        wrapper.openExternal('https://www.sourcemeta.com/');
        
        assert.strictEqual(postedMessages.length, 2);
        assert.strictEqual(postedMessages[0].url, 'https://github.com/sourcemeta/studio');
        assert.strictEqual(postedMessages[1].url, 'https://www.sourcemeta.com/');
    });

    test('goToPosition should handle different positions', () => {
        const position1: [number, number, number, number] = [10, 5, 10, 20];
        const position2: [number, number, number, number] = [1, 1, 100, 50];
        
        wrapper.goToPosition(position1);
        wrapper.goToPosition(position2);
        
        assert.strictEqual(postedMessages.length, 2);
        assert.deepStrictEqual(postedMessages[0].position, [10, 5, 10, 20]);
        assert.deepStrictEqual(postedMessages[1].position, [1, 1, 100, 50]);
    });
});
