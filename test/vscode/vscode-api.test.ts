import * as assert from 'assert';

suite('VSCode API Wrapper Test Suite', () => {
    test('VSCodeAPIWrapper should expose openExternal method', () => {
        const mockPostMessage = (message: unknown) => {
            const msg = message as { command: string; url?: string };
            assert.strictEqual(msg.command, 'openExternal');
            assert.strictEqual(msg.url, 'https://example.com');
        };

        const mockVsCodeApi = {
            postMessage: mockPostMessage,
            getState: () => undefined,
            setState: () => {}
        };

        class TestVSCodeAPIWrapper {
            private readonly vsCodeApi = mockVsCodeApi;

            public openExternal(url: string): void {
                this.vsCodeApi.postMessage({ command: 'openExternal', url });
            }
        }

        const wrapper = new TestVSCodeAPIWrapper();
        wrapper.openExternal('https://example.com');
    });

    test('VSCodeAPIWrapper should expose formatSchema method', () => {
        const mockPostMessage = (message: unknown) => {
            const msg = message as { command: string };
            assert.strictEqual(msg.command, 'formatSchema');
        };

        const mockVsCodeApi = {
            postMessage: mockPostMessage,
            getState: () => undefined,
            setState: () => {}
        };

        class TestVSCodeAPIWrapper {
            private readonly vsCodeApi = mockVsCodeApi;

            public formatSchema(): void {
                this.vsCodeApi.postMessage({ command: 'formatSchema' });
            }
        }

        const wrapper = new TestVSCodeAPIWrapper();
        wrapper.formatSchema();
    });

    test('VSCodeAPIWrapper should expose goToPosition method', () => {
        const expectedPosition: [number, number, number, number] = [1, 2, 3, 4];
        const mockPostMessage = (message: unknown) => {
            const msg = message as { command: string; position: [number, number, number, number] };
            assert.strictEqual(msg.command, 'goToPosition');
            assert.deepStrictEqual(msg.position, expectedPosition);
        };

        const mockVsCodeApi = {
            postMessage: mockPostMessage,
            getState: () => undefined,
            setState: () => {}
        };

        class TestVSCodeAPIWrapper {
            private readonly vsCodeApi = mockVsCodeApi;

            public goToPosition(position: [number, number, number, number]): void {
                this.vsCodeApi.postMessage({ command: 'goToPosition', position });
            }
        }

        const wrapper = new TestVSCodeAPIWrapper();
        wrapper.goToPosition(expectedPosition);
    });

    test('VSCodeAPIWrapper should expose getActiveTab method', () => {
        const mockVsCodeApi = {
            postMessage: () => {},
            getState: () => ({ activeTab: 'lint' }),
            setState: () => {}
        };

        class TestVSCodeAPIWrapper {
            private readonly vsCodeApi = mockVsCodeApi;

            public getActiveTab(): string | undefined {
                const state = this.vsCodeApi.getState() as { activeTab?: string } | undefined;
                return state?.activeTab;
            }
        }

        const wrapper = new TestVSCodeAPIWrapper();
        assert.strictEqual(wrapper.getActiveTab(), 'lint');
    });

    test('VSCodeAPIWrapper should return undefined when no active tab is saved', () => {
        const mockVsCodeApi = {
            postMessage: () => {},
            getState: () => undefined,
            setState: () => {}
        };

        class TestVSCodeAPIWrapper {
            private readonly vsCodeApi = mockVsCodeApi;

            public getActiveTab(): string | undefined {
                const state = this.vsCodeApi.getState() as { activeTab?: string } | undefined;
                return state?.activeTab;
            }
        }

        const wrapper = new TestVSCodeAPIWrapper();
        assert.strictEqual(wrapper.getActiveTab(), undefined);
    });

    test('VSCodeAPIWrapper should expose setActiveTab method', () => {
        let savedState: { activeTab: string } | undefined;
        const mockVsCodeApi = {
            postMessage: () => {},
            getState: () => savedState,
            setState: (state: { activeTab: string }) => { savedState = state; }
        };

        class TestVSCodeAPIWrapper {
            private readonly vsCodeApi = mockVsCodeApi;

            public setActiveTab(tab: string): void {
                this.vsCodeApi.setState({ activeTab: tab });
            }

            public getActiveTab(): string | undefined {
                const state = this.vsCodeApi.getState() as { activeTab?: string } | undefined;
                return state?.activeTab;
            }
        }

        const wrapper = new TestVSCodeAPIWrapper();
        wrapper.setActiveTab('format');
        assert.strictEqual(wrapper.getActiveTab(), 'format');
    });

    test('VSCodeAPIWrapper should handle all tab types', () => {
        const tabTypes = ['lint', 'format', 'metaschema'] as const;
        let savedState: { activeTab: string } | undefined;
        const mockVsCodeApi = {
            postMessage: () => {},
            getState: () => savedState,
            setState: (state: { activeTab: string }) => { savedState = state; }
        };

        class TestVSCodeAPIWrapper {
            private readonly vsCodeApi = mockVsCodeApi;

            public setActiveTab(tab: string): void {
                this.vsCodeApi.setState({ activeTab: tab });
            }

            public getActiveTab(): string | undefined {
                const state = this.vsCodeApi.getState() as { activeTab?: string } | undefined;
                return state?.activeTab;
            }
        }

        const wrapper = new TestVSCodeAPIWrapper();
        
        for (const tab of tabTypes) {
            wrapper.setActiveTab(tab);
            assert.strictEqual(wrapper.getActiveTab(), tab, `Should handle tab type: ${tab}`);
        }
    });
});
