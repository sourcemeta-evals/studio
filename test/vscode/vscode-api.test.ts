import * as assert from 'assert';

suite('VSCode API Wrapper Test Suite', () => {
    interface WebviewMessage {
        command: 'goToPosition' | 'formatSchema' | 'openExternal';
        position?: [number, number, number, number];
        url?: string;
    }

    type TabType = 'lint' | 'format' | 'metaschema';

    interface WebviewState {
        activeTab?: TabType;
    }

    class MockVSCodeAPIWrapper {
        private state: WebviewState = {};
        public messages: WebviewMessage[] = [];

        public openExternal(url: string): void {
            const message: WebviewMessage = { command: 'openExternal', url };
            this.messages.push(message);
        }

        public formatSchema(): void {
            const message: WebviewMessage = { command: 'formatSchema' };
            this.messages.push(message);
        }

        public goToPosition(position: [number, number, number, number]): void {
            const message: WebviewMessage = { command: 'goToPosition', position };
            this.messages.push(message);
        }

        public getActiveTab(): TabType | undefined {
            return this.state.activeTab;
        }

        public setActiveTab(tab: TabType): void {
            this.state = { activeTab: tab };
        }

        public clearMessages(): void {
            this.messages = [];
        }
    }

    let mockApi: MockVSCodeAPIWrapper;

    setup(() => {
        mockApi = new MockVSCodeAPIWrapper();
    });

    test('openExternal should send correct message', () => {
        const url = 'https://example.com';
        mockApi.openExternal(url);

        assert.strictEqual(mockApi.messages.length, 1);
        assert.deepStrictEqual(mockApi.messages[0], {
            command: 'openExternal',
            url: 'https://example.com'
        });
    });

    test('formatSchema should send correct message', () => {
        mockApi.formatSchema();

        assert.strictEqual(mockApi.messages.length, 1);
        assert.deepStrictEqual(mockApi.messages[0], {
            command: 'formatSchema'
        });
    });

    test('goToPosition should send correct message with position', () => {
        const position: [number, number, number, number] = [1, 2, 3, 4];
        mockApi.goToPosition(position);

        assert.strictEqual(mockApi.messages.length, 1);
        assert.deepStrictEqual(mockApi.messages[0], {
            command: 'goToPosition',
            position: [1, 2, 3, 4]
        });
    });

    test('setActiveTab and getActiveTab should work correctly for lint tab', () => {
        mockApi.setActiveTab('lint');
        assert.strictEqual(mockApi.getActiveTab(), 'lint');
    });

    test('setActiveTab and getActiveTab should work correctly for format tab', () => {
        mockApi.setActiveTab('format');
        assert.strictEqual(mockApi.getActiveTab(), 'format');
    });

    test('setActiveTab and getActiveTab should work correctly for metaschema tab', () => {
        mockApi.setActiveTab('metaschema');
        assert.strictEqual(mockApi.getActiveTab(), 'metaschema');
    });

    test('getActiveTab should return undefined when no tab is set', () => {
        const freshApi = new MockVSCodeAPIWrapper();
        assert.strictEqual(freshApi.getActiveTab(), undefined);
    });

    test('multiple messages should be tracked correctly', () => {
        mockApi.openExternal('https://github.com');
        mockApi.formatSchema();
        mockApi.goToPosition([10, 20, 30, 40]);

        assert.strictEqual(mockApi.messages.length, 3);
        assert.strictEqual(mockApi.messages[0].command, 'openExternal');
        assert.strictEqual(mockApi.messages[1].command, 'formatSchema');
        assert.strictEqual(mockApi.messages[2].command, 'goToPosition');
    });

    test('setActiveTab should overwrite previous tab state', () => {
        mockApi.setActiveTab('lint');
        assert.strictEqual(mockApi.getActiveTab(), 'lint');

        mockApi.setActiveTab('format');
        assert.strictEqual(mockApi.getActiveTab(), 'format');

        mockApi.setActiveTab('metaschema');
        assert.strictEqual(mockApi.getActiveTab(), 'metaschema');
    });
});
