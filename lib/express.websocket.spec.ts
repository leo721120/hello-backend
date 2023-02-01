import express from '@io/lib/express'
//
describe('express', function () {
    const app = express().ws('/testonly/ws', function (ws, req) {
        ws.on('message', function (byte) {
            const text = byte.toString();
            ws.send(JSON.stringify({
                echo: 123,
                text,
            }));
        });
    });
    beforeAll(function (done) {
        app.listen(done);
    });
    afterAll(function (done) {
        app.websocket().close(done);
    });
    it('.ws', async function () {
        const events = await import('node:events');
        const ws = express.websocket(app, '/testonly/ws');
        await events.default.once(ws, 'open');
        const done = events.default.once(ws, 'message');
        ws.send('abc123');
        const [text] = await done;
        expect(JSON.parse(text)).toEqual({
            echo: 123,
            text: 'abc123',
        });
    });
});