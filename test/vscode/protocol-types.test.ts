import * as assert from 'assert';
import type { Position, LintError, MetaschemaError, WebviewToExtensionMessage } from '../../protocol/types';

suite('Protocol Types', () => {
    test('Position type should be a 4-element number tuple', () => {
        const position: Position = [1, 2, 3, 4];
        assert.strictEqual(position.length, 4);
        assert.strictEqual(typeof position[0], 'number');
        assert.strictEqual(typeof position[1], 'number');
        assert.strictEqual(typeof position[2], 'number');
        assert.strictEqual(typeof position[3], 'number');
    });

    test('LintError position should accept Position type', () => {
        const position: Position = [10, 5, 10, 20];
        const error: LintError = {
            id: 'test-rule',
            message: 'Test error',
            path: '/',
            schemaLocation: '/',
            position
        };
        assert.deepStrictEqual(error.position, [10, 5, 10, 20]);
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
        const position: Position = [1, 1, 5, 10];
        const error: MetaschemaError = {
            error: 'Validation error',
            instanceLocation: '/',
            keywordLocation: '/',
            instancePosition: position
        };
        assert.deepStrictEqual(error.instancePosition, [1, 1, 5, 10]);
    });

    test('MetaschemaError instancePosition should be optional', () => {
        const error: MetaschemaError = {
            error: 'Validation error',
            instanceLocation: '/',
            keywordLocation: '/'
        };
        assert.strictEqual(error.instancePosition, undefined);
    });

    test('WebviewToExtensionMessage position should accept Position type', () => {
        const position: Position = [3, 7, 3, 15];
        const message: WebviewToExtensionMessage = {
            command: 'goToPosition',
            position
        };
        assert.deepStrictEqual(message.position, [3, 7, 3, 15]);
    });
});
