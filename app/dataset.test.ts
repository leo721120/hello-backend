import express from '@io/lib/express'
//
describe('dataset', function () {
    const app = express();
    //
    beforeAll(async function () {
        await app.setup(await import('@io/app/domain'));
    });
    afterAll(function () {
        app.emit('close');
    });
    it('.ttl', async function () {
        const dataset = app.service('dataset');
        const timeout = 300;
        const called = [];
        dataset.feed('testonly', async function () {
            dataset.ttl('testonly', { timeout });
            called.push(called.length);
            return called.length;
        });
        {
            const a = await dataset.find('testonly');
            expect(a).toBe(1);
        }
        await Promise.sleep(timeout);
        {// expired
            const a = await dataset.find('testonly');
            expect(a).toBe(2);
        }
        {// still cached
            const a = await dataset.find('testonly');
            expect(a).toBe(2);
        }
    });
    it('.ttl, emit event when expired', async function () {
        const { EventEmitter } = await import('node:events');
        const dataset = app.service('dataset');
        const timeout = 300;
        const called = [0, 1];
        const done = EventEmitter.once(app, 'event');
        dataset.feed('testonly', async function () {
            dataset.ttl('testonly', { timeout });
            called.push(called.length);
            return called.length;
        });
        {
            const a = await dataset.find('testonly');
            expect(a).toBe(3);
        }
        await Promise.sleep(timeout);
        const [ev] = await done;
        {
            expect(ev).toEqual({
                source: 'testonly',
                type: 'DataSet.ItemExpired',
                data: { key: 'testonly' },
            });
        }
    });
    it('.ttl, no active if no one need data', async function () {
        const dataset = app.service('dataset');
        const timeout = 300;
        const called = [];
        dataset.feed('testonly', async function () {
            dataset.ttl('testonly', { timeout });
            called.push(called.length);
            return called.length;
        });
        {
            const a = await dataset.find('testonly');
            expect(a).toBe(1);
        }
        await Promise.sleep(timeout + 100);
        {
            expect(called.length).toBe(1);
        }
    });
    it.each([
        [100],
        [1000],
        [10000],
        [100000],
    ])('.ttl, large items %d', async function (size) {
        const items = Array(size).fill(true);
        const dataset = app.service('dataset');
        const timeout = 300;
        items.forEach(function (_, idx) {
            const key = `testonly/${idx}`;
            dataset.feed(key, async function () {
                dataset.ttl(key, { timeout });
                return key;
            });
        });
        await Promise.sleep(timeout + 100);
        await Promise.all(
            items.map(async function (_, idx) {
                const key = `testonly/${idx}`;
                const a = await dataset.find(key);
                expect(a).toBe(key);
            })
        );
    });
});