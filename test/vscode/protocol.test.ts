import * as assert from 'assert';
import type { Position, LintError, MetaschemaError, WebviewToExtensionMessage } from '../../protocol/types';

suite('Protocol Types', () => {
    test('Position type should represent a four-element numeric tuple', () => {
        const position: Position = [1, 2, 3, 4];
        assert.strictEqual(position.length, 4);
        assert.strictEqual(position[0], 1);
        assert.strictEqual(position[1], 2);
        assert.strictEqual(position[2], 3);
        assert.strictEqual(position[3], 4);
    });

    test('LintError position should accept Position type', () => {
        const error: LintError = {
            id: 'test-rule',
            message: 'Test error',
            path: '/',
            schemaLocation: '/',
            position: [10, 5, 10, 20]
        };
        assert.ok(error.position);
        assert.strictEqual(error.position[0], 10);
        assert.strictEqual(error.position[1], 5);
    });

    test('LintError position should accept null', () => {
        const error: LintError = {
            id: 'test-rule',
            message: 'Test error',
            path: '/',
            schemaLocation: '/',
            position: null
        };
        assert.strictEqual(error.position, null);
    });

    test('MetaschemaError instancePosition should accept Position type', () => {
        const error: MetaschemaError = {
            error: 'Validation error',
            instanceLocation: '/foo',
            keywordLocation: '/properties/foo',
            instancePosition: [3, 1, 3, 10]
        };
        assert.ok(error.instancePosition);
        assert.strictEqual(error.instancePosition[0], 3);
        assert.strictEqual(error.instancePosition[1], 1);
    });

    test('MetaschemaError instancePosition should be optional', () => {
        const error: MetaschemaError = {
            error: 'Validation error',
            instanceLocation: '/foo',
            keywordLocation: '/properties/foo'
        };
        assert.strictEqual(error.instancePosition, undefined);
    });

    test('WebviewToExtensionMessage position should accept Position type', () => {
        const message: WebviewToExtensionMessage = {
            command: 'goToPosition',
            position: [5, 3, 5, 15]
        };
        assert.ok(message.position);
        assert.strictEqual(message.position[0], 5);
        assert.strictEqual(message.position[3], 15);
    });
});
