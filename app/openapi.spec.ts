import express from '@io/lib/express.fetch'
//
describe('openapi', function () {
    const app = express();
    //
    beforeAll(async function () {
        await app.setup(await import('@io/app/domain'));
    });
    it('.on', async function () {
        app.get('/abc', function (req, res) {
            res.status(200).end();
        });
        const events = await import('node:events');
        const done = events.default.once(app, 'event');
        await express.fetch(app).get('/abc');
        {
            const [e] = await done;
            expect(e).toEqual({
                data: undefined,
                datacontenttype: 'application/json',
                id: expect.any(String),
                source: '/abc',
                specversion: '1.0',
                time: expect.any(String),
                type: 'GET',
            });
        }
    });
    it('/openapi, json', async function () {
        const res = await express
            .fetch(app)
            .get('/openapi')
            .accept('json')
            ;
        expect(res.status).toBe(200);
        expect(res.body).toEqual(expect.objectContaining({
            openapi: expect.any(String),
        }));
    });
});