import express from '@io/lib/express.fetch'
//
describe('express/req', function () {
    it('.tracecontext', async function () {
        const app = express().get('/abc', async function (req, res) {
            const text = req.tracecontext().traceparent();
            res.status(200).json({ text });
        });
        const res = await express
            .fetch(app)
            .get('/abc')
            ;
        expect(res.body.text).toEqual(expect.any(String));
    });
    it('.querystrings', async function () {
        const app = express().get('/abc', async function (req, res) {
            const list = req.querystrings('qa');
            res.status(200).json({ list });
        });
        const res = await express
            .fetch(app)
            .get('/abc?qa=123')
            ;
        expect(res.body.list).toEqual([
            '123',
        ]);
    });
});