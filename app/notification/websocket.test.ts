import express from '@io/app/express'
//
describe('websocket', function () {
    const app = express();
    //
    beforeAll(async function () {
        await app.setup(await import('@io/app/domain'));
        await new Promise(function (done) {
            app.listen(done);
        });
    });
    afterAll(function (done) {
        app.websocket().close(done);
    });
    it('.on, WebSocket.Message', async function () {
        const events = await import('node:events');
        const ws = app.websocket().connect('/ws');
        await events.default.once(ws, 'open');
        const done = events.default.once(app, 'WebSocket.Message');
        ws.send(JSON.stringify({
            text: 'abc123',
        }));
        const [ce] = await done;
        expect(ce).toEqual(expect.objectContaining({
            id: expect.any(String),
            //time: expect.any(String),
            type: 'WebSocket.Message',
            source: '/ws/.websocket',
        }));
        expect(ce.data.json()).toEqual({
            text: 'abc123',
        });
    });
});