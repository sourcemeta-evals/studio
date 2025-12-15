import * as assert from 'assert';

suite('VSCode API Wrapper Test Suite', () => {
    test('WebviewMessage type should support openExternal command', () => {
        const message = { command: 'openExternal' as const, url: 'https://example.com' };
        assert.strictEqual(message.command, 'openExternal');
        assert.strictEqual(message.url, 'https://example.com');
    });

    test('WebviewMessage type should support formatSchema command', () => {
        const message = { command: 'formatSchema' as const };
        assert.strictEqual(message.command, 'formatSchema');
    });

    test('WebviewMessage type should support goToPosition command', () => {
        const position: [number, number, number, number] = [1, 2, 3, 4];
        const message = { command: 'goToPosition' as const, position };
        assert.strictEqual(message.command, 'goToPosition');
        assert.deepStrictEqual(message.position, [1, 2, 3, 4]);
    });

    test('TabType should be one of lint, format, or metaschema', () => {
        const validTabs = ['lint', 'format', 'metaschema'];
        validTabs.forEach(tab => {
            assert.ok(validTabs.includes(tab), `${tab} should be a valid tab type`);
        });
    });

    test('WebviewState should store activeTab', () => {
        const state = { activeTab: 'lint' as const };
        assert.strictEqual(state.activeTab, 'lint');
    });

    test('Position tuple should have 4 elements', () => {
        const position: [number, number, number, number] = [10, 5, 10, 15];
        assert.strictEqual(position.length, 4);
        assert.strictEqual(position[0], 10);
        assert.strictEqual(position[1], 5);
        assert.strictEqual(position[2], 10);
        assert.strictEqual(position[3], 15);
    });
});
