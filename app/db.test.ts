import express from '@io/lib/express'
//
describe('db', function () {
    const app = express();

    beforeAll(async function () {
        await app.setup(await import('@io/app/domain'));
    });
    it('.query', async function () {
        const db = app.service('db');
        await db.authenticate();
    });
    it('.on', async function () {
        const events = await import('node:events');
        const done = events.default.once(app, 'event');
        const db = app.service('db');
        await db.authenticate();
        const [e] = await done;
        expect(e).toEqual({
            elapse: expect.any(Number),
            text: 'Executed (default): SELECT 1+1 AS result',
        });
    });
});