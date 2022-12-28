import express from '@io/lib/express'
//
describe('db', function () {
    const app = express();

    beforeAll(async function () {
        await app.setup(await import('@io/app/domain'));
    });
    it('.query', async function () {
        const db = await app.service('db');
        await db.authenticate();
    });
});